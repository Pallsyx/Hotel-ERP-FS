using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.Controllers;

// --- DTOs giúp nhận/trả dữ liệu an toàn ---
public record CreateAttractionDto(string Name, string? Description, decimal Latitude, decimal Longitude, decimal? DistanceKm, string? ImageUrl, string? ImagePublicId, string? MapEmbedLink);
public record UpdateAttractionDto(string Name, string? Description, decimal Latitude, decimal Longitude, decimal? DistanceKm, string? ImageUrl, string? ImagePublicId, string? MapEmbedLink, string Status);

[Route("api/[controller]")]
[ApiController]
public class AttractionController(HotelDbContext context) : ControllerBase
{
    // Lấy danh sách địa điểm
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var attractions = await context.Attractions.ToListAsync();
        return Ok(attractions);
    }

    // Lấy chi tiết 1 địa điểm
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var attraction = await context.Attractions.FindAsync(id);
        if (attraction is null) return NotFound("Không tìm thấy địa điểm.");
        return Ok(attraction);
    }

    // Thêm mới địa điểm (Đảm bảo nhận GPS)
    [HttpPost]
    public async Task<IActionResult> Create(CreateAttractionDto dto)
    {
        Attraction newAttraction = new()
        {
            Name = dto.Name,
            Description = dto.Description,
            Latitude = dto.Latitude,         // Lưu tọa độ GPS
            Longitude = dto.Longitude,       // Lưu tọa độ GPS
            DistanceKm = dto.DistanceKm,
            ImageUrl = dto.ImageUrl,
            ImagePublicId = dto.ImagePublicId,
            MapEmbedLink = dto.MapEmbedLink,
            CreatedAt = DateTime.UtcNow,
            Status = "ACTIVE"
        };

        context.Attractions.Add(newAttraction);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = newAttraction.Id }, newAttraction);
    }

    // Cập nhật địa điểm
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAttractionDto dto)
    {
        var attraction = await context.Attractions.FindAsync(id);
        if (attraction is null) return NotFound("Không tìm thấy địa điểm.");

        attraction.Name = dto.Name;
        attraction.Description = dto.Description;
        attraction.Latitude = dto.Latitude;
        attraction.Longitude = dto.Longitude;
        attraction.DistanceKm = dto.DistanceKm;
        attraction.ImageUrl = dto.ImageUrl;
        attraction.ImagePublicId = dto.ImagePublicId;
        attraction.MapEmbedLink = dto.MapEmbedLink;
        attraction.Status = dto.Status;
        attraction.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công", data = attraction });
    }

    // Xóa địa điểm
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var attraction = await context.Attractions.FindAsync(id);
        if (attraction is null) return NotFound("Không tìm thấy địa điểm.");

        context.Attractions.Remove(attraction);
        await context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa địa điểm." });
    }
}