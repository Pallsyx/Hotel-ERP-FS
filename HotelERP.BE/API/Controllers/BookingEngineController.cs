using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using System.Security.Claims;
using HotelERP.BE.API.Filters; // Đã sửa thư mục Attributes thành Filters cho chuẩn
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Constants; 

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingEngineController : ControllerBase
{
    private readonly IBookingEngineService _bookingService;

    // Dùng chung 1 Constructor
    public BookingEngineController(IBookingEngineService bookingService)
    {
        _bookingService = bookingService;
    }

    // ==========================================
    //  SEARCH & HOLD
    // ==========================================
    
    [HttpPost("search")]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> Search([FromBody] SearchRoomRequest request) 
    {
        var result = await _bookingService.SearchAvailableRoomsAsync(request);
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

    [Authorize(Policy = PermissionKeys.ForceCancelBookings)] 
    [AuditLogInterceptor("Admin/Manager can thiệp hủy giữ phòng", "Bookings")] 
    [HttpPut("force-cancel/{bookingId}")] 
// ...PHẢI KHỚP với chữ bookingId ở đây
    public async Task<IActionResult> ForceCancel(int bookingId)
    {
        // Đã đồng bộ sử dụng _bookingService
        var result = await _bookingService.AdminForceCancelBookingAsync(bookingId);
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
}