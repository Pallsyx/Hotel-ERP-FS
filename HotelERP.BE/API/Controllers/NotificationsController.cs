using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using HotelERP.BE.Constants;

namespace HotelERP.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public NotificationsController(HotelDbContext context)
        {
            _context = context;
        }

        // 1. API: Lấy danh sách 20 thông báo mới nhất
        [HttpGet]
        [Authorize(Policy = PermissionKeys.ViewNotifications)]
        public async Task<IActionResult> GetNotifications()
        {
           try 
            {
                // Kiểm tra xem database có bản ghi nào không để tránh null
                var notifications = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .Select(n => new { // FIX 500: Map thẳng ra Object vô danh để tránh JSON Cycle
                n.Id,
                n.Title,
                n.Content,
                n.IsRead,
                n.CreatedAt
                })
                .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                 // Log lỗi ra để biết chính xác là thiếu cột gì
                 var realError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                 return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }
        

        // 2. API: Đánh dấu 1 thông báo là đã đọc (Khi user click vào)
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var noti = await _context.Notifications.FindAsync(id);
            if (noti == null) return NotFound();

            noti.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 3. API: Đánh dấu ĐÃ ĐỌC TẤT CẢ (Nút dọn dẹp)
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var unreadNotis = await _context.Notifications
                .Where(n => n.UserId == null && !n.IsRead)
                .ToListAsync();

            if (!unreadNotis.Any()) 
                return Ok(new { message = "Không có thông báo nào cần đọc" });

            foreach (var noti in unreadNotis)
            {
                noti.IsRead = true;
            }
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã đánh dấu đọc toàn bộ" });
        }
    }
}