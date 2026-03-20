using HotelERP.BE.Application.DTOs;

namespace HotelERP.BE.Application.Interfaces;

public interface IRoomInventoryService
{
    Task<IEnumerable<RoomInventoryResponseDto>> GetInventoriesByRoomIdAsync(int roomId);
    Task<int> AddInventoryAsync(int roomId, AddInventoryRequest request);
    Task<bool> DeleteInventoryAsync(int inventoryId);
}