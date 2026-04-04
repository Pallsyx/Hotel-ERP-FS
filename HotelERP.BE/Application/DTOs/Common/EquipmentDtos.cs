namespace HotelERP.BE.Application.DTOs;

public record EquipmentResponseDto(
    int Id,
    string? ImageUrl,
    string ItemCode,
    string Name,
    string Category,
    string Unit,
    int TotalQuantity,
    int InStockQuantity,
    int InUseQuantity,
    int DamagedQuantity,
    decimal DefaultPriceIfLost
);

public record CreateEquipmentDto(
    string ItemCode,
    string Name,
    string Category,
    string Unit,
    int TotalQuantity,
    decimal BasePrice,
    decimal DefaultPriceIfLost,
    string? ImageUrl
);

public record UpdateEquipmentDto(
    string ItemCode,
    string Name,
    string Category,
    string Unit,
    int TotalQuantity,
    decimal BasePrice,
    decimal DefaultPriceIfLost,
    string? ImageUrl
);
