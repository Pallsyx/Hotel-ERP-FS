using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.DTOs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;

namespace HotelERP.BE.Application.Services;

public class RoomInventoryService(HotelDbContext context) : IRoomInventoryService
{
    public async Task<IEnumerable<RoomInventoryResponseDto>> GetInventoriesByRoomIdAsync(int roomId)
    {
        return await context.RoomInventories
            .Where(i => i.RoomId == roomId)
            .Select(i => new RoomInventoryResponseDto(
                i.Id, 
                i.ItemName, 
                i.Quantity, 
                i.Status, 
                i.PriceIfLost))
            .ToListAsync();
    }

    public async Task<int> AddInventoryAsync(int roomId, AddInventoryRequest request)
    {
        var inventory = new RoomInventory 
        { 
            RoomId = roomId, 
            ItemName = request.ItemName, 
            Quantity = request.Quantity, 
            Status = request.Condition, // Map Condition từ DTO vào Status của Model
            ItemType = request.IsMinibar ? "MINIBAR" : "ASSET", // Phân loại theo checklist
            PriceIfLost = request.PriceIfLost,
            CreatedAt = DateTime.UtcNow
        };
        
        context.RoomInventories.Add(inventory);
        await context.SaveChangesAsync();
        return inventory.Id;
    }

    public async Task<bool> DeleteInventoryAsync(int inventoryId)
    {
        var inventory = await context.RoomInventories.FindAsync(inventoryId);
        if (inventory == null) return false;
        
        context.RoomInventories.Remove(inventory);
        await context.SaveChangesAsync();
        return true;
    }
}