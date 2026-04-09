using HotelERP.BE.Application.DTOs.BookingManagement;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Constants;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Application.Services;

public class BookingManagementService : IBookingManagementService
{
    private readonly HotelDbContext _context;

    // ==============================================================
    // QUY TRÌNH CHUYỂN TRẠNG THÁI BOOKING THEO HOTEL THỰC TẾ
    // ==============================================================
    //
    //  Pending ──────► Confirmed ──────► Checked_in ──────► Completed
    //     │                │                                    
    //     │                │                                    
    //     ▼                ▼                                    
    //  Cancelled       Cancelled                               
    //
    //  Holding ──────► Confirmed (khi thanh toán xong)
    //     │
    //     ▼
    //  Cancelled
    //
    // Trạng thái terminal (không chuyển tiếp): Cancelled, Completed, Expired, CancelledByAdmin
    // ==============================================================

    private static readonly Dictionary<string, List<string>> _allowedTransitions = new()
    {
        { BookingStatus.Pending,    new List<string> { BookingStatus.Confirmed, BookingStatus.Cancelled } },
        { BookingStatus.Confirmed,  new List<string> { BookingStatus.CheckedIn, BookingStatus.Cancelled } },
        { BookingStatus.CheckedIn,  new List<string> { BookingStatus.Completed } },
        { BookingStatus.Holding,    new List<string> { BookingStatus.Confirmed, BookingStatus.Cancelled } },
    };

    public BookingManagementService(HotelDbContext context)
    {
        _context = context;
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

        // --- Filter theo Date Range (dựa trên CheckInDate của BookingDetail) ---
        if (request.FromDate.HasValue)
        {
            var fromDate = request.FromDate.Value.Date;
            query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate >= fromDate));
        }

        if (request.ToDate.HasValue)
        {
            var toDate = request.ToDate.Value.Date.AddDays(1); // inclusive end
            query = query.Where(b => b.BookingDetails.Any(bd => bd.CheckInDate < toDate));
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
    // API 2: CẬP NHẬT TRẠNG THÁI BOOKING
    // ==============================================================
    public async Task<(bool Success, string Message)> UpdateBookingStatusAsync(int bookingId, string newStatus)
    {
        var booking = await _context.Bookings
            .Include(b => b.BookingDetails)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            return (false, "Không tìm thấy booking.");

        // Kiểm tra trạng thái hiện tại có được phép chuyển không
        if (!_allowedTransitions.TryGetValue(booking.Status, out var allowedNextStatuses))
            return (false, $"Trạng thái hiện tại '{booking.Status}' không cho phép chuyển đổi.");

        if (!allowedNextStatuses.Contains(newStatus))
            return (false, $"Không thể chuyển từ '{booking.Status}' sang '{newStatus}'. " +
                           $"Các trạng thái hợp lệ: {string.Join(", ", allowedNextStatuses)}.");

        // Cập nhật trạng thái booking
        var oldStatus = booking.Status;
        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        // Đồng bộ trạng thái xuống BookingDetails nếu cần
        if (newStatus == BookingStatus.CheckedIn)
        {
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.Status != BookingStatus.Cancelled)
                {
                    detail.Status = BookingStatus.CheckedIn;
                    detail.ActualCheckInAt = DateTime.UtcNow;
                    detail.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
        else if (newStatus == BookingStatus.Completed)
        {
            foreach (var detail in booking.BookingDetails)
            {
                if (detail.Status == BookingStatus.CheckedIn)
                {
                    detail.Status = BookingStatus.Completed;
                    detail.ActualCheckOutAt = DateTime.UtcNow;
                    detail.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
        else if (newStatus == BookingStatus.Cancelled)
        {
            foreach (var detail in booking.BookingDetails)
            {
                detail.Status = BookingStatus.Cancelled;
                detail.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return (true, $"Đã chuyển trạng thái booking #{bookingId} từ '{oldStatus}' sang '{newStatus}' thành công.");
    }

    // ==============================================================
    // API 3: KHÁCH ĐẾN HÔM NAY
    // (Bookings có ít nhất 1 detail CheckInDate = Today AND status = Confirmed)
    // ==============================================================
    public async Task<List<BookingListItemDto>> GetTodayArrivalsAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var bookings = await _context.Bookings
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .Where(b => b.Status == BookingStatus.Confirmed &&
                        b.BookingDetails.Any(bd => bd.CheckInDate >= today && bd.CheckInDate < tomorrow))
            .OrderBy(b => b.BookingDetails.Min(bd => bd.CheckInDate))
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
    }

    // ==============================================================
    // API 4: KHÁCH ĐANG LƯU TRÚ (Status = Checked_in)
    // ==============================================================
    public async Task<List<BookingListItemDto>> GetInHouseGuestsAsync()
    {
        var bookings = await _context.Bookings
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .Where(b => b.Status == BookingStatus.CheckedIn)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
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
            PaymentStatus = b.PaymentStatus,
            Notes = b.Notes,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            Details = b.BookingDetails.Select(bd => new BookingDetailItemDto
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
            }).ToList()
        };
    }
}
