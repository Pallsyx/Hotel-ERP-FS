using HotelERP.BE.Application.DTOs.UserManagement;

namespace HotelERP.BE.Application.Interfaces;

public interface IUserManagementService
{
    Task<IEnumerable<UserListItemResponse>> GetAllUsersAsync();
    Task<bool> CreateUserAsync(AdminCreateUserRequest request);
    Task<bool> UpdateUserAsync(int id, AdminUpdateUserRequest request); // Cần tạo thêm DTO này
    Task<bool> DeleteUserAsync(int id);
    Task<bool> ChangeUserRoleAsync(int id, int newRoleId);
}