using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelERP.Application.Interfaces;
using HotelERP.Application.DTOs;

namespace HotelERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomTypesController(IRoomTypeService roomTypeService) : ControllerBase
{
    [HttpGet]
    
    public async Task<IActionResult> GetRoomTypes()
    {
        var data = await roomTypeService.GetRoomTypesAsync();
        return Ok(new { success = true, data });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomTypeById(int id)
    {
        var data = await roomTypeService.GetRoomTypeByIdAsync(id);
        if (data == null) return NotFound("Không tìm thấy hạng phòng");
        return Ok(new { success = true, data });
    }

    [HttpPost]
    [Authorize(Roles = "Manager,Admin")]
    [Consumes("multipart/form-data")] 
    public async Task<IActionResult> CreateRoomType([FromForm] CreateRoomTypeRequest request)
    {
        var id = await roomTypeService.CreateRoomTypeAsync(request);
        return Ok(new { success = true, message = "Tạo hạng phòng thành công.", roomTypeId = id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager,Admin")]
    [Consumes("multipart/form-data")] 
    public async Task<IActionResult> UpdateRoomType(int id, [FromForm] UpdateRoomTypeRequest request)
    {
        var result = await roomTypeService.UpdateRoomTypeAsync(id, request);
        if (!result) return NotFound();
        return Ok(new { success = true, message = "Cập nhật hạng phòng thành công." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<IActionResult> DeleteRoomType(int id)
    {
        var result = await roomTypeService.DeleteRoomTypeAsync(id);
        if (!result) return NotFound();
        return Ok(new { success = true, message = "Đã xóa hạng phòng." });
    }
}