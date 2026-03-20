using Microsoft.EntityFrameworkCore;
using HotelERP.Application.Interfaces;
using HotelERP.Application.DTOs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;

namespace HotelERP.Application.Services;

public class RoomTypeService(HotelDbContext context, ICloudinaryService cloudinaryService) : IRoomTypeService
{
    public async Task<IEnumerable<RoomTypeResponseDto>> GetRoomTypesAsync()
    {
        return await context.RoomTypes
            .Where(rt => rt.DeletedAt == null) 
            .Select(rt => new RoomTypeResponseDto(
                rt.Id, rt.Name, rt.Description, rt.BasePrice, 
                rt.CapacityAdults, rt.CapacityChildren, rt.ImageUrl)) 
            .ToListAsync();
    }

    public async Task<RoomTypeResponseDto?> GetRoomTypeByIdAsync(int id)
    {
        var rt = await context.RoomTypes
            .FirstOrDefaultAsync(rt => rt.Id == id && rt.DeletedAt == null);
        if (rt == null) return null;
        return new RoomTypeResponseDto(rt.Id, rt.Name, rt.Description, rt.BasePrice, rt.CapacityAdults, rt.CapacityChildren, rt.ImageUrl); //
    }

    public async Task<int> CreateRoomTypeAsync(CreateRoomTypeRequest request)
    {
        var roomType = new RoomType
        {
            Name = request.Name, 
            Description = request.Description, 
            BasePrice = request.BasePrice, 
            CapacityAdults = request.CapacityAdults, 
            CapacityChildren = request.CapacityChildren,
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        if (request.Image != null && request.Image.Length > 0)
        {
            var uploadResult = await cloudinaryService.UploadImageAsync(request.Image, "room_types");
            roomType.ImageUrl = uploadResult.Url;
            roomType.CloudinaryPublicId = uploadResult.PublicId;
        }

        context.RoomTypes.Add(roomType);
        await context.SaveChangesAsync();
        return roomType.Id;
    }

    public async Task<bool> UpdateRoomTypeAsync(int id, UpdateRoomTypeRequest request)
    {
        var roomType = await context.RoomTypes.FindAsync(id);
        if (roomType == null || roomType.DeletedAt != null) return false;

        roomType.Name = request.Name;
        roomType.Description = request.Description;
        roomType.BasePrice = request.BasePrice;
        roomType.CapacityAdults = request.CapacityAdults;
        roomType.CapacityChildren = request.CapacityChildren;
        roomType.UpdatedAt = DateTime.UtcNow;

        if (request.Image != null && request.Image.Length > 0)
        {
            if (!string.IsNullOrEmpty(roomType.CloudinaryPublicId))
            {
                await cloudinaryService.DeleteImageAsync(roomType.CloudinaryPublicId);
            }

            var uploadResult = await cloudinaryService.UploadImageAsync(request.Image, "room_types");
            roomType.ImageUrl = uploadResult.Url;
            roomType.CloudinaryPublicId = uploadResult.PublicId;
        }

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoomTypeAsync(int id)
    {
        var roomType = await context.RoomTypes.FindAsync(id);
        if (roomType == null) return false;

        roomType.DeletedAt = DateTime.UtcNow; 
        await context.SaveChangesAsync();
        return true;
    }
}