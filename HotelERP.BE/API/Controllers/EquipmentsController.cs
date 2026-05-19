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
            var allRows = worksheet.RowsUsed().ToList();

            if (allRows.Count < 2)
                return BadRequest(new { success = false, message = "File Excel không có dữ liệu!" });

            // ── Bước 1: Đọc tiêu đề cột từ hàng đầu tiên ──────────────────────
            var headerRow = allRows[0];
            var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            var headerAliases = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["ItemCode"]         = new[] { "Mã Vật Tư", "Ma Vat Tu", "ItemCode", "Mã VT", "Ma VT", "Mã", "Ma" },
                ["Name"]             = new[] { "Tên Vật Tư", "Ten Vat Tu", "Tên", "Ten", "Name", "Tên SP", "Ten SP" },
                ["Category"]         = new[] { "Danh Mục", "Danh Muc", "Category", "Loại", "Loai", "DM" },
                ["Unit"]             = new[] { "Đơn Vị Tính", "Don Vi Tinh", "ĐVT", "DVT", "Unit", "Đơn Vị", "Don Vi" },
                ["TotalQuantity"]    = new[] { "Tổng Số Lượng", "Tong So Luong", "Số Lượng", "So Luong", "SL", "Quantity", "TotalQuantity", "Tổng SL" },
                ["BasePrice"]        = new[] { "Giá Nhập", "Gia Nhap", "BasePrice", "Giá", "Gia", "Đơn Giá", "Don Gia" },
                ["DefaultPriceIfLost"] = new[] { "Giá Bồi Thường", "Gia Boi Thuong", "DefaultPriceIfLost", "Giá Đền Bù", "Gia Den Bu", "Bồi Thường" },
                ["Supplier"]         = new[] { "Nhà Cung Cấp", "Nha Cung Cap", "Supplier", "NCC", "Nhà Cung Cap" },
            };

            int lastCol = headerRow.LastCellUsed()?.Address.ColumnNumber ?? 20;
            for (int col = 1; col <= lastCol; col++)
            {
                var header = headerRow.Cell(col).Value.ToString().Trim();
                if (string.IsNullOrEmpty(header)) continue;

                foreach (var (field, aliases) in headerAliases)
                {
                    if (!colMap.ContainsKey(field) &&
                        aliases.Any(a => string.Equals(a, header, StringComparison.OrdinalIgnoreCase)))
                    {
                        colMap[field] = col;
                        break;
                    }
                }
            }

            // ── Bước 2: Xử lý từng hàng dữ liệu ───────────────────────────────
            string GetCell(ClosedXML.Excel.IXLRow row, string field)
            {
                if (!colMap.TryGetValue(field, out int col)) return "";
                return row.Cell(col).Value.ToString().Trim();
            }

            var culture = System.Globalization.CultureInfo.InvariantCulture;

            foreach (var row in allRows.Skip(1))
            {
                var itemCode = GetCell(row, "ItemCode");
                var name     = GetCell(row, "Name");

                if (string.IsNullOrEmpty(itemCode) && string.IsNullOrEmpty(name)) continue;

                var category         = GetCell(row, "Category");
                var unit             = GetCell(row, "Unit");
                var totalQuantityStr = GetCell(row, "TotalQuantity");
                var basePriceStr     = GetCell(row, "BasePrice");
                var defaultPriceStr  = GetCell(row, "DefaultPriceIfLost");
                var supplier         = GetCell(row, "Supplier");

                // ── Tìm item đã tồn tại (chỉ tìm trong bản ghi đang hoạt động) ─
                HotelERP.BE.Domain.Models.Equipment? existing = null;
                if (!string.IsNullOrEmpty(itemCode))
                    existing = await context.Equipments.FirstOrDefaultAsync(e => e.ItemCode == itemCode && e.IsActive);

                if (existing == null && !string.IsNullOrEmpty(name))
                    existing = await context.Equipments.FirstOrDefaultAsync(e => e.Name == name && e.IsActive);

                if (existing != null)
                {
                    // Cập nhật thông tin (giữ nguyên nếu cột không có trong file)
                    if (!string.IsNullOrEmpty(name))     existing.Name     = name;
                    if (!string.IsNullOrEmpty(category)) existing.Category = category;
                    if (!string.IsNullOrEmpty(unit))     existing.Unit     = unit;
                    if (!string.IsNullOrEmpty(supplier)) existing.Supplier = supplier;

                    // Cộng thêm số lượng nhập vào
                    if (!string.IsNullOrEmpty(totalQuantityStr) && int.TryParse(totalQuantityStr, out int tq) && tq > 0)
                        existing.TotalQuantity += tq;

                    if (!string.IsNullOrEmpty(basePriceStr) && decimal.TryParse(basePriceStr, System.Globalization.NumberStyles.Any, culture, out decimal bp))
                        existing.BasePrice = bp;

                    if (!string.IsNullOrEmpty(defaultPriceStr) && decimal.TryParse(defaultPriceStr, System.Globalization.NumberStyles.Any, culture, out decimal dp))
                        existing.DefaultPriceIfLost = dp;

                    existing.IsActive  = true;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Tạo mới
                    var newCode     = !string.IsNullOrEmpty(itemCode) ? itemCode : $"VT-{Guid.NewGuid().ToString()[..6].ToUpper()}";
                    var newName     = !string.IsNullOrEmpty(name)     ? name     : newCode;
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