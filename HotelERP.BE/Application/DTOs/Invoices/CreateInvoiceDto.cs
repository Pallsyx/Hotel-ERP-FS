namespace HotelERP.BE.Application.DTOs.Invoices
{
    public class CreateInvoiceDto
    {
        public int BookingId { get; set; }
        public string PaymentMethod { get; set; } = "CASH"; // Mặc định tiền mặt
        public string? Notes { get; set; }
    }
}