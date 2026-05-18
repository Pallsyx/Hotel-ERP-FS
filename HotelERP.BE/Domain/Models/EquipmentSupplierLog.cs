namespace HotelERP.BE.Domain.Models;

public class EquipmentSupplierLog
{
    public int Id { get; set; }

    public int EquipmentId { get; set; }

    public virtual Equipment Equipment { get; set; } = null!;

    public string SupplierName { get; set; } = string.Empty;

    /// <summary>Số lượng nhập từ NCC này trong lần này</summary>
    public int Quantity { get; set; }

    /// <summary>Giá nhập từ NCC này</summary>
    public decimal UnitPrice { get; set; }

    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }
}
