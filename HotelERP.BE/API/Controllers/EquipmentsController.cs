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
                e.BasePrice,
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

    [HttpGet("export-excel")]
    public async Task<IActionResult> ExportExcel([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = context.Equipments.Where(e => e.IsActive);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(e => e.Name.Contains(search) || e.ItemCode.Contains(search));

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => e.Category == category);

        var equipments = await query.OrderBy(e => e.ItemCode).ToListAsync();
        
        using var workbook = new ClosedXML.Excel.XLWorkbook();
        var worksheet = workbook.Worksheets.Add("VatTu");
        
        worksheet.Cell(1, 1).Value = "Mã Vật Tư";
        worksheet.Cell(1, 2).Value = "Tên Vật Tư";
        worksheet.Cell(1, 3).Value = "Danh Mục";
        worksheet.Cell(1, 4).Value = "Đơn Vị Tính";
        worksheet.Cell(1, 5).Value = "Tổng Số Lượng";
        worksheet.Cell(1, 6).Value = "Giá Nhập";
        worksheet.Cell(1, 7).Value = "Giá Bồi Thường";
        worksheet.Cell(1, 8).Value = "Nhà Cung Cấp";
        
        var headerRow = worksheet.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

        for (int i = 0; i < equipments.Count; i++)
        {
            var row = i + 2;
            var e = equipments[i];
            worksheet.Cell(row, 1).Value = e.ItemCode;
            worksheet.Cell(row, 2).Value = e.Name;
            worksheet.Cell(row, 3).Value = e.Category;
            worksheet.Cell(row, 4).Value = e.Unit;
            worksheet.Cell(row, 5).Value = e.TotalQuantity;
            worksheet.Cell(row, 6).Value = e.BasePrice;
            worksheet.Cell(row, 7).Value = e.DefaultPriceIfLost;
            worksheet.Cell(row, 8).Value = e.Supplier;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new System.IO.MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "DanhSachVatTu.xlsx");
    }

    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "Vui lòng chọn file Excel!" });

        int successCount = 0;

        try
        {
            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream);
            using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RowsUsed().Skip(1); // Skip header

            foreach (var row in rows)
            {
                if (row == null) continue;

                var itemCode = row.Cell(1)?.Value.ToString()?.Trim() ?? "";
                var name = row.Cell(2)?.Value.ToString()?.Trim() ?? "";

                if (string.IsNullOrEmpty(itemCode) && string.IsNullOrEmpty(name)) continue;

                var category = row.Cell(3)?.Value.ToString()?.Trim() ?? "";
                var unit = row.Cell(4)?.Value.ToString()?.Trim() ?? "";
                var totalQuantityStr = row.Cell(5)?.Value.ToString()?.Trim();
                var basePriceStr = row.Cell(6)?.Value.ToString()?.Trim();
                var defaultPriceStr = row.Cell(7)?.Value.ToString()?.Trim();
                var supplier = row.Cell(8)?.Value.ToString()?.Trim();

                HotelERP.BE.Domain.Models.Equipment? existing = null;
                if (!string.IsNullOrEmpty(itemCode))
                {
                    existing = await context.Equipments.FirstOrDefaultAsync(e => e.ItemCode == itemCode);
                }
                
                if (existing == null && !string.IsNullOrEmpty(name))
                {
                    existing = await context.Equipments.FirstOrDefaultAsync(e => e.Name == name);
                }

                if (existing != null)
                {
                    if (!string.IsNullOrEmpty(name)) existing.Name = name;
                    if (!string.IsNullOrEmpty(category)) existing.Category = category;
                    if (!string.IsNullOrEmpty(unit)) existing.Unit = unit;
                    if (!string.IsNullOrEmpty(supplier)) existing.Supplier = supplier;

                    if (!string.IsNullOrEmpty(totalQuantityStr) && int.TryParse(totalQuantityStr, out int tq)) 
                        existing.TotalQuantity += tq;
                    
                    if (!string.IsNullOrEmpty(basePriceStr) && decimal.TryParse(basePriceStr, out decimal bp)) 
                        existing.BasePrice = bp;
                    
                    if (!string.IsNullOrEmpty(defaultPriceStr) && decimal.TryParse(defaultPriceStr, out decimal dp)) 
                        existing.DefaultPriceIfLost = dp;

                    existing.IsActive  = true;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var newCode = !string.IsNullOrEmpty(itemCode) ? itemCode : $"VT-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
                    var newName = !string.IsNullOrEmpty(name) ? name : newCode;
                    var newCategory = !string.IsNullOrEmpty(category) ? category : "Khác";
                    var newUnit = !string.IsNullOrEmpty(unit) ? unit : "Cái";
                    
                    int.TryParse(totalQuantityStr ?? "0", out int totalQuantity);
                    decimal.TryParse(basePriceStr    ?? "0", out decimal basePrice);
                    decimal.TryParse(defaultPriceStr ?? "0", out decimal defaultPrice);

                    context.Equipments.Add(new HotelERP.BE.Domain.Models.Equipment
                    {
                        ItemCode           = newCode,
                        Name               = newName,
                        Category           = newCategory,
                        Unit               = newUnit,
                        TotalQuantity      = totalQuantity,
                        BasePrice          = basePrice,
                        DefaultPriceIfLost = defaultPrice,
                        Supplier           = supplier,
                        IsActive           = true,
                        CreatedAt          = DateTime.UtcNow
                    });
                }
                successCount++;
            }

            await context.SaveChangesAsync();
            return Ok(new { success = true, message = $"Nhập Excel thành công! Đã xử lý {successCount} dòng." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Lỗi khi xử lý file Excel: " + ex.Message });
        }
    }
}
