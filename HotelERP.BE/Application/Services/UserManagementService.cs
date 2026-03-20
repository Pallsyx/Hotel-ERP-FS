using HotelERP.BE.Application.DTOs.UserManagement;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Application.Services;

public class UserManagementService : IUserManagementService
{
    private readonly HotelDbContext _context;

    public UserManagementService(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserListItemResponse>> GetAllUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserListItemResponse {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                RoleName = u.Role != null ? u.Role.Name : "N/A",
                Status = u.Status,
                CreatedAt = u.CreatedAt
            }).ToListAsync();
    }

    public async Task<bool> CreateUserAsync(AdminCreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new Exception("Email đã tồn tại.");

        var user = new User {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            Phone = request.Phone,
            Status = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Thay vì xóa cứng, ta dùng xóa mềm bằng cách đổi Status
        user.Status = false; 
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ChangeUserRoleAsync(int id, int newRoleId)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.RoleId = newRoleId;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateUserAsync(int id, AdminUpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.Status = request.Status;
        
        return await _context.SaveChangesAsync() > 0;
    }
}