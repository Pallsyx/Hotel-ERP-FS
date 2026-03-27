using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.DTOs;

namespace HotelERP.API.Controllers;

[ApiController]
[Route("api/rooms/{roomId}/inventories")]
[Authorize(Roles = "Manager,Housekeeping,SUPER_ADMIN")] // Chỉ Manager, Housekeeping và Admin mới được quản lý vật tư phòng
public class RoomInventoriesController(IRoomInventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetInventories(int roomId)
    {
        var items = await inventoryService.GetInventoriesByRoomIdAsync(roomId);
        return Ok(new { success = true, data = items });
    }

    [HttpPost]
    public async Task<IActionResult> AddInventory(int roomId, [FromBody] AddInventoryRequest request)
    {
        var id = await inventoryService.AddInventoryAsync(roomId, request);
        return Ok(new { success = true, message = "Thêm vật tư thành công.", inventoryId = id });
    }

    [HttpDelete("{inventoryId}")]
    public async Task<IActionResult> DeleteInventory(int roomId, int inventoryId)
    {
        var result = await inventoryService.DeleteInventoryAsync(inventoryId);
        if (!result) return NotFound();
        return Ok(new { success = true, message = "Đã xóa vật tư khỏi phòng." });
    }
}