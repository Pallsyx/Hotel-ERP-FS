using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;

namespace HotelERP.BE.Application.Services;

public class RoomTypeAmenityService(HotelDbContext context) : IRoomTypeAmenityService
{
    public async Task<bool> UpdateAmenitiesForRoomTypeAsync(int roomTypeId, List<int> amenityIds)
    {
        var roomType = await context.RoomTypes.FindAsync(roomTypeId);
        if (roomType == null || roomType.DeletedAt != null) return false;

        // Xóa các liên kết cũ
        var existingLinks = context.RoomTypeAmenities.Where(ra => ra.RoomTypeId == roomTypeId);
        context.RoomTypeAmenities.RemoveRange(existingLinks);

        // Thêm liên kết mới
        var newLinks = amenityIds.Select(id => new RoomTypeAmenity
        {
            RoomTypeId = roomTypeId,
            AmenityId = id,
            CreatedAt = DateTime.UtcNow // Gán ngày tạo
        });

        await context.RoomTypeAmenities.AddRangeAsync(newLinks);
        await context.SaveChangesAsync();
        return true;
    }
}