using HotelERP.BE.Application.DTOs.UserManagement;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using HotelERP.BE.API.Filters;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] // Chỉ Admin mới được vào khu vực này
public class UserManagementController : ControllerBase
{
    private readonly IUserManagementService _userService;

    public UserManagementController(IUserManagementService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("roles-with-permissions")]
    [Authorize(Roles = "Admin,Manager")] // Cho phép Admin và Manager gọi để xem
    public async Task<IActionResult> GetRolesWithPermissions()
    {
    var roles = await _userService.GetRolesWithPermissionsAsync();
    return Ok(new { success = true, data = roles });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdminCreateUserRequest request)
    {
        try {
            await _userService.CreateUserAsync(request);
            return Ok(new { message = "Tạo người dùng thành công." });
        } catch (Exception ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AdminUpdateUserRequest request)
    {
        var result = await _userService.UpdateUserAsync(id, request);
        return result ? Ok(new { message = "Cập nhật thành công." }) : NotFound();
    }

    [HttpDelete("{id}")]
    [AuditLogInterceptor("Vô hiệu hóa tài khoản", "Users")] // Gắn Attribute để tự động ghi log khi xóa
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        return result ? Ok(new { message = "Đã vô hiệu hóa người dùng." }) : NotFound();
    }

    [HttpPut("{id}/change-role")]
    [AuditLogInterceptor("Thay đổi quyền hạn", "Users")] // Gắn Attribute để tự động ghi log khi thay đổi quyền
    public async Task<IActionResult> ChangeRole(int id, [FromBody] int newRoleId)
    {
        var result = await _userService.ChangeUserRoleAsync(id, newRoleId);
        return result ? Ok(new { message = "Đã thay đổi quyền hạn." }) : NotFound();
    }
    
    [HttpGet("permissions/grouped")]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới được cấu hình RBAC
    public async Task<IActionResult> GetGroupedPermissions()
    {
    var data = await _userService.GetGroupedPermissionsAsync();
    return Ok(new { success = true, data = data });
    }

    [HttpPut("roles/{roleId}/permissions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] RolePermissionsRequest request)
    {   
    try
    {
        await _userService.UpdateRolePermissionsAsync(roleId, request);
        return Ok(new { success = true, message = "Cập nhật phân quyền thành công!" });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = ex.Message });
    }
    }
    [HttpGet("roles")]
    [Authorize(Roles = "Admin,Manager")] // Cho phép Admin và Manager xem danh sách
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
        // Controller chỉ làm nhiệm vụ nhận Request và gọi Service
        var roles = await _userService.GetAllRolesAsync();
        return Ok(new { success = true, data = roles });
        }
        catch (Exception ex)
        {
        return BadRequest(new { success = false, message = ex.Message });
        }
    }
}