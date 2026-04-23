using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Services;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Helpers.AuditLogs;
using HotelERP.BE.Utils;

namespace HotelERP.BE.Controllers;

// DTO để nhận dữ liệu an toàn khi người dùng tạo đánh giá mới
public record CreateReviewDto(int? UserId, int RoomTypeId, int Rating, string? Comment, string? ImageUrl, string? ImagePublicId);

[Route("api/[controller]")]
[ApiController]
public class ReviewController(HotelDbContext context, ICloudinaryService cloudinaryService) : ControllerBase
{
    // ==========================================
    // 1. LẤY DANH SÁCH (READ)
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetAllVisible()
    {
        // Lấy danh sách đánh giá mới nhất (Global Query Filter sẽ tự động bỏ qua các bài đã bị ẩn)
        var reviews = await context.Reviews.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(reviews);
    }

    // ==========================================
    // 2. THÊM ĐÁNH GIÁ MỚI (CREATE)
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewDto dto)
    {
        Review newReview = new()
        {
            UserId = dto.UserId,
            RoomTypeId = dto.RoomTypeId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            ImageUrl = dto.ImageUrl,
            ImagePublicId = dto.ImagePublicId,
            IsApproved = true, // Mặc định khi mới tạo là được phép hiển thị
            Status = "VISIBLE",
            CreatedAt = DateTime.UtcNow
        };

        context.Reviews.Add(newReview);
        await context.SaveChangesAsync();
        return Ok(new { message = "Thêm đánh giá thành công", data = newReview });
    }

    // ==========================================
    // 3. ẨN ĐÁNH GIÁ VÀ GHI LOG (UPDATE / SOFT DELETE)
    // ==========================================
    [HttpPut("{id}/hide")]
    public async Task<IActionResult> HideReview(int id)
    {
        // Thêm IgnoreQueryFilters() để tìm được cả những bài lỡ bị ẩn trước đó
        var review = await context.Reviews.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == id);
        
        if (review is null) return NotFound("Không tìm thấy đánh giá.");

        // 1. Soft Delete
        review.IsApproved = false;
        review.Status = "Hidden";

        // 2. Lấy userId và role thật từ JWT token
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(userIdRaw, out int actingUserId);
        var actingRole = User.FindFirstValue(ClaimTypes.Role) ?? "System";

        // 3. Lấy và Decode header X-Audit-Reason an toàn
        string decodedReason = "Không có lý do";
        if (Request.Headers.TryGetValue("X-Audit-Reason", out var reasonValues))
        {
            decodedReason = WebUtility.UrlDecode(reasonValues.ToString());
        }

        await context.SaveChangesAsync();

        // 4. Ghi Audit Log với userId và role thật
        await context.AddAuditLogAsync(
            userId: actingUserId,
            roleName: actingRole,
            actionType: "HIDE_REVIEW",
            entityType: "Reviews",
            message: decodedReason
        );


        return Ok(new { message = "Đã ẩn đánh giá và ghi log thành công." });
    }

    // ==========================================
    // 4. UPLOAD HÌNH ẢNH
    // ==========================================
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            // Bản xịn yêu cầu truyền thêm tham số tên thư mục (ví dụ: "reviews")
            var result = await cloudinaryService.UploadImageAsync(file, "reviews");

            return Ok(new { 
                ImageUrl = result.Url, 
                PublicId = result.PublicId 
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // ==========================================
    // 5. XÓA VĨNH VIỄN (HARD DELETE)
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await context.Reviews.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == id);
        if (review is null) return NotFound("Không tìm thấy đánh giá.");

        context.Reviews.Remove(review);
        await context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa vĩnh viễn đánh giá." });
    }
}