using System;

namespace HotelERP.BE.Application.DTOs.Article;

public class ArticleResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Slug { get; set; }
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
    
    public string? CategoryName { get; set; } 
    public string? CategorySlug { get; set; }

    public string? Tags { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Status { get; set; }
    public string? Content { get; set; }
}