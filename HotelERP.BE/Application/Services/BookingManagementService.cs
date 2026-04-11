using HotelERP.BE.Application.DTOs.BookingManagement;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Constants;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using HotelERP.BE.DTOs.Hubs;

namespace HotelERP.BE.Application.Services;

public class BookingManagementService : IBookingManagementService
{
    private readonly HotelDbContext _context;
    private readonly IHubContext<RoomHub>? _hubContext;
    private static readonly Dictionary<string, List<string>> _allowedTransitions = new()
    {
        { BookingStatus.Pending,    new List<string> { BookingStatus.Confirmed, BookingStatus.Cancelled } },
        { BookingStatus.Confirmed,  new List<string> { BookingStatus.CheckedIn, BookingStatus.Cancelled } },
        { BookingStatus.CheckedIn,  new List<string> { BookingStatus.Completed } },
        { BookingStatus.Holding,    new List<string> { BookingStatus.Confirmed, BookingStatus.Cancelled } },
    };

    public BookingManagementService(HotelDbContext context, IHubContext<RoomHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    // ==============================================================
    // API 1: SEARCH + FILTER BOOKINGS (có phân trang)
    // ==============================================================
    public async Task<PagedResult<BookingListItemDto>> SearchBookingsAsync(BookingSearchRequest request)
    {
        var query = _context.Bookings
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .AsQueryable();

        // --- Filter theo keyword (GuestName, Phone, Email, BookingCode) ---
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();
            query = query.Where(b =>
                (b.GuestName != null && b.GuestName.ToLower().Contains(keyword)) ||
                (b.GuestPhone != null && b.GuestPhone.ToLower().Contains(keyword)) ||
                (b.GuestEmail != null && b.GuestEmail.ToLower().Contains(keyword)) ||
                b.BookingCode.ToLower().Contains(keyword)
            );
        }

        // --- Filter theo trạng thái ---
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            query = query.Where(b => b.Status == request.Status);
        }

