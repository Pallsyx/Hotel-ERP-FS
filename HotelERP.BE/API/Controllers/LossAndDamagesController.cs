using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

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
                .ThenInclude(ri => ri.Equipment)
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

    public class CreateDamageRequest
    {
        public int RoomId { get; set; }
        public int EquipmentId { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
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
