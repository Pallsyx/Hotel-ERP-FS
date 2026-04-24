using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Infrastructure.Data; // Đổi lại đúng namespace DbContext của bạn
using HotelERP.BE.Domain.Models;      // Đổi lại đúng namespace chứa Model của bạn

namespace HotelERP.BE.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingController : ControllerBase
{
    private readonly HotelDbContext _context;

    public BookingController(HotelDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // 1. TÌM PHÒNG TRỐNG (API CHO TRANG CHỦ)
    // Dùng khi khách bấm nút "CHECK AVAILABILITY"
    // ==========================================
    [HttpGet("available")]
    public async Task<IActionResult> CheckAvailability([FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut, [FromQuery] int guests)
    {
        // Ràng buộc cơ bản: Ngày đi phải lớn hơn ngày đến
        if (checkOut <= checkIn)
        {
            return BadRequest(new { message = "Ngày Check-out phải sau ngày Check-in." });
        }

        // Bước 1: Tìm ID của những phòng ĐÃ BỊ ĐẶT trong khoảng thời gian này
        // Logic cắt nhau: (Ngày đến của khách < Ngày đi của booking cũ) VÀ (Ngày đi của khách > Ngày đến của booking cũ)
        var bookedRoomIds = await _context.Bookings
            .Where(b => b.Status != "Cancelled" && b.Status != "CheckedOut") // Bỏ qua những đơn đã hủy hoặc đã trả phòng
            .Where(b => checkIn < b.CheckOutDate && checkOut > b.CheckInDate)
            .Select(b => b.RoomId)
            .ToListAsync();

        // Bước 2: Tìm những phòng còn lại KHÔNG nằm trong danh sách đã bị đặt
        // Giả sử bảng Room của bạn liên kết với RoomType (Hạng phòng) để lấy số lượng khách (Capacity)
        var availableRooms = await _context.Rooms
            .Include(r => r.RoomType) // Load kèm thông tin hạng phòng (tên, giá tiền, sức chứa)
            .Where(r => !bookedRoomIds.Contains(r.Id))
            // .Where(r => r.RoomType.Capacity >= guests) // Bỏ comment dòng này nếu bạn có cột sức chứa (Capacity)
            .Select(r => new 
            {
                r.Id,
                r.RoomNumber,
                RoomTypeName = r.RoomType.Name,
                PricePerNight = r.RoomType.Price,
                // Image = r.RoomType.ImageUrl // Thêm ảnh để Frontend hiển thị cho đẹp
            })
            .ToListAsync();

        return Ok(availableRooms);
    }

    // ==========================================
    // 2. TẠO ĐƠN ĐẶT PHÒNG MỚI (CREATE BOOKING)
    // ==========================================
    public record CreateBookingDto(int RoomId, string GuestName, string GuestPhone, string GuestEmail, DateTime CheckInDate, DateTime CheckOutDate, decimal TotalAmount);

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        // Có thể thêm bước kiểm tra lại xem phòng còn trống không (tránh trường hợp 2 khách đặt cùng lúc)
        
        var newBooking = new Booking
        {
            RoomId = dto.RoomId,
            GuestName = dto.GuestName,
            GuestPhone = dto.GuestPhone,
            GuestEmail = dto.GuestEmail,
            CheckInDate = dto.CheckInDate,
            CheckOutDate = dto.CheckOutDate,
            TotalAmount = dto.TotalAmount,
            DepositAmount = 0, // Cột ban nãy tụi mình vừa sửa DB đây này!
            Status = "Pending", // Mới đặt thì chờ Lễ tân xác nhận hoặc chờ nạp cọc
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(newBooking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đặt phòng thành công!", data = newBooking });
    }

    // ==========================================
    // 3. LẤY DANH SÁCH CHO LỄ TÂN (GET ALL)
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.Room)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(bookings);
    }
}