namespace HotelERP.Application.DTOs;
public record AmenityResponseDto(int Id, string Name, string? IconUrl);
public record CreateAmenityRequest(string Name, string? Icon);
public record UpdateAmenityRequest(string Name, string? Icon);