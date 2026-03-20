using Microsoft.EntityFrameworkCore;
using HotelERP.Application.Interfaces;
using HotelERP.Application.DTOs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;

namespace HotelERP.Application.Services;

public class AmenityService(HotelDbContext context) : IAmenityService
{
    public async Task<IEnumerable<AmenityResponseDto>> GetAllAmenitiesAsync()
    {
        // Chỉ lấy các tiện nghi chưa bị xóa mềm
        return await context.Amenities
            .Where(a => a.DeletedAt == null)
            .Select(a => new AmenityResponseDto(a.Id, a.Name, a.IconUrl))
            .ToListAsync();
    }

    public async Task<AmenityResponseDto?> GetAmenityByIdAsync(int id)
    {
        var amenity = await context.Amenities
            .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
            
        if (amenity == null) return null;
        return new AmenityResponseDto(amenity.Id, amenity.Name, amenity.IconUrl);
    }

    public async Task<int> CreateAmenityAsync(CreateAmenityRequest request)
    {
        var amenity = new Amenity 
        { 
            Name = request.Name, 
            IconUrl = request.Icon, // Map Icon từ request vào IconUrl của Model
            Status = "ACTIVE",      // Gán giá trị mặc định cho trường Status
            CreatedAt = DateTime.UtcNow
        };
        
        context.Amenities.Add(amenity);
        await context.SaveChangesAsync();
        return amenity.Id;
    }

    public async Task<bool> UpdateAmenityAsync(int id, UpdateAmenityRequest request)
    {
        var amenity = await context.Amenities
            .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
            
        if (amenity == null) return false;

        amenity.Name = request.Name;
        amenity.IconUrl = request.Icon;
        amenity.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAmenityAsync(int id)
    {
        var amenity = await context.Amenities.FindAsync(id);
        if (amenity == null) return false;

        // Soft Delete: Chỉ cập nhật ngày xóa, không xóa khỏi DB
        amenity.DeletedAt = DateTime.UtcNow; 
        await context.SaveChangesAsync();
        return true;
    }
}