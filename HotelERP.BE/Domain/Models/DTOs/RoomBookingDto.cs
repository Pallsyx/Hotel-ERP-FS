namespace HotelERP.BE.Domain.Models.DTOs
{
    public class RoomBookingDto
    {
        public int RoomTypeId { get; set; } // ID của loại phòng khách chọn
        public int Quantity { get; set; }   // Số lượng phòng của loại đó
    }
}