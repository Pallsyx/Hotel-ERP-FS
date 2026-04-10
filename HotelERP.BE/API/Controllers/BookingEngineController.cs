using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using System.Security.Claims;
using HotelERP.BE.API.Filters; // Đã sửa thư mục Attributes thành Filters cho chuẩn
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Constants; 
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Infrastructure.Data; // Đảm bảo bạn đã thêm using này để truy cập DbContext

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingEngineController : ControllerBase
{
    private readonly IBookingEngineService _bookingService;
    private readonly HotelDbContext _context;

    // Dùng chung 1 Constructor
    public BookingEngineController(IBookingEngineService bookingService, HotelDbContext context)
    {
        _bookingService = bookingService;
        _context = context;
    }

    // ==========================================
    //  SEARCH & HOLD
    // ==========================================
    
    [HttpPost("search")]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> Search([FromBody] SearchRoomRequest request) 
    {
        // 1. Lấy dữ liệu từ Database, BẮT BUỘC dùng .Include() và .Where()
        var roomTypes = await _context.RoomTypes
        .Include(rt => rt.Rooms) // 👉 Lấy kèm danh sách phòng (Fix lỗi không có phòng)
        .Where(rt => rt.CapacityAdults >= request.AdultsCount) // 👉 Lọc người lớn (Fix lỗi sai sức chứa)
        .ToListAsync();

    // 2. Map dữ liệu trả về cho Frontend (Đảm bảo chữ cái đầu viết thường giống React)
        var result = roomTypes.Select(rt => new {
        id = rt.Id,
        name = rt.Name,
        basePrice = rt.BasePrice,
        capacityAdults = rt.CapacityAdults,
        capacityChildren = rt.CapacityChildren,
        rooms = rt.Rooms.Select(r => new {
            id = r.Id,
            roomNumber = r.RoomNumber,
            floor = r.Floor,
            status = r.Status // Đảm bảo DB lưu là "Available" hoặc "Occupied"
        }).ToList()
    }).ToList();

    return Ok(result);
    }

    [HttpPost("hold")]
    [Authorize] // Phải đăng nhập mới được giữ phòng
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> HoldRoom([FromBody] HoldRoomRequest request) 
    {
        try 
        {
            // Lấy UserId từ Token đang đăng nhập
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            
            int userId = int.Parse(userIdClaim);

            var result = await _bookingService.HoldRoomAsync(request.RoomTypeId, userId, request.CheckInDate, request.CheckOutDate);
            return Ok(new { success = true, message = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // ==========================================
    //  MULTI-ROOM, CANCEL, CHECK-IN
    // ==========================================
    
    [Authorize]
    [HttpPost("multi-booking")]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> CreateMultiBooking([FromBody] MultiRoomBookingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        
        // Đã đồng bộ sử dụng _bookingService
        var bookingId = await _bookingService.CreateMultiRoomBookingAsync(userId, request);
        
        return Ok(new { success = true, message = "Đặt phòng thành công (Holding)", bookingId });
    }

    [HttpPost("force-cancel/{id}")]
    [Authorize(Policy = PermissionKeys.ForceCancelBookings)] 
    [AuditLogInterceptor("Admin/Manager can thiệp hủy giữ phòng", "Bookings")] 
    public async Task<IActionResult> ForceCancel(int id)
    {
        // Đã đồng bộ sử dụng _bookingService
        var result = await _bookingService.AdminForceCancelBookingAsync(id);
        if (!result) return NotFound(new { message = "Không tìm thấy booking hoặc đã bị hủy trước đó." });

        return Ok(new { success = true, message = "Đã ép hủy và ghi nhận vào Audit Log." });
    }

    [HttpGet("assignable-rooms/{typeId}")]
    [Authorize(Policy = PermissionKeys.CheckInOut)]
    public async Task<IActionResult> GetRoomsForCheckIn(int typeId)
    {
        // Đã đồng bộ sử dụng _bookingService
        var rooms = await _bookingService.GetAssignableRoomsAsync(typeId);
        return Ok(new { success = true, data = rooms });
    }

    [HttpGet]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> GetAllBookings([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string search = "")
    {
    try 
    {
        // Ở đây bạn cần gọi xuống Service hoặc Repository để lấy dữ liệu thật từ SQL
        // Tạm thời tôi để code trả về danh sách trống để bạn hết lỗi 404 trước
        var result = new {
            data = new List<object>(), // Dữ liệu thật lấy từ DB
            total = 0                  // Tổng số dòng để phân trang
        };
        
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
    }
}