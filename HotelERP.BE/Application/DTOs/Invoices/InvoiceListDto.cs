public class InvoiceListDto
{
    public int Id { get; set; }
    public string? InvoiceCode { get; set; }
    public string? BookingCode { get; set; }
    public int? BookingId { get; set; }
    public decimal? FinalTotal { get; set; } // PHẢI CÓ DẤU ?
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; } // PHẢI CÓ DẤU ?
}