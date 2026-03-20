using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Constants;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using RedLockNet;
using StackExchange.Redis;
using Microsoft.EntityFrameworkCore;
using System.CodeDom.Compiler;

namespace HotelERP.BE.Application.Services;

public class BookingEngineService : IBookingEngineService
{
    private readonly HotelDbContext _context;
    private readonly IDistributedLockFactory _lockFactory;
    private readonly IConnectionMultiplexer _redis;

    public BookingEngineService(HotelDbContext context, IDistributedLockFactory lockFactory, IConnectionMultiplexer redis)
    {
        _context = context;
        _lockFactory = lockFactory;
        _redis = redis;
    }

    public async Task<string> HoldRoomAsync(int roomTypeId, int userId, DateTime checkIn, DateTime checkOut)
{
    // 1. Cấu hình khóa (giữ nguyên của bạn)
    string resourceLockKey = $"lock:roomtype:{roomTypeId}";
    var expiry = TimeSpan.FromSeconds(10); 
    var wait = TimeSpan.FromSeconds(3);    
    var retry = TimeSpan.FromMilliseconds(500); 

    // 2. TRANH GIÀNH KHÓA REDLOCK
    using (var redLock = await _lockFactory.CreateLockAsync(resourceLockKey, expiry, wait, retry))
    {
        if (!redLock.IsAcquired)
        {
            throw new Exception("Hệ thống đang bận xử lý lượt đặt phòng khác. Vui lòng thử lại sau giây lát!");
        }

        // --- BẮT ĐẦU VÙNG AN TOÀN (CRITICAL SECTION) ---

        // 3. LOGIC KIỂM TRA TỒN KHO THỰC TẾ
        // Lấy tổng số phòng vật lý của loại này
        int totalPhysicalRooms = await _context.Rooms
            .CountAsync(r => r.RoomTypeId == roomTypeId && r.Status == "Available");

        // Đếm số lượng phòng đã bị đặt/giữ trùng lịch (A < D và B > C)
        int occupiedRooms = await _context.BookingDetails
            .CountAsync(bd => 
                bd.RoomTypeId == roomTypeId &&
                bd.Status != "Cancelled" && 
                bd.CheckInDate < checkOut && 
                bd.CheckOutDate > checkIn);

        if (totalPhysicalRooms - occupiedRooms <= 0)
        {
            throw new Exception("Rất tiếc, loại phòng này vừa hết chỗ trong khoảng thời gian bạn chọn.");
        }

        // 4. TẠO DATA (Dùng Transaction để đảm bảo lưu cả 2 bảng hoặc không gì cả)
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Sinh mã Booking tự động (VD: BK20260320140512)
            string generatedCode = "BK" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            // Tạo Header Booking
            var newBooking = new Booking
            {
                UserId = userId,
                BookingCode = generatedCode,
                Status = BookingStatus.Holding, // "Holding"
                CreatedAt = DateTime.UtcNow,
                HoldExpiresAt = DateTime.UtcNow.AddMinutes(15), // Lưu để Job quét
                PaymentStatus = "UNPAID",
                BookingSubtotal = 0, // <--- THÊM ĐỂ TRÁNH LỖI NULL TIỀN BẠC
                DiscountAmount = 0,
                FinalAmount = 0
            };

            _context.Bookings.Add(newBooking);
            await _context.SaveChangesAsync(); 

            // Tạo Detail (Nơi lưu RoomTypeId và ngày tháng thực tế)
            var detail = new BookingDetail
            {
                BookingId = newBooking.Id,
                RoomTypeId = roomTypeId,
                CheckInDate = checkIn,
                CheckOutDate = checkOut,
                Status = "Booked", // Trạng thái của dòng phòng này
                AdultsCount = 1, // Mặc định hoặc lấy từ DTO
                CreatedAt = DateTime.UtcNow
            };

            _context.BookingDetails.Add(detail);
            await _context.SaveChangesAsync();

            // 5. GẮN TTL LÊN REDIS (Để Job hoặc hệ thống quét nhanh)
            var db = _redis.GetDatabase();
            await db.StringSetAsync($"booking:hold:{newBooking.Id}", "pending", TimeSpan.FromMinutes(15));

            await transaction.CommitAsync();

            return $"Giữ phòng thành công! Mã Booking: {newBooking.Id}. Bạn có 15 phút để hoàn tất thanh toán.";
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw new Exception("Có lỗi xảy ra khi khởi tạo đơn đặt phòng.");
        }
    }
}

    public async Task ReleaseExpiredBookingsAsync()
{
    // Tìm các booking đang Holding mà quá thời gian cho phép
    var expiredBookings = await _context.Bookings
        .Where(b => b.Status == BookingStatus.Holding && b.HoldExpiresAt < DateTime.UtcNow)
        .ToListAsync();

    foreach (var booking in expiredBookings)
    {
        booking.Status = BookingStatus.Expired; // Tuyệt đối KHÔNG DELETE theo Trello 
        
        // Xóa key trên Redis nếu nó chưa tự bốc hơi
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync($"booking:hold:{booking.Id}");
    }

    if (expiredBookings.Any())
    {
        await _context.SaveChangesAsync();
    }
}

    public async Task<IEnumerable<AvailableRoomTypeResponse>> SearchAvailableRoomsAsync(SearchRoomRequest request)
    {
    // 1. Kiểm tra tính hợp lệ của Ngày tháng
    if (request.CheckInDate.Date < DateTime.UtcNow.Date)
        throw new Exception("Ngày nhận phòng không được nhỏ hơn ngày hôm nay.");
    
    if (request.CheckOutDate <= request.CheckInDate)
        throw new Exception("Ngày trả phòng phải lớn hơn ngày nhận phòng.");

    // 2. Query EF Core: Gom nhóm và tính toán tồn kho ngay trên SQL Server
    var roomTypesQuery = await _context.RoomTypes
        // Lọc theo trạng thái kinh doanh và Sức chứa
        .Where(rt => rt.Status == "ACTIVE" 
                  && rt.CapacityAdults >= request.AdultsCount 
                  && rt.CapacityChildren >= request.ChildrenCount)
        .Select(rt => new 
        {
            RoomType = rt,
            // Đếm tổng số phòng vật lý đang "Available" của loại này
            TotalPhysicalRooms = _context.Rooms
                .Count(r => r.RoomTypeId == rt.Id && r.Status == RoomPhysicalStatus.Available),
            
            // Đếm số phòng đã bị Khóa/Đặt trùng lịch
            // Công thức trùng lịch: CheckIn Cũ < CheckOut Mới VÀ CheckOut Cũ > CheckIn Mới
            OccupiedRooms = _context.BookingDetails
                .Count(bd => 
                    bd.RoomTypeId == rt.Id &&
                    bd.Status != "Cancelled" && // Không tính những phòng đã hủy
                    bd.Booking!.Status != BookingStatus.Expired && // Không tính những giữ phòng đã quá hạn 15p
                    bd.CheckInDate < request.CheckOutDate && 
                    bd.CheckOutDate > request.CheckInDate)
        })
        .ToListAsync();

    // 3. Lọc ra những loại phòng CÒN TRỐNG (> 0) và Map ra DTO trả về cho Khách
    var availableRooms = roomTypesQuery
        .Where(x => (x.TotalPhysicalRooms - x.OccupiedRooms) > 0)
        .Select(x => new AvailableRoomTypeResponse
        {
            RoomTypeId = x.RoomType.Id,
            Name = x.RoomType.Name,
            BasePrice = x.RoomType.BasePrice,
            CapacityAdults = x.RoomType.CapacityAdults,
            CapacityChildren = x.RoomType.CapacityChildren,
            AvailableCount = x.TotalPhysicalRooms - x.OccupiedRooms // Báo cho khách biết còn đúng x phòng
        });

    return availableRooms;
    }

}