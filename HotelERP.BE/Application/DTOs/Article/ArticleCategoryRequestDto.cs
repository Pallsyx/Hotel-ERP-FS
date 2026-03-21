namespace HotelERP.BE.DTOs;

public class ArticleCategoryRequestDto
{
    // Bắt buộc phải nhập tên danh mục (VD: "Tin tức", "Khuyến mãi")
    public string Name { get; set; } = null!; 
    
    // Nếu bạn muốn cho phép Frontend đổi trạng thái (ACTIVE/INACTIVE)
    public string? Status { get; set; } = "ACTIVE"; 
}