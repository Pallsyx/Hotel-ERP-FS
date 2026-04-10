using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using HotelERP.BE.Application.Interfaces;

namespace HotelERP.BE.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LossAndDamagesController : ControllerBase
{
    private readonly HotelDbContext _context;
    private readonly IHubContext<DamageHub> _hubContext;

    public LossAndDamagesController(HotelDbContext context, IHubContext<DamageHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetLossAndDamages()
    {
        var damages = await _context.LossAndDamages
            .Include(ld => ld.Room)
            .Include(ld => ld.RoomInventory)
                .ThenInclude(ri => ri!.Equipment)
            .OrderByDescending(ld => ld.CreatedAt)
            .ToListAsync();

        var stats = new
        {
            totalIncidents = damages.Count,
            totalAmount = damages.Sum(ld => ld.PenaltyAmount),
            totalQuantity = damages.Sum(ld => ld.Quantity)
        };

        var data = damages.Select(ld => new
        {
            Id = ld.Id,
            RoomId = ld.RoomId,
            RoomNumber = ld.Room?.RoomNumber ?? "Không xác định",
            RoomInventoryId = ld.RoomInventoryId,
            ItemName = ld.RoomInventory?.Equipment?.Name ?? "Không xác định",
            Quantity = ld.Quantity,
            PenaltyAmount = ld.PenaltyAmount,
            Description = ld.Description,
            CreatedAt = ld.CreatedAt,
            EvidenceImageUrl = ld.EvidenceImageUrl,
            Status = ld.Status
        }).ToList();

        return Ok(new { stats, data });
    }

    // --- LỆNH XÓA MỚI THÊM VÀO ĐÂY ---
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDamage(int id)
    {
        // 1. Tìm bản ghi dựa trên ID
        var damage = await _context.LossAndDamages.FindAsync(id);

        if (damage == null)
        {
            return NotFound(new { message = "Không tìm thấy bản ghi thất thoát này." });
        }

        try
        {
            // 2. Xóa bản ghi (Lưu ý: Chỉ xóa dòng trong bảng LossAndDamages, 
            // không ảnh hưởng đến bảng Equipment hay Room)
            _context.LossAndDamages.Remove(damage);
            
            // 3. Lưu thay đổi xuống Database
            await _context.SaveChangesAsync();

            // 4. (Tùy chọn) Gửi tín hiệu SignalR để các máy khác cũng tự động mất dòng này
            await _hubContext.Clients.All.SendAsync("DeletedDamage", id);

            return Ok(new { message = "Xóa thành công!", id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi xóa: " + ex.Message });
        }
    }

    public class CreateDamageRequest
    {
        public int RoomId { get; set; }
        public int EquipmentId { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
    }

    public class EditDamageRequest
    {
        public int Quantity { get; set; }
        public string? Description { get; set; }
        public decimal? PenaltyAmount { get; set; }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDamage(int id, [FromBody] EditDamageRequest req)
    {
        var damage = await _context.LossAndDamages
            .Include(d => d.RoomInventory)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (damage == null) return NotFound(new { message = "Không tìm thấy bản ghi." });

        damage.Quantity = req.Quantity;
        damage.Description = req.Description;
        damage.UpdatedAt = DateTime.UtcNow;

        if (req.PenaltyAmount.HasValue)
        {
            damage.PenaltyAmount = req.PenaltyAmount.Value;
        }
        else if (damage.RoomInventory != null)
        {
            damage.PenaltyAmount = req.Quantity * damage.RoomInventory.PriceIfLost;
        }

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("DamageUpdated", id);
        return Ok(new { message = "Cập nhật thành công!" });
    }

    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadDamageImage(int id, IFormFile file, [FromServices] IPhotoService photoService)
    {
        var damage = await _context.LossAndDamages.FindAsync(id);
        if (damage == null) return NotFound(new { message = "Không tìm thấy bản ghi đền bù." });

        if (file == null || file.Length == 0) return BadRequest(new { message = "File trống." });

        try
        {
            var (url, publicId) = await photoService.UploadPhotoAsync(file);

            // Xóa ảnh cũ nếu có
            if (!string.IsNullOrEmpty(damage.EvidencePublicId))
            {
                await photoService.DeletePhotoAsync(damage.EvidencePublicId);
            }

            damage.EvidenceImageUrl = url;
            damage.EvidencePublicId = publicId;
            damage.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("DamageUpdated", id);

            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi upload ảnh: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateNewDamage([FromBody] CreateDamageRequest req)
    {
        var inventory = await _context.RoomInventories
            .FirstOrDefaultAsync(ri => ri.RoomId == req.RoomId && ri.EquipmentId == req.EquipmentId);

        if (inventory == null)
            return BadRequest("Vật tư không nằm trong danh sách kiểm kê của phòng này.");

        decimal penaltyAmount = req.Quantity * inventory.PriceIfLost;

        var damage = new LossAndDamage
        {
            RoomId = req.RoomId,
            RoomInventoryId = inventory.Id,
            Quantity = req.Quantity,
            PenaltyAmount = penaltyAmount,
            Description = req.Description,
            Status = "OPEN",
            CreatedAt = DateTime.UtcNow
        };

        _context.LossAndDamages.Add(damage);
        await _context.SaveChangesAsync();
        
        var room = await _context.Rooms.FindAsync(req.RoomId);
        var equipment = await _context.Equipments.FindAsync(inventory.EquipmentId);

        var newRecord = new
        {
            id = damage.Id,
            roomId = damage.RoomId,
            roomNumber = room?.RoomNumber ?? "Không xác định",
            itemName = equipment?.Name ?? "Không xác định",
            quantity = damage.Quantity,
            penaltyAmount = damage.PenaltyAmount,
            description = damage.Description,
            createdAt = damage.CreatedAt,
            evidenceImageUrl = damage.EvidenceImageUrl,
            status = damage.Status
        };

        await _hubContext.Clients.All.SendAsync("ReceiveNewDamage", newRecord);

        return Ok(newRecord);
    }
}