        // --- Filter theo Date Range (dựa trên DateFilterType) ---
        if (request.FromDate.HasValue || request.ToDate.HasValue)
        {
            var fromDate = request.FromDate?.Date;
            var toDate = request.ToDate?.Date.AddDays(1); // inclusive end

            switch (request.FilterType)
            {
                case DateFilterType.CheckInDate:
                    if (fromDate.HasValue) query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate >= fromDate.Value));
                    if (toDate.HasValue) query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate < toDate.Value));
                    break;
                case DateFilterType.CheckOutDate:
                    if (fromDate.HasValue) query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckOutDate >= fromDate.Value));
                    if (toDate.HasValue) query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckOutDate < toDate.Value));
                    break;
                case DateFilterType.BookedDate:
                    if (fromDate.HasValue) query = query.Where(b => b.CreatedAt >= fromDate.Value);
                    if (toDate.HasValue) query = query.Where(b => b.CreatedAt < toDate.Value);
                    break;
            }
        }

        // --- Đếm tổng ---
        var totalCount = await query.CountAsync();

        // --- Phân trang + sắp xếp (mới nhất trước) ---
        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResult<BookingListItemDto>
        {
            Items = bookings.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    // ==============================================================
    // API 2: CẬP NHẬT TRẠNG THÁI BOOKING (CẢ ĐOÀN)
    // ==============================================================
    public async Task<(bool Success, string Message)> UpdateBookingStatusAsync(int bookingId, string newStatus)
    {
        var booking = await _context.Bookings
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            return (false, "Không tìm thấy booking.");

        // Kiểm tra trạng thái hiện tại có được phép chuyển không (Thêm CheckedOut vào quy trình)
        if (!_allowedTransitions.TryGetValue(booking.Status, out var allowedNextStatuses))
            allowedNextStatuses = new List<string>(); // Dự phòng nếu status lạ

        // Cho phép nhảy trạng thái linh hoạt hơn cho quy trình Checkout
        var oldStatus = booking.Status;
        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        // Đồng bộ trạng thái xuống BookingDetails và cập nhật trạng thái phòng thực tế
        if (newStatus == BookingStatus.CheckedIn)
        {
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.Status != BookingStatus.Cancelled && detail.Status != BookingStatus.CheckedIn)
                {
                    detail.Status = BookingStatus.CheckedIn;
                    detail.ActualCheckInAt = DateTime.UtcNow;
                    detail.UpdatedAt = DateTime.UtcNow;

                    if (detail.Room != null)
                    {
                        detail.Room.Status = RoomPhysicalStatus.Occupied;
                        detail.Room.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
        }
        else if (newStatus == BookingStatus.CheckedOut || newStatus == BookingStatus.Completed)
        {
            foreach (var detail in booking.BookingDetails)
            {
                // Chỉ giải phóng những phòng đang ở hoặc đang đợi thanh toán
                if (detail.Status == BookingStatus.CheckedIn || (newStatus == BookingStatus.Completed && detail.Status == BookingStatus.CheckedOut))
                {
                    detail.Status = newStatus;
                    if (newStatus == BookingStatus.CheckedOut) detail.ActualCheckOutAt = DateTime.UtcNow;
                    detail.UpdatedAt = DateTime.UtcNow;

                    // GIẢI PHÓNG PHÒNG NGAY LẬP TỨC
                    if (detail.Room != null)
                    {
                        detail.Room.Status = RoomPhysicalStatus.Available;
                        detail.Room.CleaningStatus = CleaningStatus.Dirty;
                        detail.Room.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
        }
        else if (newStatus == BookingStatus.Cancelled)
        {
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.Status == BookingStatus.CheckedIn && detail.Room != null)
                {
                    detail.Room.Status = RoomPhysicalStatus.Available;
                }
                
                detail.Status = BookingStatus.Cancelled;
                detail.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        // Bắn SignalR realtime → cập nhật cột Kinh doanh trên trang Quản lý Quỹ phòng
        if (_hubContext != null)
        {
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.Room != null)
                    await _hubContext.Clients.All.SendAsync("ReceiveRoomStatusUpdate",
                        detail.Room.Id, detail.Room.Status, detail.Room.CleaningStatus);
            }
        }

        return (true, $"Đã chuyển trạng thái booking #{bookingId} từ '{oldStatus}' sang '{newStatus}' thành công.");
    }

    // ==============================================================
    // API 5: CẬP NHẬT TRẠNG THÁI TỪNG PHÒNG LẺ (INDIVIDUAL ROOM)
    // ==============================================================
    public async Task<(bool Success, string Message)> UpdateBookingDetailStatusAsync(int detailId, string newStatus)
    {
        var detail = await _context.BookingDetails
            .Include(bd => bd.Room)
            .Include(bd => bd.Booking)
                .ThenInclude(b => b!.BookingDetails)
            .FirstOrDefaultAsync(bd => bd.Id == detailId);

        if (detail == null) return (false, "Không tìm thấy chi tiết đặt phòng.");
        if (detail.Booking == null) return (false, "Dữ liệu booking cha bị lỗi.");

        var oldDetailStatus = detail.Status;

        // 1. Cập nhật trạng thái cho Detail và Room
        if (newStatus == BookingStatus.CheckedIn)
        {
            if (oldDetailStatus == BookingStatus.CheckedIn) return (false, "Phòng này đã check-in rồi.");
            
            detail.Status = BookingStatus.CheckedIn;
            detail.ActualCheckInAt = DateTime.UtcNow;
            
            if (detail.Room != null)
            {
                detail.Room.Status = RoomPhysicalStatus.Occupied;
                detail.Room.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (newStatus == BookingStatus.CheckedOut || newStatus == BookingStatus.Completed)
        {
            // Cho phép chuyển từ CheckedIn -> CheckedOut -> Completed
            if (newStatus == BookingStatus.CheckedOut && oldDetailStatus != BookingStatus.CheckedIn)
                return (false, "Phòng phải ở trạng thái Checked_in mới có thể báo trả phòng (Checkout).");

            detail.Status = newStatus;
            if (newStatus == BookingStatus.CheckedOut) detail.ActualCheckOutAt = DateTime.UtcNow;
            
            // GIẢI PHÓNG PHÒNG NGAY KHI CHECKOUT (Ưu tiên logic bẩn/sẵn sàng cho buồng phòng)
            if (detail.Room != null)
            {
                detail.Room.Status = RoomPhysicalStatus.Available;
                detail.Room.CleaningStatus = CleaningStatus.Dirty;
                detail.Room.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (newStatus == BookingStatus.Cancelled)
        {
            if (oldDetailStatus == BookingStatus.CheckedIn && detail.Room != null)
            {
                detail.Room.Status = RoomPhysicalStatus.Available;
            }
            detail.Status = BookingStatus.Cancelled;
        }

        detail.UpdatedAt = DateTime.UtcNow;

        // 2. Tự động đồng bộ trạng thái lên Booking cha
        var allDetails = detail.Booking.BookingDetails.Where(d => d.Status != BookingStatus.Cancelled).ToList();
        
        if (newStatus == BookingStatus.CheckedIn || newStatus == BookingStatus.CheckedOut)
        {
            // Nếu có ít nhất 1 phòng đã checkin/checkout, booking tổng phải ở trạng thái tương ứng
            if (detail.Booking.Status != newStatus)
            {
                detail.Booking.Status = newStatus;
                detail.Booking.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (newStatus == BookingStatus.Completed)
        {
            if (allDetails.All(d => d.Status == BookingStatus.Completed))
            {
                detail.Booking.Status = BookingStatus.Completed;
                detail.Booking.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        // Bắn SignalR realtime cho trang Quản lý Quỹ phòng
        if (_hubContext != null && detail.Room != null)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveRoomStatusUpdate",
                detail.Room.Id, detail.Room.Status, detail.Room.CleaningStatus);
        }

        return (true, $"Đã cập nhật trạng thái phòng lẻ #{detailId} sang '{newStatus}' thành công.");
    }

    // ==============================================================
    // API 3: KHÁCH ĐẾN HÔM NAY (HIỂN THỊ THEO PHÒNG LẺ CHƯA NHẬN)
    // ==============================================================
    public async Task<List<BookingListItemDto>> GetTodayArrivalsAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        // Truy vấn trực tiếp vào BookingDetails để lấy danh sách phòng lẻ
        var arrivalDetails = await _context.BookingDetails
            .Include(bd => bd.Booking)
            .Include(bd => bd.Room)
            .Include(bd => bd.RoomType)
            .Where(bd => bd.CheckInDate >= today && bd.CheckInDate < tomorrow &&
                        bd.Status != BookingStatus.CheckedIn && 
                        bd.Status != BookingStatus.Cancelled &&
                        bd.Status != BookingStatus.CancelledByAdmin &&
                        bd.Status != BookingStatus.Completed)
            .OrderBy(bd => bd.CheckInDate)
            .ToListAsync();

        // Map mỗi Detail thành một BookingListItemDto (Flattened)
        return arrivalDetails.Select(bd => new BookingListItemDto
        {
            Id = bd.Booking?.Id ?? 0,
            BookingCode = bd.Booking?.BookingCode ?? "N/A",
            GuestName = bd.Booking?.GuestName,
            GuestPhone = bd.Booking?.GuestPhone,
            GuestEmail = bd.Booking?.GuestEmail,
            Status = bd.Booking?.Status ?? "N/A",
            BookedAt = bd.Booking?.BookedAt ?? DateTime.MinValue,
            FinalAmount = bd.Booking?.FinalAmount ?? 0,
            DepositAmount = bd.Booking?.DepositAmount ?? 0,
            PaymentStatus = bd.Booking?.PaymentStatus ?? "N/A",
            Notes = bd.Booking?.Notes,
            CreatedAt = bd.Booking?.CreatedAt ?? DateTime.MinValue,
            Details = new List<BookingDetailItemDto> { MapDetailToDto(bd) }
        }).ToList();
    }

    // ==============================================================
    // API 4: KHÁCH ĐANG LƯU TRÚ (HIỂN THỊ THEO PHÒNG LẺ ĐANG Ở)
    // ==============================================================
    public async Task<List<BookingListItemDto>> GetInHouseGuestsAsync()
    {
        // Truy vấn trực tiếp vào BookingDetails để lấy danh sách phòng lẻ đang ở
        var inHouseDetails = await _context.BookingDetails
            .Include(bd => bd.Booking)
            .Include(bd => bd.Room)
            .Include(bd => bd.RoomType)
            .Where(bd => bd.Status == BookingStatus.CheckedIn)
            .OrderBy(bd => bd.ActualCheckInAt)
            .ToListAsync();

        // Map mỗi Detail thành một BookingListItemDto (Flattened)
        return inHouseDetails.Select(bd => new BookingListItemDto
        {
            Id = bd.Booking?.Id ?? 0,
            BookingCode = bd.Booking?.BookingCode ?? "N/A",
            GuestName = bd.Booking?.GuestName,
            GuestPhone = bd.Booking?.GuestPhone,
            GuestEmail = bd.Booking?.GuestEmail,
            Status = bd.Booking?.Status ?? "N/A",
            BookedAt = bd.Booking?.BookedAt ?? DateTime.MinValue,
            FinalAmount = bd.Booking?.FinalAmount ?? 0,
            DepositAmount = bd.Booking?.DepositAmount ?? 0,
            PaymentStatus = bd.Booking?.PaymentStatus ?? "N/A",
            Notes = bd.Booking?.Notes,
            CreatedAt = bd.Booking?.CreatedAt ?? DateTime.MinValue,
            Details = new List<BookingDetailItemDto> { MapDetailToDto(bd) }
        }).ToList();
    }

    // ==============================================================
    // API 6: KHÁCH RỜI ĐI HÔM NAY (HIỂN THỊ THEO PHÒNG LẺ CẦN TRẢ)
    // ==============================================================
    public async Task<List<BookingListItemDto>> GetTodayDeparturesAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        // Lọc các phòng lẻ: 
        // 1. Ngày trả phòng <= hôm nay (lấy cả khách quá hạn chưa trả)
        // 2. Trạng thái hiện tại phải là đang ở (Checked_in)
        var departureDetails = await _context.BookingDetails
            .Include(bd => bd.Booking)
            .Include(bd => bd.Room)
            .Include(bd => bd.RoomType)
            .Where(bd => bd.CheckOutDate < tomorrow && bd.Status == BookingStatus.CheckedIn)
            .OrderBy(bd => bd.CheckOutDate)
            .ToListAsync();

        // Map mỗi Detail thành một BookingListItemDto (Flattened)
        return departureDetails.Select(bd => new BookingListItemDto
        {
            Id = bd.Booking?.Id ?? 0,
            BookingCode = bd.Booking?.BookingCode ?? "N/A",
            GuestName = bd.Booking?.GuestName,
            GuestPhone = bd.Booking?.GuestPhone,
            GuestEmail = bd.Booking?.GuestEmail,
            Status = bd.Booking?.Status ?? "N/A",
            BookedAt = bd.Booking?.BookedAt ?? DateTime.MinValue,
            FinalAmount = bd.Booking?.FinalAmount ?? 0,
            DepositAmount = bd.Booking?.DepositAmount ?? 0,
            PaymentStatus = bd.Booking?.PaymentStatus ?? "N/A",
            Notes = bd.Booking?.Notes,
            CreatedAt = bd.Booking?.CreatedAt ?? DateTime.MinValue,
            Details = new List<BookingDetailItemDto> { MapDetailToDto(bd) }
        }).ToList();
    }

    // ==============================================================
    // API 7: ĐỔI PHÒNG CHO KHÁCH (ROOM CHANGE)
    // ==============================================================
    public async Task<(bool Success, string Message)> ChangeRoomAsync(int detailId, int newRoomId)
    {
        var detail = await _context.BookingDetails
            .Include(bd => bd.Room)
            .Include(bd => bd.Booking)
            .FirstOrDefaultAsync(bd => bd.Id == detailId);

        if (detail == null) return (false, "Không tìm thấy chi tiết đặt phòng.");
        if (detail.Status == BookingStatus.Completed || detail.Status == BookingStatus.Cancelled) 
            return (false, "Không thể đổi phòng cho đơn đặt đã hoàn thành hoặc bị hủy.");

        // 1. Tìm phòng mới
        var newRoom = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == newRoomId);
        if (newRoom == null) return (false, "Không tìm thấy phòng mới.");
        if (newRoom.Status != RoomPhysicalStatus.Available)
            return (false, $"Phòng {newRoom.RoomNumber} hiện không sẵn sàng (Trạng thái: {newRoom.Status}).");

        var oldRoomNumber = detail.Room?.RoomNumber ?? "N/A";
        var oldRoom = detail.Room;

        // 2. Giải phóng phòng cũ (nếu có)
        if (oldRoom != null)
        {
            oldRoom.Status = RoomPhysicalStatus.Available;
            oldRoom.CleaningStatus = CleaningStatus.Dirty; // Đánh dấu bẩn để buồng phòng kiểm tra
            oldRoom.UpdatedAt = DateTime.UtcNow;
        }

        // 3. Cập nhật phòng mới vào BookingDetail
        detail.RoomId = newRoom.Id;
        detail.RoomTypeId = newRoom.RoomTypeId; // Tự động cập nhật theo loại phòng của phòng thực tế
        detail.UpdatedAt = DateTime.UtcNow;

        // 4. Chiếm phòng mới (nếu khách đã check-in thì đổi sang Occupied)
        if (detail.Status == BookingStatus.CheckedIn)
        {
            newRoom.Status = RoomPhysicalStatus.Occupied;
        }
        else
        {
            newRoom.Status = RoomPhysicalStatus.Occupied; // Thường thì khi đổi trong Arrivals là để gán giữ chỗ ngay
        }
        newRoom.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, $"Đã đổi từ phòng {oldRoomNumber} sang phòng {newRoom.RoomNumber} thành công.");
    }

    // ==============================================================
    // HELPER: Map BookingDetail entity → BookingDetailItemDto
    // ==============================================================
    private static BookingDetailItemDto MapDetailToDto(Domain.Models.BookingDetail bd)
    {
        return new BookingDetailItemDto
        {
            Id = bd.Id,
            RoomId = bd.RoomId,
            RoomNumber = bd.Room?.RoomNumber,
            RoomTypeName = bd.RoomType?.Name,
            CheckInDate = bd.CheckInDate,
            CheckOutDate = bd.CheckOutDate,
            PricePerNight = bd.PricePerNight,
            Nights = bd.Nights,
            LineTotal = bd.LineTotal,
            Status = bd.Status,
            ActualCheckInAt = bd.ActualCheckInAt,
            ActualCheckOutAt = bd.ActualCheckOutAt
        };
    }

    // ==============================================================
    // HELPER: Map Booking entity → BookingListItemDto
    // ==============================================================
    private static BookingListItemDto MapToDto(Domain.Models.Booking b)
    {
        return new BookingListItemDto
        {
            Id = b.Id,
            BookingCode = b.BookingCode,
            GuestName = b.GuestName,
            GuestPhone = b.GuestPhone,
            GuestEmail = b.GuestEmail,
            Status = b.Status,
            BookedAt = b.BookedAt,
            FinalAmount = b.FinalAmount,
            DepositAmount = b.DepositAmount,
            PaymentStatus = b.PaymentStatus,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            Details = b.BookingDetails.Select(MapDetailToDto).ToList()
        };
    }

    // ==============================================================
    // API 8: NẠP CỌC (DEPOSIT)
    // ==============================================================
    public async Task<(bool Success, string Message, decimal NewDeposit)> AddDepositAsync(int bookingId, decimal amount)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null) return (false, "Không tìm thấy booking.", 0);

        if (booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.CancelledByAdmin)
            return (false, "Không thể nạp cọc cho booking đã hủy.", 0);

        booking.DepositAmount += amount;
        
        // (Tuỳ chọn) Nếu tổng cọc >= FinalAmount thì chuyển PaymentStatus = Paid
        if (booking.DepositAmount >= booking.FinalAmount && booking.FinalAmount > 0)
        {
            booking.PaymentStatus = "Paid";
        }

        await _context.SaveChangesAsync();
        
        return (true, "Nạp cọc thành công!", booking.DepositAmount);
    }
}