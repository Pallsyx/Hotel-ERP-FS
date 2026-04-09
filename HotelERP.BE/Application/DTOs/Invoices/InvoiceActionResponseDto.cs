namespace HotelERP.BE.DTOs.Invoices;

public class InvoiceActionResponseDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;

    public int InvoiceId { get; set; }
    public string InvoiceCode { get; set; } = string.Empty;

    public string InvoiceStatus { get; set; } = string.Empty;
    public string BookingStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;

    public decimal TotalRoomAmount { get; set; }
    public decimal TotalServiceAmount { get; set; }
    public decimal TotalDamageAmount { get; set; }
    public decimal ManualAdjustmentAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal FinalTotal { get; set; }

    public string? Notes { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public int? PaymentId { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionCode { get; set; }
}