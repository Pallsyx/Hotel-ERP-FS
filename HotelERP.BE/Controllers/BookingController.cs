using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HotelERP.BE.Domain.Models.DTOs;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu phải có Token đăng nhập
    public class BookingController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public BookingController(HotelDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequestDto request)
        {
            // Trích xuất UserId từ Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; 

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { message = "Không xác định được danh tính người dùng từ Token." });
            }

            if (!int.TryParse(userIdString, out int userId))
            {
                return BadRequest(new { message = "Id người dùng không hợp lệ." });
            }

            // ==========================================
            // LOGIC LƯU VÀO DATABASE SẼ VIẾT Ở ĐÂY
            // ==========================================

            return Ok(new { 
                message = "Đã lấy được UserId từ Token thành công và sẵn sàng tạo Booking!", 
                customerId = userId,
                roomsRequested = request.Rooms.Count
            });
        }
    }
}