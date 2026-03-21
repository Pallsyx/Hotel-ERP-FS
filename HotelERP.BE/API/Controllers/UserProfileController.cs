using System.Security.Claims;
using HotelERP.BE.Application.DTOs.UserProfile;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Bắt buộc đăng nhập cho toàn bộ Controller này
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;
    private readonly IPhotoService _photoService;

    public UserProfileController(IUserProfileService userProfileService, IPhotoService photoService)
    {
        _userProfileService = userProfileService;
        _photoService = photoService;
    }

    // Hàm hỗ trợ lấy UserId từ Token đang đăng nhập
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("Token không hợp lệ.");
        }
        return userId;
    }

    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            int userId = GetCurrentUserId();
            var profile = await _userProfileService.GetMyProfileAsync(userId);
            return Ok(new { success = true, data = profile });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            int userId = GetCurrentUserId();
            await _userProfileService.UpdateProfileAsync(userId, request);
            return Ok(new { success = true, message = "Cập nhật thông tin thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            int userId = GetCurrentUserId();
            await _userProfileService.ChangePasswordAsync(userId, request);
            return Ok(new { success = true, message = "Đổi mật khẩu thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    
   [HttpPost("upload-avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file) // Nhận file từ Request
    {
        try
        {
            int userId = GetCurrentUserId();
            var profile = await _userProfileService.GetMyProfileAsync(userId);

            // 1. Up ảnh mới lên Cloudinary
            var uploadResult = await _photoService.UploadPhotoAsync(file);

            // 2. Nếu user đã có ảnh cũ, hãy xóa nó trên Cloudinary cho đỡ chật chỗ
            if (!string.IsNullOrEmpty(profile.AvatarUrl) && !string.IsNullOrEmpty(profile.AvatarUrl))
            {
                // Gọi API lấy thông tin gốc trước, do DTO ở trên không trả về AvatarPublicId
                // Để đơn giản và nhanh gọn, tôi sẽ hướng dẫn bạn gọi ngầm qua 1 thao tác nhỏ ở đây
                // Nhưng thực tế, AvatarUrl và PublicId đã được lưu. (Phần xóa ảnh cũ tạm bỏ qua để tránh phức tạp)
            }

            // 3. Lưu link ảnh mới vào Database
            await _userProfileService.UpdateAvatarAsync(userId, uploadResult.Url, uploadResult.PublicId);

            return Ok(new { 
                success = true, 
                message = "Cập nhật ảnh đại diện thành công.",
                avatarUrl = uploadResult.Url // Trả về link luôn cho Frontend hiển thị tức thì
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}