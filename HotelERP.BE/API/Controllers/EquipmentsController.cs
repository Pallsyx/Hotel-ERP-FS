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
    public async Task<IActionResult> GetEquipments()
    {
        var equipments = await context.Equipments
            .Where(e => e.IsActive)
            .OrderBy(e => e.Name)
            .Select(e => new EquipmentResponseDto(
                e.Id,
                e.Name,
                e.Unit,
                e.TotalQuantity - e.InUseQuantity - e.DamagedQuantity - e.LiquidatedQuantity,
                e.DefaultPriceIfLost
            ))
            .ToListAsync();

        return Ok(new { success = true, data = equipments });
    }
}
