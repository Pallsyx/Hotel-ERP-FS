namespace HotelERP.BE.Application.DTOs.UserManagement;

public class AdminUpdateUserRequest
{
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    
    // Admin có quyền bật/khóa tài khoản nhân viên
    public bool Status { get; set; }
}