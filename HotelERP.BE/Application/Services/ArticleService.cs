using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Application.DTOs.Article;
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

        // 2. Lấy Role từ token để check quyền Publish
        var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
        bool isAdmin = roleClaim == "Admin";

        // Logic Auto-Slug và kiểm tra trùng lặp trong DB
        string baseSlug = SlugHelper.GenerateSlug(request.Title);
        string finalSlug = baseSlug;
        int counter = 1;

        // IgnoreQueryFilters để check trùng với cả bài viết INACTIVE
        while (await _context.Articles.IgnoreQueryFilters().AnyAsync(a => a.Slug == finalSlug))
        {
            finalSlug = $"{baseSlug}-{counter}";
            counter++;
        }

        // Auto-Excerpt nếu không nhập Summary
        string? summary = request.Summary;
        if (string.IsNullOrWhiteSpace(summary) && !string.IsNullOrWhiteSpace(request.Content))
        {
            // Loại bỏ HTML tags để làm tóm tắt
            var plainText = System.Text.RegularExpressions.Regex.Replace(request.Content, "<.*?>", String.Empty);
            summary = plainText.Length > 150 ? plainText.Substring(0, 150) + "..." : plainText;
        }

        // Logic Status
        string status = "Draft"; // Mặc định
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (request.Status == "Published")
            {
                // Cho phép bất kỳ ai có quyền tạo bài viết đều có quyền Published
                status = "Published";
            }
            else if (request.Status == "Pending Review" || request.Status == "Draft")
            {
                status = request.Status;
            }
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
            {
                category = new ArticleCategory { 
                    Name = request.CategoryName,
                    Status = "ACTIVE",
                    CreatedAt = DateTime.UtcNow
                };
                _context.ArticleCategories.Add(category);
                await _context.SaveChangesAsync();
            }
                
            resolvedCategoryId = category.Id;
        }
        
        // 4. Tạo entity và lưu DB
        var newArticle = new Article
        {
            Title = request.Title,
            Slug = finalSlug,
            Content = request.Content,
            Summary = summary,
            CategoryId = resolvedCategoryId,
            AuthorId = authorId,
            ThumbnailUrl = thumbnailUrl,
            ThumbnailPublicId = thumbnailPublicId,
            Tags = request.Tags,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            Status = status,
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

        // Auto-Excerpt
        string? summary = request.Summary;
        if (string.IsNullOrWhiteSpace(summary) && !string.IsNullOrWhiteSpace(request.Content))
        {
            var plainText = System.Text.RegularExpressions.Regex.Replace(request.Content, "<.*?>", String.Empty);
            summary = plainText.Length > 150 ? plainText.Substring(0, 150) + "..." : plainText;
        }

        // Check Role
        var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
        bool isAdmin = roleClaim == "Admin";
        
        string status = article.Status;
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (request.Status == "Published" || request.Status == "Pending Review" || request.Status == "Draft")
                status = request.Status;
        }

        article.Title = request.Title;
        article.Content = request.Content;
        article.Summary = summary;
        article.Tags = request.Tags;
        article.MetaTitle = request.MetaTitle;
        article.MetaDescription = request.MetaDescription;
        article.Status = status;
        article.UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.CategoryName))
        {
            var category = await _context.ArticleCategories
                .FirstOrDefaultAsync(c => c.Name == request.CategoryName);
                
            if (category == null)
            {
                category = new ArticleCategory { 
                    Name = request.CategoryName,
                    Status = "ACTIVE",
                    CreatedAt = DateTime.UtcNow
                };
                _context.ArticleCategories.Add(category);
                await _context.SaveChangesAsync();
            }
                
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
    // API TÌM KIẾM BÀI VIẾT
    // ==========================================
    public async Task<List<ArticleResponseDto>> SearchArticlesAsync(string? keyword, string? categoryName, string? status = "Published")
    {
        var query = _context.Articles
            .Include(a => a.Category) 
            .AsQueryable();

        // Lọc theo tên chuyên mục (DB level - không cần normalize)
        if (!string.IsNullOrWhiteSpace(categoryName)) 
        {
            query = query.Where(a => a.Category != null && a.Category.Name == categoryName);
        }
        
        // Filter by Status ("ALL" to ignore filter)
        if (status != "ALL" && !string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(a => a.Status == status);
        }

        // Load kết quả sau khi lọc category/status
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
                CategoryName = a.Category != null ? a.Category.Name : null,
                Tags = a.Tags,
                MetaTitle = a.MetaTitle,
                MetaDescription = a.MetaDescription,
                Status = a.Status
            })
            .ToListAsync();

        // ✅ FIX BUG-06: Filter keyword in-memory sau khi load, dùng RemoveDiacritics
        // Lý do: EF Core translate .Contains() thành SQL LIKE '%keyword%' (case-sensitive với dấu),
        // nên 'lang chai' sẽ không match 'Làng Chài' trong DB.
        // Giải pháp: normalize cả keyword lẫn title/summary về không dấu trước khi so sánh.
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = RemoveDiacritics(keyword.ToLower().Trim());
            articles = articles.Where(a =>
                RemoveDiacritics(a.Title?.ToLower() ?? "").Contains(normalizedKeyword) ||
                RemoveDiacritics(a.Summary?.ToLower() ?? "").Contains(normalizedKeyword)
            ).ToList();
        }

        return articles;
    }

    /// <summary>
    /// Chuyển chuỗi tiếng Việt có dấu về không dấu để tìm kiếm accent-insensitive.
    /// Ví dụ: "Làng Chài Cổ" → "lang chai co"
    /// </summary>
    private static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var c in normalized)
        {
            var cat = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (cat != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
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

        if (string.IsNullOrEmpty(uploadResult.Url))
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