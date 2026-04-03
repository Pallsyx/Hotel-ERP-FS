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
        return await (
            from ri in context.RoomInventories.AsNoTracking()
            join e in context.Equipments.AsNoTracking() on ri.EquipmentId equals e.Id
            where ri.RoomId == roomId && (ri.IsActive == true || ri.IsActive == null)
            orderby ri.Id descending
            select new RoomInventoryResponseDto(
                ri.Id,
                e.Name,
                ri.Quantity,
                string.IsNullOrWhiteSpace(ri.Note) ? "Tốt" : ri.Note!,
                ri.PriceIfLost
            )
        ).ToListAsync();
    }

    public async Task<int> AddInventoryAsync(int roomId, AddInventoryRequest request)
    {
        var roomExists = await context.Rooms.AnyAsync(r => r.Id == roomId);
        if (!roomExists)
            throw new InvalidOperationException("Phòng không tồn tại.");

        if (string.IsNullOrWhiteSpace(request.ItemName))
            throw new InvalidOperationException("Tên vật tư không được để trống.");

        if (request.Quantity <= 0)
            throw new InvalidOperationException("Số lượng phải lớn hơn 0.");

        if (request.PriceIfLost <= 0)
            throw new InvalidOperationException("Giá đền bù phải lớn hơn 0.");

        var itemName = request.ItemName.Trim();

        var equipment = await context.Equipments
            .FirstOrDefaultAsync(e => e.Name == itemName);

        if (equipment == null)
        {
            equipment = new Equipment
            {
                ItemCode = $"AUTO-{DateTime.UtcNow:yyyyMMddHHmmss}",
                Name = itemName,
                Category = request.IsMinibar ? "Minibar" : "Khác",
                Unit = "Cái",
                TotalQuantity = request.Quantity,
                InUseQuantity = request.Quantity,
                DamagedQuantity = 0,
                LiquidatedQuantity = 0,
                BasePrice = request.PriceIfLost,
                DefaultPriceIfLost = request.PriceIfLost,
                Supplier = "Tạo từ kiểm kê phòng",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();
        }

        var inventory = new RoomInventory
        {
            RoomId = roomId,
            Quantity = request.Quantity,
            PriceIfLost = request.PriceIfLost,
            Note = string.IsNullOrWhiteSpace(request.Condition) ? "Tốt" : request.Condition.Trim(),
            IsActive = true,
            ItemType = request.IsMinibar ? "MINIBAR" : "ASSET",
            EquipmentId = equipment.Id
        };

        context.RoomInventories.Add(inventory);
        await context.SaveChangesAsync();

        return inventory.Id;
    }

    public async Task<bool> UpdateInventoryAsync(int roomId, int inventoryId, UpdateInventoryRequest request)
    {
        var inventory = await context.RoomInventories
            .FirstOrDefaultAsync(x => x.Id == inventoryId && x.RoomId == roomId);

        if (inventory == null) return false;

        if (string.IsNullOrWhiteSpace(request.ItemName))
            throw new InvalidOperationException("Tên vật tư không được để trống.");

        if (request.Quantity <= 0)
            throw new InvalidOperationException("Số lượng phải lớn hơn 0.");

        if (request.PriceIfLost <= 0)
            throw new InvalidOperationException("Giá đền bù phải lớn hơn 0.");

        var itemName = request.ItemName.Trim();

        var equipment = await context.Equipments
            .FirstOrDefaultAsync(e => e.Name == itemName);

        if (equipment == null)
        {
            equipment = new Equipment
            {
                ItemCode = $"AUTO-{DateTime.UtcNow:yyyyMMddHHmmss}",
                Name = itemName,
                Category = request.IsMinibar ? "Minibar" : "Khác",
                Unit = "Cái",
                TotalQuantity = request.Quantity,
                InUseQuantity = request.Quantity,
                DamagedQuantity = 0,
                LiquidatedQuantity = 0,
                BasePrice = request.PriceIfLost,
                DefaultPriceIfLost = request.PriceIfLost,
                Supplier = "Tạo từ kiểm kê phòng",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Equipments.Add(equipment);
            await context.SaveChangesAsync();
        }

        inventory.Quantity = request.Quantity;
        inventory.PriceIfLost = request.PriceIfLost;
        inventory.Note = string.IsNullOrWhiteSpace(request.Condition) ? "Tốt" : request.Condition.Trim();
        inventory.ItemType = request.IsMinibar ? "MINIBAR" : "ASSET";
        inventory.EquipmentId = equipment.Id;
        inventory.IsActive = true;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteInventoryAsync(int roomId, int inventoryId)
    {
        var inventory = await context.RoomInventories
            .FirstOrDefaultAsync(x => x.Id == inventoryId && x.RoomId == roomId);

        if (inventory == null) return false;

        inventory.IsActive = false;
        await context.SaveChangesAsync();
        return true;
    }
}