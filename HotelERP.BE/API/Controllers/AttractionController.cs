using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.Controllers;

// --- DTOs giúp nhận/trả dữ liệu an toàn ---
public class CreateAttractionDto
{
    public string Name { get; set; } = null!;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal? DistanceKm { get; set; }
    public string? MapEmbedLink { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public IFormFile? ImageFile { get; set; }
}

public class UpdateAttractionDto : CreateAttractionDto
{
    public string Status { get; set; } = "ACTIVE";
}

[Route("api/[controller]")]
[ApiController]
public class AttractionController(HotelDbContext context, HotelERP.BE.Application.Interfaces.IPhotoService photoService) : ControllerBase
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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] CreateAttractionDto dto)
    {
        string? imageUrl = null;
        string? imagePublicId = null;

        if (dto.ImageFile != null)
        {
            var uploadResult = await photoService.UploadPhotoAsync(dto.ImageFile);
            imageUrl = uploadResult.Url;
            imagePublicId = uploadResult.PublicId;
        }

        try
        {
            Name = dto.Name,
            Type = dto.Type,
            Description = dto.Description,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            DistanceKm = dto.DistanceKm,
            ImageUrl = imageUrl,
            ImagePublicId = imagePublicId,
            MapEmbedLink = dto.MapEmbedLink,
            CreatedAt = DateTime.UtcNow,
            Status = !string.IsNullOrEmpty(dto.Status) ? dto.Status : "ACTIVE"
        };

            context.Attractions.Add(newAttraction);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = newAttraction.Id }, newAttraction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo địa điểm: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }

    // Cập nhật địa điểm
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateAttractionDto dto)
    {
        var attraction = await context.Attractions.FindAsync(id);
        if (attraction is null) return NotFound("Không tìm thấy địa điểm.");

        attraction.Name = dto.Name;
        attraction.Type = dto.Type;
        attraction.Description = dto.Description;
        attraction.Latitude = dto.Latitude;
        attraction.Longitude = dto.Longitude;
        attraction.DistanceKm = dto.DistanceKm;
        attraction.MapEmbedLink = dto.MapEmbedLink;
        attraction.Status = dto.Status;
        attraction.UpdatedAt = DateTime.UtcNow;

        if (dto.ImageFile != null)
        {
            var uploadResult = await photoService.UploadPhotoAsync(dto.ImageFile);
            attraction.ImageUrl = uploadResult.Url;
            attraction.ImagePublicId = uploadResult.PublicId;
        }

        await context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công", data = attraction });
    }

    // Xóa địa điểm
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var attraction = await context.Attractions.FindAsync(id);
        if (attraction is null) return NotFound("Không tìm thấy địa điểm.");

        context.Attractions.Remove(attraction);
        await context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa địa điểm." });
    }
}