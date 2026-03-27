using HotelERP.BE.Application.DTOs.Auth;
using HotelERP.BE.Application.DTOs.UserProfile;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Application.Services;

public class UserProfileService : IUserProfileService
{
    private readonly HotelDbContext _context;

    public UserProfileService(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileResponse> GetMyProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);

        if (user == null) throw new Exception("Không tìm thấy thông tin người dùng.");

        return new UserProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            LoyaltyPoints = user.LoyaltyPoints,
            RoleName = user.Role?.Name
        };
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);
        if (user == null) throw new Exception("Không tìm thấy thông tin người dùng.");

        // Chỉ cho phép cập nhật tên và số điện thoại
        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);
        if (user == null) throw new Exception("Không tìm thấy thông tin người dùng.");

        // Kiểm tra mật khẩu cũ xem có đúng không
        bool isOldPasswordValid = BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash);
        if (!isOldPasswordValid)
            throw new Exception("Mật khẩu hiện tại không chính xác.");

        if (request.OldPassword == request.NewPassword)
            throw new Exception("Mật khẩu mới không được trùng với mật khẩu cũ.");

        // Hash mật khẩu mới và lưu lại
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }
    public async Task<bool> UpdateAvatarAsync(int userId, string avatarUrl, string avatarPublicId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);
        if (user == null) throw new Exception("Không tìm thấy người dùng.");

        user.AvatarUrl = avatarUrl;
        user.AvatarPublicId = avatarPublicId;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return true;
    }
}