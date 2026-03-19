using System;

namespace HotelERP.BE.DTOs;

public class ArticleResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Slug { get; set; }
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
    
    // Tên và Slug của chuyên mục nối sang để FE hiển thị (Ví dụ: "Khuyến Mãi", "khuyen-mai")
    public string? CategoryName { get; set; } 
    public string? CategorySlug { get; set; }
}