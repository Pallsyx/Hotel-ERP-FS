using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Constants;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace HotelERP.BE.Application.Services;

public class BookingEngineService : IBookingEngineService
{
    private readonly HotelDbContext _context;
    private readonly IDatabase _redis;

    public BookingEngineService(HotelDbContext context, IConnectionMultiplexer redis)
    {
        _context = context;
        _redis = redis.GetDatabase();
    }

    // 1. Task: Đặt nhiều phòng (Multi-room) - Tách dòng trong Booking_Details
    public async Task<int> CreateMultiRoomBookingAsync(int userId, MultiRoomBookingRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            // Tạo 1 bản ghi Booking tổng
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

            foreach (var item in request.Items) {
                // Tách dòng: Nếu khách đặt 2 phòng Deluxe, ta tạo 2 dòng BookingDetail riêng biệt
                for (int i = 0; i < item.Quantity; i++) {
                    var detail = new BookingDetail {
                        BookingId = booking.Id,
                        RoomTypeId = item.RoomTypeId,
                        CheckInDate = item.CheckInDate,
                        CheckOutDate = item.CheckOutDate,
                        Status = BookingStatus.Holding
                    };
                    _context.BookingDetails.Add(detail);
                }
                
                // Thiết lập Redis TTL 15 phút cho từng nhóm giữ phòng
                await _redis.StringSetAsync($"hold:{booking.Id}:{item.RoomTypeId}", "HOLDING", TimeSpan.FromMinutes(15));
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return booking.Id;
        }
        catch {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // 2. Task: Admin ép hủy (Update Status + Clear Redis)
    public async Task<bool> AdminForceCancelBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings.Include(b => b.BookingDetails).FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking == null) return false;

        booking.Status = BookingStatus.CancelledByAdmin;
        foreach (var detail in booking.BookingDetails) {
            detail.Status = BookingStatus.CancelledByAdmin;
            // Xóa sạch key giữ phòng trên Redis để nhả slot lập tức
            await _redis.KeyDeleteAsync($"hold:{bookingId}:{detail.RoomTypeId}");
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // 3. Task: Thuật toán Check-in (Điều kiện kép: Available + Clean)
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