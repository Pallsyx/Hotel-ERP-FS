using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingEngineController : ControllerBase {
    private readonly IBookingEngineService _bookingService;
    public BookingEngineController(IBookingEngineService bookingService) => _bookingService = bookingService;

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchRoomRequest request) {
        var result = await _bookingService.SearchAvailableRoomsAsync(request);
        return Ok(result);
    }
    [HttpPost("hold")]
    [Microsoft.AspNetCore.Authorization.Authorize] // Phải đăng nhập mới được giữ phòng
    public async Task<IActionResult> HoldRoom([FromBody] HoldRoomRequest request) 
    {
    try 
    {
        // Lấy UserId từ Token đang đăng nhập
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        int userId = int.Parse(userIdClaim!);

        var result = await _bookingService.HoldRoomAsync(request.RoomTypeId, userId, request.CheckInDate, request.CheckOutDate);
        return Ok(new { success = true, message = result });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = ex.Message });
    }
    }
}
