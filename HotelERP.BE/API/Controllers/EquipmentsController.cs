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
    public async Task<IActionResult> GetEquipments(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] bool includeDeleted = false)
    {
        // Mặc định chỉ lấy IsActive=true, trừ khi muốn xem sản phẩm đã xóa mềm
        var query = includeDeleted
            ? context.Equipments.Where(e => !e.IsActive)
            : context.Equipments.Where(e => e.IsActive);

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
                e.DefaultPriceIfLost,
                e.Supplier
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
            Supplier = req.Supplier,
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
        equipment.Supplier = req.Supplier;
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

    [HttpPatch("{id}/restore")]
    public async Task<IActionResult> RestoreEquipment(int id)
    {
        // Chỉ tìm trong sản phẩm đã xóa mềm
        var equipment = await context.Equipments.FirstOrDefaultAsync(e => e.Id == id && !e.IsActive);
        if (equipment == null)
            return NotFound(new { success = false, message = "Không tìm thấy vật tư đã xóa!" });

        // Kiểm tra xem trong kho có sản phẩm tương tự đang hoạt động không
        var duplicate = await context.Equipments.FirstOrDefaultAsync(e =>
            e.Name == equipment.Name &&
            e.Supplier == equipment.Supplier &&
            e.IsActive &&
            e.Id != id);

        if (duplicate != null)
        {
            return BadRequest(new
            {
                success = false,
                message = $"Không thể khôi phục: trong kho đang có sản phẩm \"{ equipment.Name}\" " +
                          $"(mã {duplicate.ItemCode}) cùng nhà cung cấp đang hoạt động. " +
                          $"Vui lòng xóa sản phẩm trùng trước khi khôi phục."
            });
        }

        equipment.IsActive = true;
        equipment.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return Ok(new { success = true, message = $"Đã khôi phục \"{ equipment.Name}\" vào kho!" });
    }

    [HttpGet("{id}/suppliers")]
    public async Task<IActionResult> GetSupplierLogs(int id)
    {
        var equipment = await context.Equipments.FirstOrDefaultAsync(e => e.Id == id);
        if (equipment == null)
            return NotFound(new { success = false, message = "Không tìm thấy vật tư!" });

        var logs = await context.EquipmentSupplierLogs
            .Where(l => l.EquipmentId == id)
            .OrderByDescending(l => l.ImportedAt)
            .Select(l => new
            {
                l.Id,
                l.SupplierName,
                l.Quantity,
                l.UnitPrice,
                l.ImportedAt,
                l.Notes
            })
            .ToListAsync();

        // Tổng hợp theo từng NCC
        var summary = logs
            .GroupBy(l => l.SupplierName)
            .Select(g => new
            {
                supplierName = g.Key,
                totalQuantity = g.Sum(l => l.Quantity),
                lastUnitPrice = g.OrderByDescending(l => l.ImportedAt).First().UnitPrice,
                lastImportedAt = g.Max(l => l.ImportedAt),
                importCount = g.Count()
            })
            .OrderByDescending(s => s.totalQuantity)
            .ToList();

        return Ok(new { success = true, data = new { equipmentName = equipment.Name, summary, logs } });
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

        // FIX #2: Validate định dạng file
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xlsm")
            return BadRequest(new { success = false, message = "Chỉ hỗ trợ file .xlsx hoặc .xlsm. File .xls (Excel cũ) không được hỗ trợ." });

        int successCount = 0;
        var warnings = new List<string>();

        // FIX #4 + #6: Helper normalize giá (bỏ ký tự ngàn) + parse
        static decimal ParsePrice(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return 0;
            // Bỏ dấu chấm/phẩy ngàn: "16.000" → "16000", "16,000" → "16000"
            var normalized = raw.Trim().Replace(".", "").Replace(",", "");
            return decimal.TryParse(normalized, out var result) ? result : 0;
        }

        // FIX #5: Parse số lượng linh hoạt ("10.5" → 10, "10 kg" → 10)
        static int ParseQty(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return 0;
            var normalized = raw.Trim().Split(' ')[0].Replace(",", "").Replace(".", "");
            return int.TryParse(normalized, out var result) ? result
                   : (decimal.TryParse(raw.Trim(), out var d) ? (int)Math.Round(d) : 0);
        }

        // FIX #5b: Separator cho danh sách NCC — dùng " | " thay vì ", " tránh conflict tên NCC có dấu phẩy
        const string SupplierSep = " | ";

        try
        {
            using var stream = new System.IO.MemoryStream();
            await file.CopyToAsync(stream);

            // FIX #3: Bắt lỗi file mật khẩu / file hỏng
            ClosedXML.Excel.XLWorkbook workbook;
            try { workbook = new ClosedXML.Excel.XLWorkbook(stream); }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Không thể mở file Excel: {ex.Message}. File có thể bị mật khẩu bảo vệ hoặc bị hỏng." });
            }
            using (workbook)
            {
            // FIX #8: Tìm sheet "VatTu" trước, fallback sheet đầu tiên
            var worksheet = workbook.Worksheets.FirstOrDefault(ws =>
                ws.Name.Equals("VatTu", StringComparison.OrdinalIgnoreCase))
                ?? workbook.Worksheet(1);
            var rows = worksheet.RowsUsed().Skip(1); // Skip header

            foreach (var row in rows)
            {
                if (row == null) continue;

                // FIX #7: Safe read (formula cells, null cells)
                static string SafeCell(ClosedXML.Excel.IXLCell? cell)
                    => cell == null ? "" : (cell.CachedValue.ToString()?.Trim() ?? cell.Value.ToString()?.Trim() ?? "");

                var itemCode = SafeCell(row.Cell(1));
                var name     = SafeCell(row.Cell(2));

                if (string.IsNullOrEmpty(itemCode) && string.IsNullOrEmpty(name)) continue;

                var category = SafeCell(row.Cell(3));
                var unit     = SafeCell(row.Cell(4));
                var totalQuantityStr = SafeCell(row.Cell(5));
                var basePriceStr     = SafeCell(row.Cell(6));
                var defaultPriceStr  = SafeCell(row.Cell(7));
                var supplier         = SafeCell(row.Cell(8));

                HotelERP.BE.Domain.Models.Equipment? existing = null;
                if (!string.IsNullOrEmpty(itemCode))
                {
                    // Tìm theo ItemCode — ưu tiên Active trước
                    existing = await context.Equipments.FirstOrDefaultAsync(e => e.ItemCode == itemCode && e.IsActive);

                    if (existing == null)
                    {
                        // Không tìm thấy Active → kiểm tra soft-deleted
                        var deleted = await context.Equipments.FirstOrDefaultAsync(e => e.ItemCode == itemCode && !e.IsActive);
                        if (deleted != null)
                        {
                            // Tự động reactivate thay vì tạo mới (tránh vi phạm UNIQUE key)
                            existing = deleted;
                            warnings.Add($"Mã vật tư '{itemCode}' ({deleted.Name}) đã bị xóa khỏi kho, hệ thống tự động khôi phục và cập nhật dữ liệu.");
                        }
                    }

                    // ItemCode không tồn tại trong DB (cả active lẫn đã xóa)
                    // → Fallback sang Name + Unit để tránh tạo bản ghi trùng lặp
                    if (existing == null && !string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(unit))
                    {
                        existing = await context.Equipments.FirstOrDefaultAsync(e =>
                            e.Name == name &&
                            e.Unit.ToLower() == unit.ToLower() &&
                            e.IsActive);

                        if (existing != null)
                            warnings.Add($"Mã '{itemCode}' không tồn tại — đã gộp vào sản phẩm '{existing.Name}' ({existing.ItemCode}) theo Tên + Đơn vị tính.");
                        else
                        {
                            // Kiểm tra cả soft-deleted
                            var deletedByNameUnit = await context.Equipments.FirstOrDefaultAsync(e =>
                                e.Name == name &&
                                e.Unit.ToLower() == unit.ToLower() &&
                                !e.IsActive);
                            if (deletedByNameUnit != null)
                            {
                                existing = deletedByNameUnit;
                                warnings.Add($"Mã '{itemCode}' không tồn tại — tìm thấy '{deletedByNameUnit.Name}' ({deletedByNameUnit.ItemCode}) đã xóa, tự động khôi phục.");
                            }
                        }
                    }
                }
                else if (!string.IsNullOrEmpty(name))
                {
                    // Không có ItemCode → tìm theo Name + Unit
                    // Cùng tên + cùng đơn vị = cùng 1 sản phẩm (dù khác NCC)
                    var lookupUnit = !string.IsNullOrEmpty(unit) ? unit : null;

                    if (lookupUnit != null)
                    {
                        // Tìm active theo Name + Unit
                        existing = await context.Equipments.FirstOrDefaultAsync(e =>
                            e.Name == name &&
                            e.Unit.ToLower() == lookupUnit.ToLower() &&
                            e.IsActive);

                        // Không có active → kiểm tra soft-deleted
                        if (existing == null)
                        {
                            var deletedByNameUnit = await context.Equipments.FirstOrDefaultAsync(e =>
                                e.Name == name &&
                                e.Unit.ToLower() == lookupUnit.ToLower() &&
                                !e.IsActive);

                            if (deletedByNameUnit != null)
                            {
                                existing = deletedByNameUnit;
                                warnings.Add($"Sản phẩm '{name}' ({lookupUnit}) đã bị xóa khỏi kho, hệ thống tự động khôi phục và cập nhật dữ liệu.");
                            }
                        }
                    }
                    else
                    {
                        // Không có đơn vị → fallback tìm theo tên (active) đúng 1 kết quả
                        var sameNameCount = await context.Equipments.CountAsync(e => e.Name == name && e.IsActive);

                        if (sameNameCount > 1)
                        {
                            warnings.Add($"Bỏ qua dòng '{name}': tìm thấy {sameNameCount} sản phẩm cùng tên — cần thêm Mã Vật Tư hoặc Đơn Vị Tính để xác định đúng.");
                            continue;
                        }

                        existing = await context.Equipments.FirstOrDefaultAsync(e => e.Name == name && e.IsActive);

                        if (existing == null)
                        {
                            var deletedCount = await context.Equipments.CountAsync(e => e.Name == name && !e.IsActive);
                            if (deletedCount == 1)
                            {
                                existing = await context.Equipments.FirstOrDefaultAsync(e => e.Name == name && !e.IsActive);
                                warnings.Add($"Sản phẩm '{name}' đã bị xóa khỏi kho, hệ thống tự động khôi phục.");
                            }
                            else if (deletedCount > 1)
                            {
                                warnings.Add($"Bỏ qua dòng '{name}': tìm thấy {deletedCount} sản phẩm đã xóa cùng tên — vui lòng thêm Mã Vật Tư hoặc Đơn Vị Tính.");
                                continue;
                            }
                        }
                    }
                }

                if (existing != null)
                {
                    if (!string.IsNullOrEmpty(name)) existing.Name = name;
                    if (!string.IsNullOrEmpty(category)) existing.Category = category;
                    if (!string.IsNullOrEmpty(unit)) existing.Unit = unit;

                    // Gộp NCC vào danh sách nếu chưa có (tránh trùng lặp)
                    if (!string.IsNullOrEmpty(supplier))
                    {
                        var currentSuppliers = (existing.Supplier ?? "")
                            .Split(new[] { " | " }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => s.Trim())
                            .ToList();

                        if (!currentSuppliers.Any(s => s.Equals(supplier, StringComparison.OrdinalIgnoreCase)))
                            currentSuppliers.Add(supplier.Trim());

                        existing.Supplier = string.Join(SupplierSep, currentSuppliers);
                    }

                    // FIX #1: SET số lượng (không cộng thêm) — tránh double khi import lại
                    var qty = ParseQty(totalQuantityStr);
                    if (qty > 0) existing.TotalQuantity = qty;

                    var bp = ParsePrice(basePriceStr);
                    if (bp > 0) existing.BasePrice = bp;

                    var dp = ParsePrice(defaultPriceStr);
                    if (dp > 0) existing.DefaultPriceIfLost = dp;

                    existing.IsActive  = true;
                    existing.UpdatedAt = DateTime.UtcNow;

                    // Ghi log NCC nếu có supplier
                    if (!string.IsNullOrEmpty(supplier))
                    {
                        context.EquipmentSupplierLogs.Add(new HotelERP.BE.Domain.Models.EquipmentSupplierLog
                        {
                            EquipmentId  = existing.Id,
                            SupplierName = supplier,
                            Quantity     = qty,
                            UnitPrice    = bp,
                            ImportedAt   = DateTime.UtcNow
                        });
                    }
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

                    var newEquipment = new HotelERP.BE.Domain.Models.Equipment
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
                    };
                    context.Equipments.Add(newEquipment);
                    await context.SaveChangesAsync(); // cần Id của newEquipment để log NCC

                    // Ghi log NCC nếu có supplier
                    if (!string.IsNullOrEmpty(supplier))
                    {
                        context.EquipmentSupplierLogs.Add(new HotelERP.BE.Domain.Models.EquipmentSupplierLog
                        {
                            EquipmentId  = newEquipment.Id,
                            SupplierName = supplier,
                            Quantity     = totalQuantity,
                            UnitPrice    = basePrice,
                            ImportedAt   = DateTime.UtcNow
                        });
                    }
                } // end else (CREATE)
                successCount++;
            } // end foreach row

            await context.SaveChangesAsync();

            var message = $"Nhập Excel thành công! Đã xử lý {successCount} dòng.";
            if (warnings.Count > 0)
                message += $" {warnings.Count} dòng bị bỏ qua do thiếu thông tin định danh.";

            return Ok(new { success = true, message, warnings });

            } // end using (workbook)
        }
        catch (Exception ex)
        {
            var innerMsg = ex.InnerException?.InnerException?.Message 
                        ?? ex.InnerException?.Message 
                        ?? "Không có thêm chi tiết";
            return StatusCode(500, new { success = false, message = $"Lỗi: {ex.Message} | Chi tiết: {innerMsg}" });
        }
    }
}
