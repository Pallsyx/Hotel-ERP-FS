namespace HotelERP.BE.Application.DTOs.UserManagement;

public class AdminCreateUserRequest
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int RoleId { get; set; }
    public string? Phone { get; set; }
}