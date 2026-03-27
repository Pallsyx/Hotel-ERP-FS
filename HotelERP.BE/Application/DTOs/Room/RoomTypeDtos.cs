using Microsoft.AspNetCore.Http;

namespace HotelERP.BE.Application.DTOs;
public record RoomTypeResponseDto(int Id, string Name, string? Description, decimal BasePrice, int CapacityAdults, int CapacityChildren, string? ImageUrl);
public record CreateRoomTypeRequest(string Name, string? Description, decimal BasePrice, int CapacityAdults, int CapacityChildren, IFormFile? Image);
public record UpdateRoomTypeRequest(string Name, string? Description, decimal BasePrice, int CapacityAdults, int CapacityChildren, IFormFile? Image);