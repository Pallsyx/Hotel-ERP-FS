using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using HotelERP.BE.Constants;

namespace HotelERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentsController(HotelDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEquipments([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = context.Equipments.Where(e => e.IsActive);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(e => e.Name.Contains(search) || e.ItemCode.Contains(search));
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(e => e.Category == category);
        }

        var equipments = await query
            .OrderBy(e => e.Name)
            .Select(e => new EquipmentResponseDto(
                e.Id,
                e.ImageUrl,
                e.ItemCode,
                e.Name,
                e.Category,
                e.Unit,
                e.TotalQuantity,
                Math.Max(0, e.TotalQuantity - e.InUseQuantity - e.DamagedQuantity - e.LiquidatedQuantity),
                e.InUseQuantity,
                e.DamagedQuantity,
                e.DefaultPriceIfLost
            ))
            .ToListAsync();

        return Ok(new { success = true, data = equipments });
    }

    [HttpPost]
    public async Task<IActionResult> CreateEquipment([FromBody] CreateEquipmentDto req)
    {
        if (await context.Equipments.AnyAsync(e => e.ItemCode == req.ItemCode && e.IsActive))
        {
            return BadRequest(new { success = false, message = "Mã vật tư đã tồn tại!" });
        }

        var equipment = new HotelERP.BE.Domain.Models.Equipment
        {
            ItemCode = req.ItemCode,
            Name = req.Name,
            Category = req.Category,
            Unit = req.Unit,
            TotalQuantity = req.TotalQuantity,
            BasePrice = req.BasePrice,
            DefaultPriceIfLost = req.DefaultPriceIfLost,
            ImageUrl = req.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Equipments.Add(equipment);
        await context.SaveChangesAsync();

        return Ok(new { success = true, message = "Thêm vật tư thành công!", data = equipment.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEquipment(int id, [FromBody] UpdateEquipmentDto req)
    {
        var equipment = await context.Equipments.FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
        if (equipment == null) return NotFound(new { success = false, message = "Không tìm thấy vật tư!" });

        if (await context.Equipments.AnyAsync(e => e.ItemCode == req.ItemCode && e.Id != id && e.IsActive))
        {
            return BadRequest(new { success = false, message = "Mã vật tư đã tồn tại ở mục khác!" });
        }

        equipment.ItemCode = req.ItemCode;
        equipment.Name = req.Name;
        equipment.Category = req.Category;
        equipment.Unit = req.Unit;
        equipment.TotalQuantity = req.TotalQuantity;
        equipment.BasePrice = req.BasePrice;
        equipment.DefaultPriceIfLost = req.DefaultPriceIfLost;
        equipment.ImageUrl = req.ImageUrl;
        equipment.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return Ok(new { success = true, message = "Cập nhật vật tư thành công!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEquipment(int id)
    {
        var equipment = await context.Equipments.FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
        if (equipment == null) return NotFound(new { success = false, message = "Không tìm thấy vật tư!" });

        equipment.IsActive = false;
        equipment.UpdatedAt = DateTime.UtcNow;
        
        await context.SaveChangesAsync();

        return Ok(new { success = true, message = "Đã xóa vật tư!" });
    }
}
