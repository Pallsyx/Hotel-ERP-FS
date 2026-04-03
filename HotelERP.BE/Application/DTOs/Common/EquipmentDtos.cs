namespace HotelERP.BE.Application.DTOs;

public record EquipmentResponseDto(
    int Id,
    string Name,
    string Unit,
    int InStockQuantity,
    decimal DefaultPriceIfLost
);
