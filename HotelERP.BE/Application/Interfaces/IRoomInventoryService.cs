using HotelERP.Application.DTOs;

namespace HotelERP.Application.Interfaces;

public interface IRoomInventoryService
{
    Task<IEnumerable<RoomInventoryResponseDto>> GetInventoriesByRoomIdAsync(int roomId);
    Task<int> AddInventoryAsync(int roomId, AddInventoryRequest request);
    Task<bool> DeleteInventoryAsync(int inventoryId);
}