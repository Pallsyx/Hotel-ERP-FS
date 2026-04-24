namespace HotelERP.BE.Application.DTOs.Article;

public class ArticleRequestDto
{
    public string Title { get; set; } = null!;
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public string? CategoryName { get; set; }
    
    public string? Tags { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Status { get; set; }

    // IFormFile dùng để nhận file ảnh upload từ FE (Form-data)
    public IFormFile? Thumbnail { get; set; }
}