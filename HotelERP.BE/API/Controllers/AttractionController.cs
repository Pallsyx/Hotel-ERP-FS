using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Application.Interfaces;

namespace HotelERP.BE.Controllers;

// DTO thêm mới địa điểm
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

// DTO cập nhật địa điểm
public class UpdateAttractionDto : CreateAttractionDto
{
}

[Route("api/[controller]")]
[ApiController]
public class AttractionController(HotelDbContext context, IPhotoService photoService) : ControllerBase
{
    // Lấy danh sách địa điểm
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var attractions = await context.Attractions
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(attractions);
    }

    // Lấy chi tiết 1 địa điểm
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var attraction = await context.Attractions.FindAsync(id);

        if (attraction is null)
        {
            return NotFound(new { message = "Không tìm thấy địa điểm." });
        }

        return Ok(attraction);
    }

    // Thêm mới địa điểm
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] CreateAttractionDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Tên địa điểm không được để trống." });
            }

            string? imageUrl = null;
            string? imagePublicId = null;

            if (dto.ImageFile is not null && dto.ImageFile.Length > 0)
            {
                var uploadResult = await photoService.UploadPhotoAsync(dto.ImageFile);
                imageUrl = uploadResult.Url;
                imagePublicId = uploadResult.PublicId;
            }

            var newAttraction = new Attraction
            {
                Name = dto.Name.Trim(),
                Type = dto.Type,
                Description = dto.Description,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                DistanceKm = dto.DistanceKm,
                ImageUrl = imageUrl,
                ImagePublicId = imagePublicId,
                MapEmbedLink = dto.MapEmbedLink,
                CreatedAt = DateTime.UtcNow,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "ACTIVE" : dto.Status
            };

            context.Attractions.Add(newAttraction);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = newAttraction.Id }, newAttraction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Lỗi khi tạo địa điểm.",
                error = ex.InnerException?.Message ?? ex.Message
            });
        }
    }

    // Cập nhật địa điểm
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateAttractionDto dto)
    {
        try
        {
            var attraction = await context.Attractions.FindAsync(id);

            if (attraction is null)
            {
                return NotFound(new { message = "Không tìm thấy địa điểm." });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Tên địa điểm không được để trống." });
            }

            attraction.Name = dto.Name.Trim();
            attraction.Type = dto.Type;
            attraction.Description = dto.Description;
            attraction.Latitude = dto.Latitude;
            attraction.Longitude = dto.Longitude;
            attraction.DistanceKm = dto.DistanceKm;
            attraction.MapEmbedLink = dto.MapEmbedLink;
            attraction.Status = string.IsNullOrWhiteSpace(dto.Status) ? "ACTIVE" : dto.Status;
            attraction.UpdatedAt = DateTime.UtcNow;

            if (dto.ImageFile is not null && dto.ImageFile.Length > 0)
            {
                var uploadResult = await photoService.UploadPhotoAsync(dto.ImageFile);
                attraction.ImageUrl = uploadResult.Url;
                attraction.ImagePublicId = uploadResult.PublicId;
            }

            await context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật địa điểm thành công.",
                data = attraction
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Lỗi khi cập nhật địa điểm.",
                error = ex.InnerException?.Message ?? ex.Message
            });
        }
    }

    // Xóa địa điểm
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var attraction = await context.Attractions.FindAsync(id);

            if (attraction is null)
            {
                return NotFound(new { message = "Không tìm thấy địa điểm." });
            }

            context.Attractions.Remove(attraction);
            await context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa địa điểm." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Lỗi khi xóa địa điểm.",
                error = ex.InnerException?.Message ?? ex.Message
            });
        }
    }
}