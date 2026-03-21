using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Services;
using HotelERP.BE.DTOs;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ArticleController : ControllerBase
{
    private readonly ArticleService _articleService;
    private readonly HotelDbContext _context;

    public ArticleController(ArticleService articleService, HotelDbContext context)
    {
        _articleService = articleService;
        _context = context;
    }

    // ==========================================
    // 1. TÌM KIẾM BÀI VIẾT (Cho Khách hàng)
    // URL: GET /api/article/search?keyword=abc&categoryName=Tin tức khách sạn
    // ==========================================
    [HttpGet("search")]
    [AllowAnonymous] 
    public async Task<IActionResult> Search([FromQuery] string? keyword, [FromQuery] string? categoryName)
    {
        var result = await _articleService.SearchArticlesAsync(keyword, categoryName);
        return Ok(result);
    }

    // ==========================================
    // 2. LẤY CHI TIẾT 1 BÀI VIẾT BẰNG SLUG
    // URL: GET /api/article/khuyen-mai-mua-he
    // ==========================================
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArticleBySlug(string slug)
    {
        // Đây chính là đoạn code an toàn và chuẩn xác do bạn viết!
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
    // URL: POST /api/article
    // ==========================================
    [HttpPost]
    [Authorize] // YÊU CẦU PHẢI CÓ TOKEN ĐĂNG NHẬP (Vì Service cần ID từ JWT)
    public async Task<IActionResult> Create([FromForm] ArticleRequestDto request)
    {
        // [FromForm] cực kỳ quan trọng vì DTO chứa IFormFile (Ảnh upload)
        try
        {
            var newArticle = await _articleService.CreateArticleAsync(request);
            // Tạo thành công -> Trả về HTTP 201 Created và link bài viết mới
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
    // 4. CẬP NHẬT BÀI VIẾT (Thay đổi nội dung / Xóa ảnh cũ trên Cloud)
    // URL: PUT /api/article/{id}
    // ==========================================
    [HttpPut("{id}")]
    [Authorize] // Yêu cầu đăng nhập
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
    // 5. XÓA BÀI VIẾT (100% SOFT DELETE)
    // URL: DELETE /api/article/{id}
    // ==========================================
    [HttpDelete("{id}")]
    [Authorize] // Yêu cầu đăng nhập
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
}
// Hàm Thêm / Sửa (POST, PUT): Bạn bắt buộc phải dặn người làm Frontend sử dụng FormData (multipart/form-data) để gửi dữ liệu lên nhé. Tuyệt đối không gửi dạng JSON vì JSON không thể đính kèm file ảnh (Thumbnail). Đó là lý do trong C# tôi bắt buộc dùng tag [FromForm].
// Hàm Thêm / Sửa / Xóa: Đã được gắn tag [Authorize]. Frontend khi gọi các API này phải nhớ nhét JWT Token vào Header (Authorization: Bearer <token_cua_ban>) thì hệ thống mới lấy được ID người đăng bài nhé.