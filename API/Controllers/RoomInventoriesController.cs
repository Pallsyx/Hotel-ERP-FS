using Microsoft.AspNetCore.Mvc;

namespace HotelERP.API.Controllers;

[ApiController]
[Route("api/rooms/{roomId}/inventories")]
public class RoomInventoriesController : ControllerBase
{
    // Cần inject IInventoryService ở đây (giả định)

    /// <summary>
    /// Task: API Lấy danh sách vật tư theo RoomID
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetRoomInventories(int roomId)
    {
        // Mock trả về. Thực tế gọi: await inventoryService.GetByRoomIdAsync(roomId);
        return Ok(new { success = true, message = $"Danh sách vật tư phòng {roomId}" });
    }

    /// <summary>
    /// Task: API Thêm vật tư vào phòng
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> AddInventory(int roomId, [FromBody] object inventoryDto)
    {
        return Ok(new { success = true, message = "Đã thêm vật tư thành công." });
    }
}