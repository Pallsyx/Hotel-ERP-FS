using HotelERP.Application.DTOs;

namespace HotelERP.Application.Interfaces;

public interface IRoomTypeService
{
    Task<IEnumerable<RoomTypeResponseDto>> GetRoomTypesAsync();
    
    Task<RoomTypeResponseDto?> GetRoomTypeByIdAsync(int id);
    
    Task<int> CreateRoomTypeAsync(CreateRoomTypeRequest request);
    
    Task<bool> UpdateRoomTypeAsync(int id, UpdateRoomTypeRequest request);
    
    Task<bool> DeleteRoomTypeAsync(int id);
}