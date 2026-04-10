namespace HotelERP.BE.Application.DTOs
{
    public class DraftInvoiceDto
    {
        public int BookingId { get; set; }
        public string BookingCode { get; set; }
        public decimal TotalRoomAmount { get; set; }
        public decimal TotalServiceAmount { get; set; }
        public decimal TotalDamageAmount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalTotal { get; set; }
        // Có thể thêm list chi tiết nếu thằng Long cần vẽ bảng con
    }
}