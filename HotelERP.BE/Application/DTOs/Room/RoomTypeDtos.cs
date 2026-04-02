using Microsoft.AspNetCore.Http;

namespace HotelERP.BE.Application.DTOs;

public record AmenitySimpleDto(
    int Id,
    string Name,
    string? IconUrl
);

public record RoomTypeResponseDto(
    int Id,
    string Name,
    string? Description,
    decimal BasePrice,
    int CapacityAdults,
    int CapacityChildren,
    string? ImageUrl,
    List<AmenitySimpleDto> Amenities
);

public record CreateRoomTypeRequest(
    string Name,
    string? Description,
    decimal BasePrice,
    int CapacityAdults,
    int CapacityChildren,
    IFormFile? Image
);

public record UpdateRoomTypeRequest(
    string Name,
    string? Description,
    decimal BasePrice,
    int CapacityAdults,
    int CapacityChildren,
    IFormFile? Image
);

public record UpdateRoomTypeAmenitiesRequest(
    List<int> AmenityIds
);