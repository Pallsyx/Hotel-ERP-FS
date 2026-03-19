namespace HotelERP.BE.DTOs;

public class ArticleRequestDto
{
    public string Title { get; set; } = null!;
    public string? Summary { get; set; }
    public string? Content { get; set; }
    public int? CategoryId { get; set; }
    
    // IFormFile dùng để nhận file ảnh upload từ FE (Form-data)
    public IFormFile? Thumbnail { get; set; }
}