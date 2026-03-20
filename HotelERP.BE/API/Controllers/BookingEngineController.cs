using System.Security.Claims;
using HotelERP.BE.API.Attributes;
using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingEngineController : ControllerBase
{
    private readonly IBookingEngineService _service;

    public BookingEngineController(IBookingEngineService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpPost("multi-booking")]
    public async Task<IActionResult> CreateMultiBooking([FromBody] MultiRoomBookingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        var bookingId = await _service.CreateMultiRoomBookingAsync(userId, request);
        
        return Ok(new { success = true, message = "Đặt phòng thành công (Holding)", bookingId });
    }

    [Authorize(Roles = "SUPER_ADMIN")]
    [HttpPut("admin/force-cancel/{id}")]
    [AuditLogInterceptor("Admin can thiệp hủy giữ phòng", "Bookings")] 
    public async Task<IActionResult> ForceCancel(int id)
    {
        var result = await _service.AdminForceCancelBookingAsync(id);
        if (!result) return NotFound(new { message = "Không tìm thấy booking hoặc đã bị hủy trước đó." });

        return Ok(new { success = true, message = "Đã ép hủy và ghi nhận vào Audit Log." });
    }

    [Authorize(Roles = "RECEPTIONIST,SUPER_ADMIN")]
    [HttpGet("assignable-rooms/{typeId}")]
    public async Task<IActionResult> GetRoomsForCheckIn(int typeId)
    {
        var rooms = await _service.GetAssignableRoomsAsync(typeId);
        return Ok(new { success = true, data = rooms });
    }
}