using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Services;
using HotelERP.BE.Application.DTOs.Article;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.AspNetCore.Http; // Sửa lỗi thiếu dấu chấm phẩy ở đây

namespace HotelERP.BE.Controllers;

[Route("api/Articles")] // ĐÃ SỬA THÀNH SỐ NHIỀU
[ApiController]
public class ArticlesController : ControllerBase
{
    private readonly ArticleService _articleService;
    private readonly HotelDbContext _context;

    public ArticlesController(ArticleService articleService, HotelDbContext context) // Sửa tên constructor
    {
        _articleService = articleService;
        _context = context;
    }

    // ==========================================
    // 1. TÌM KIẾM BÀI VIẾT (Cho Khách hàng)
    // URL: GET /api/Articles/search?keyword=abc&categoryName=Tin tức
    // ==========================================
    [HttpGet("search")]
    [AllowAnonymous] 
    public async Task<IActionResult> Search([FromQuery] string? keyword, [FromQuery] string? categoryName)
    {
        // Public search only returns Published articles (default param)
        var result = await _articleService.SearchArticlesAsync(keyword, categoryName);
        return Ok(result);
    }

    // ==========================================
    // 1.5. LẤY TẤT CẢ BÀI VIẾT (Cho Admin/Manager)
    // URL: GET /api/Articles/admin
    // ==========================================
    [HttpGet("admin")]
    [Authorize]
    public async Task<IActionResult> GetForAdmin([FromQuery] string? keyword, [FromQuery] string? categoryName, [FromQuery] string? status)
    {
        // Pass the explicit status filter, or "ALL" if not provided
        var result = await _articleService.SearchArticlesAsync(keyword, categoryName, status ?? "ALL");
        return Ok(result);
    }

    // ==========================================
    // 2. LẤY CHI TIẾT 1 BÀI VIẾT BẰNG SLUG
    // URL: GET /api/Articles/khuyen-mai-mua-he
    // ==========================================
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArticleBySlug(string slug)
    {
        var article = await _context.Articles
            .Include(a => a.Category)
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            return NotFound(new { message = "Bài viết không tồn tại." });
        }

        return Ok(article);
    }

    // ==========================================
    // 3. TẠO BÀI VIẾT MỚI (Cho Admin/Manager)
    // URL: POST /api/Articles
    // ==========================================
    [HttpPost]
    [Authorize] 
    public async Task<IActionResult> Create([FromForm] ArticleRequestDto request)
    {
        try
        {
            var newArticle = await _articleService.CreateArticleAsync(request);
            return CreatedAtAction(nameof(GetArticleBySlug), new { slug = newArticle.Slug }, newArticle);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi tạo bài viết: " + ex.Message });
        }
    }

    // ==========================================
    // 4. CẬP NHẬT BÀI VIẾT 
    // URL: PUT /api/Articles/{id}
    // ==========================================
    [HttpPut("{id}")]
    [Authorize] 
    public async Task<IActionResult> Update(int id, [FromForm] ArticleRequestDto request)
    {
        try
        {
            var updatedArticle = await _articleService.UpdateArticleAsync(id, request);
            return Ok(new { message = "Cập nhật bài viết thành công", data = updatedArticle });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi cập nhật: " + ex.Message });
        }
    }

    // ==========================================
    // 5. XÓA BÀI VIẾT (SOFT DELETE)
    // URL: DELETE /api/Articles/{id}
    // ==========================================
    [HttpDelete("{id}")]
    [Authorize] 
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _articleService.DeleteArticleAsync(id);
            return Ok(new { message = "Xóa bài viết thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi khi xóa: " + ex.Message });
        }
    }

    // ==========================================
    // 6. UPLOAD ẢNH BÌA RIÊNG BIỆT (MỚI THÊM)
    // URL: POST /api/Articles/{id}/thumbnail
    // ==========================================
    [HttpPost("{id}/thumbnail")]
    // [Authorize] // Tạm thời tắt để bạn dễ test, sau này bỏ // đi nhé
    public async Task<IActionResult> UploadThumbnail(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { success = false, message = "Vui lòng chọn một file ảnh hợp lệ." });
        }

        try
        {
            // Gọi hàm UploadThumbnailAsync bên trong ArticleService
            var imageUrl = await _articleService.UploadThumbnailAsync(id, file);
            return Ok(new 
            { 
                success = true, 
                message = "Cập nhật ảnh bìa thành công!", 
                thumbnailUrl = imageUrl 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}