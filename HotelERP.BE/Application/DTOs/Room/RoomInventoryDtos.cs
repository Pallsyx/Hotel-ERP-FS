namespace HotelERP.BE.Application.DTOs;
public record RoomInventoryResponseDto(int Id, string ItemName, int Quantity, string Status, decimal PriceIfLost);
public record AddInventoryRequest(string ItemName, int Quantity, string Condition, bool IsMinibar, decimal PriceIfLost);