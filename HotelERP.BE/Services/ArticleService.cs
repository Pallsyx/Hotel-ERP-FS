using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.DTOs;
using HotelERP.BE.Utils;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Http; // Đã thêm thư viện xử lý File

namespace HotelERP.BE.Services;

public class ArticleService
{
    private readonly HotelDbContext _context;
    private readonly ICloudinaryService _cloudinary;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ArticleService(HotelDbContext context, ICloudinaryService cloudinary, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _cloudinary = cloudinary;
        _httpContextAccessor = httpContextAccessor;
    }

    // ==========================================
    // CREATE API (TẠO BÀI VIẾT)
    // ==========================================
    public async Task<Article> CreateArticleAsync(ArticleRequestDto request)
    {
        // 1. Lấy AuthorId từ JWT Token
        var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString))
            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng.");
        
        int authorId = int.Parse(userIdString);

        // 2. Logic Auto-Slug và kiểm tra trùng lặp trong DB
        string baseSlug = SlugHelper.GenerateSlug(request.Title);
        string finalSlug = baseSlug;
        int counter = 1;

        // IgnoreQueryFilters để check trùng với cả bài viết INACTIVE
        while (await _context.Articles.IgnoreQueryFilters().AnyAsync(a => a.Slug == finalSlug))
        {
            finalSlug = $"{baseSlug}-{counter}";
            counter++;
        }

        // 3. Upload ảnh lên Cloudinary
        string? thumbnailUrl = null;
        string? thumbnailPublicId = null;

        if (request.Thumbnail != null)
        {
            var uploadResult = await _cloudinary.UploadImageAsync(request.Thumbnail, "articles");
            thumbnailUrl = uploadResult.Url;
            thumbnailPublicId = uploadResult.PublicId;
        }
        
        int? resolvedCategoryId = null;
        if (!string.IsNullOrWhiteSpace(request.CategoryName))
        {
            var category = await _context.ArticleCategories
                .FirstOrDefaultAsync(c => c.Name == request.CategoryName);
                
            if (category == null)
                throw new Exception($"Không tìm thấy danh mục nào có tên là '{request.CategoryName}' trong hệ thống.");
                
            resolvedCategoryId = category.Id;
        }
        
        // 4. Tạo entity và lưu DB
        var newArticle = new Article
        {
            Title = request.Title,
            Slug = finalSlug,
            Content = request.Content,
            Summary = request.Summary,
            CategoryId = resolvedCategoryId,
            AuthorId = authorId,
            ThumbnailUrl = thumbnailUrl,
            ThumbnailPublicId = thumbnailPublicId,
            Status = "ACTIVE",
            PublishedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Articles.Add(newArticle);
        await _context.SaveChangesAsync();

        return newArticle;
    }

    // ==========================================
    // UPDATE API (CẬP NHẬT BÀI VIẾT)
    // ==========================================
    public async Task<Article> UpdateArticleAsync(int id, ArticleRequestDto request)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) throw new Exception("Không tìm thấy bài viết");

        article.Title = request.Title;
        article.Content = request.Content;
        article.Summary = request.Summary;
        article.UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.CategoryName))
        {
            var category = await _context.ArticleCategories
                .FirstOrDefaultAsync(c => c.Name == request.CategoryName);
                
            if (category == null)
                throw new Exception($"Không tìm thấy danh mục nào có tên là '{request.CategoryName}'.");
                
            article.CategoryId = category.Id;
        }
        
        if (request.Thumbnail != null)
        {
            // Xóa ảnh cũ trên Cloudinary
            if (!string.IsNullOrEmpty(article.ThumbnailPublicId))
            {
                await _cloudinary.DeleteImageAsync(article.ThumbnailPublicId);
            }

            // Upload ảnh mới
            var uploadResult = await _cloudinary.UploadImageAsync(request.Thumbnail, "articles");
            article.ThumbnailUrl = uploadResult.Url;
            article.ThumbnailPublicId = uploadResult.PublicId;
        }

        _context.Articles.Update(article);
        await _context.SaveChangesAsync();
        return article;
    }

    // ==========================================
    // DELETE API (100% SOFT DELETE)
    // ==========================================
    public async Task DeleteArticleAsync(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) throw new Exception("Không tìm thấy bài viết");

        // KHÔNG DÙNG Remove()
        article.Status = "INACTIVE";
        article.UpdatedAt = DateTime.UtcNow;

        _context.Articles.Update(article);
        await _context.SaveChangesAsync();
    }

   // ==========================================
    // API TÌM KIẾM BÀI VIẾT (TÌM THEO TÊN CHUYÊN MỤC)
    // ==========================================
    public async Task<List<ArticleResponseDto>> SearchArticlesAsync(string? keyword, string? categoryName)
    {
        var query = _context.Articles
            .Include(a => a.Category) 
            .AsQueryable();

        // Lọc theo từ khóa (Tìm trong Tiêu đề hoặc Tóm tắt)
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(a => a.Title.Contains(keyword) || (a.Summary != null && a.Summary.Contains(keyword)));
        }

        // TÌM THEO TÊN CHUYÊN MỤC (Thay vì ID)
        if (!string.IsNullOrWhiteSpace(categoryName)) 
        {
            query = query.Where(a => a.Category != null && a.Category.Name == categoryName);
        }

        var articles = await query
            .OrderByDescending(a => a.PublishedAt)
            .Select(a => new ArticleResponseDto
            {
                Id = a.Id,
                Title = a.Title,
                Slug = a.Slug,
                Summary = a.Summary,
                ThumbnailUrl = a.ThumbnailUrl,
                PublishedAt = a.PublishedAt,
                CategoryName = a.Category != null ? a.Category.Name : null
            })
            .ToListAsync();

        return articles;
    }

    // ==========================================
    // UPLOAD THUMBNAIL ĐỘC LẬP (HÀM MỚI THÊM)
    // ==========================================
    public async Task<string> UploadThumbnailAsync(int id, IFormFile file)
    {
        // 1. Tìm bài viết trong DB
        var article = await _context.Articles.FindAsync(id);
        if (article == null)
        {
            throw new Exception("Không tìm thấy bài viết với ID này.");
        }

        // 2. Gọi dịch vụ Cloudinary để upload ảnh
        var uploadResult = await _cloudinary.UploadImageAsync(file, "articles"); 

        if (uploadResult == null)
        {
            throw new Exception("Upload ảnh thất bại.");
        }

        // Xóa ảnh cũ trên Cloud nếu có để đỡ tốn dung lượng
        if (!string.IsNullOrEmpty(article.ThumbnailPublicId))
        {
            await _cloudinary.DeleteImageAsync(article.ThumbnailPublicId);
        }

        // 3. Cập nhật đường dẫn ảnh mới vào bài viết
        article.ThumbnailUrl = uploadResult.Url;
        article.ThumbnailPublicId = uploadResult.PublicId;
        article.UpdatedAt = DateTime.UtcNow;

        // 4. Lưu xuống DB
        _context.Articles.Update(article);
        await _context.SaveChangesAsync();

        return article.ThumbnailUrl;
    }
}