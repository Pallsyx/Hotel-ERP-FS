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

    // 1 CONSTRUCTOR
    public BookingEngineService(HotelDbContext context, IDistributedLockFactory lockFactory, IConnectionMultiplexer redis)
    {
        _context = context;
        _lockFactory = lockFactory;
        _redis = redis;
    }

    // ====================================================================
    // SEARCH, HOLD VÀ RELEASE (REDLOCK)
    // ====================================================================

    public async Task<string> HoldRoomAsync(int roomTypeId, int userId, DateTime checkIn, DateTime checkOut)
    {
        string resourceLockKey = $"lock:roomtype:{roomTypeId}";
        var expiry = TimeSpan.FromSeconds(10); 
        var wait = TimeSpan.FromSeconds(3);    
        var retry = TimeSpan.FromMilliseconds(500); 

        using (var redLock = await _lockFactory.CreateLockAsync(resourceLockKey, expiry, wait, retry))
        {
            if (!redLock.IsAcquired)
                throw new Exception("Hệ thống đang bận xử lý lượt đặt phòng khác. Vui lòng thử lại sau giây lát!");

            int totalPhysicalRooms = await _context.Rooms
                .CountAsync(r => r.RoomTypeId == roomTypeId && r.Status == "Available");

            int occupiedRooms = await _context.BookingDetails
                .CountAsync(bd => 
                    bd.RoomTypeId == roomTypeId &&
                    bd.Status != "Cancelled" && 
                    bd.CheckInDate < checkOut && 
                    bd.CheckOutDate > checkIn);

            if (totalPhysicalRooms - occupiedRooms <= 0)
                throw new Exception("Rất tiếc, loại phòng này vừa hết chỗ trong khoảng thời gian bạn chọn.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                string generatedCode = "BK" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var newBooking = new Booking
                {
                    UserId = userId,
                    BookingCode = generatedCode,
                    Status = BookingStatus.Holding,
                    CreatedAt = DateTime.UtcNow,
                    HoldExpiresAt = DateTime.UtcNow.AddMinutes(15), 
                    PaymentStatus = "UNPAID",
                    BookingSubtotal = 0, 
                    DiscountAmount = 0,
                    FinalAmount = 0
                };
                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync(); 

                var detail = new BookingDetail
                {
                    BookingId = newBooking.Id,
                    RoomTypeId = roomTypeId,
                    CheckInDate = checkIn,
                    CheckOutDate = checkOut,
                    Status = "Booked", 
                    AdultsCount = 1, 
                    CreatedAt = DateTime.UtcNow
                };
                _context.BookingDetails.Add(detail);
                await _context.SaveChangesAsync();

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
        var expiredBookings = await _context.Bookings
            .Where(b => b.Status == BookingStatus.Holding && b.HoldExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        foreach (var booking in expiredBookings)
        {
            booking.Status = BookingStatus.Expired; 
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
        if (request.CheckInDate.Date < DateTime.UtcNow.Date)
            throw new Exception("Ngày nhận phòng không được nhỏ hơn ngày hôm nay.");
        
        if (request.CheckOutDate <= request.CheckInDate)
            throw new Exception("Ngày trả phòng phải lớn hơn ngày nhận phòng.");

        var roomTypesQuery = await _context.RoomTypes
            .Where(rt => rt.Status == "ACTIVE" 
                      && rt.CapacityAdults >= request.AdultsCount 
                      && rt.CapacityChildren >= request.ChildrenCount)
            .Select(rt => new 
            {
                RoomType = rt,
                TotalPhysicalRooms = _context.Rooms.Count(r => r.RoomTypeId == rt.Id && r.Status == RoomPhysicalStatus.Available),
                OccupiedRooms = _context.BookingDetails.Count(bd => 
                        bd.RoomTypeId == rt.Id &&
                        bd.Status != "Cancelled" && 
                        bd.Booking!.Status != BookingStatus.Expired && 
                        bd.CheckInDate < request.CheckOutDate && 
                        bd.CheckOutDate > request.CheckInDate)
            })
            .ToListAsync();

        var availableRooms = roomTypesQuery
            .Where(x => (x.TotalPhysicalRooms - x.OccupiedRooms) > 0)
            .Select(x => new AvailableRoomTypeResponse
            {
                RoomTypeId = x.RoomType.Id,
                Name = x.RoomType.Name,
                BasePrice = x.RoomType.BasePrice,
                CapacityAdults = x.RoomType.CapacityAdults,
                CapacityChildren = x.RoomType.CapacityChildren,
                AvailableCount = x.TotalPhysicalRooms - x.OccupiedRooms
            });

        return availableRooms;
    }

    // ====================================================================
    //  MULTI-ROOM, ADMIN CANCEL, CHECK-IN
    // ====================================================================

    public async Task<int> CreateMultiRoomBookingAsync(int userId, MultiRoomBookingRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            var booking = new Booking {
                UserId = userId,
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                Status = BookingStatus.Holding,
                CreatedAt = DateTime.UtcNow,
                BookingCode = "BK-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
            };
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var db = _redis.GetDatabase(); // Fix Redis Call
            decimal finalTotalAmount = 0; // NEW: Biến cộng dồn tổng tiền

            foreach (var item in request.Items) {
                // NEW: Lấy giá BasePrice từ CSDL cho hạng phòng này
                var roomTypeInfo = await _context.RoomTypes.FindAsync(item.RoomTypeId);
                var basePrice = roomTypeInfo?.BasePrice ?? 0;
                var nightsCount = (int)(item.CheckOutDate.Date - item.CheckInDate.Date).TotalDays;
                if (nightsCount <= 0) nightsCount = 1;

                for (int i = 0; i < item.Quantity; i++) {
                    var lineTotal = basePrice * nightsCount;
                    finalTotalAmount += lineTotal;

                    var detail = new BookingDetail {
                        BookingId = booking.Id,
                        RoomTypeId = item.RoomTypeId,
                        RoomId = (item.RoomIds != null && item.RoomIds.Count > i && item.RoomIds[i] > 0) ? item.RoomIds[i] : null, // Gán số phòng vật lý cụ thể nếu có
                        CheckInDate = item.CheckInDate,
                        CheckOutDate = item.CheckOutDate,
                        Status = BookingStatus.Holding,
                        PricePerNight = basePrice,   // NEW
                        Nights = nightsCount,        // NEW
                        LineTotal = lineTotal        // NEW
                    };
                    _context.BookingDetails.Add(detail);
                    
                    // Cập nhật trạng thái phòng vật lý thành Occupied/Reserved nếu có RoomId để người khác không chọn được (Nâng cao)
                    if (detail.RoomId.HasValue) 
                    {
                        var physicalRoom = await _context.Rooms.FindAsync(detail.RoomId.Value);
                        if (physicalRoom != null) 
                        {
                            physicalRoom.Status = RoomPhysicalStatus.Occupied; // Tạm khóa phòng lại
                        }
                    }
                }
                
                await db.StringSetAsync($"hold:{booking.Id}:{item.RoomTypeId}", "HOLDING", TimeSpan.FromMinutes(15));
            }

            // Gán lại tổng tiền cuối cho mảng Booking cha
            booking.FinalAmount = finalTotalAmount;
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return booking.Id;
        }
        catch {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> AdminForceCancelBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings.Include(b => b.BookingDetails).FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking == null) return false;

        booking.Status = BookingStatus.CancelledByAdmin;
        var db = _redis.GetDatabase(); // Fix Redis Call

        foreach (var detail in booking.BookingDetails) {
            detail.Status = BookingStatus.CancelledByAdmin;
            await db.KeyDeleteAsync($"hold:{bookingId}:{detail.RoomTypeId}");
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<object>> GetAssignableRoomsAsync(int roomTypeId)
    {
        return await _context.Rooms
            .Where(r => r.RoomTypeId == roomTypeId && 
                        r.Status == RoomPhysicalStatus.Available && 
                        r.CleaningStatus == CleaningStatus.Clean)
            .Select(r => new { r.Id, r.RoomNumber, r.Floor, r.CleaningStatus })
            .ToListAsync();
    }
}