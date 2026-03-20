namespace HotelERP.BE.Application.DTOs.BookingEngine;

public class AvailableRoomTypeResponse {
    public int RoomTypeId { get; set; }
    public string Name { get; set; } = null!;
    public decimal BasePrice { get; set; }
    public int AvailableCount { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
}