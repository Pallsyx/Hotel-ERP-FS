using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HotelERP.BE.Application.DTOs.Auth;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HotelERP.BE.Application.Services;

public class AuthService : IAuthService
{
    private readonly HotelDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(HotelDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request)
    {
        // 1. Tìm user theo email và đảm bảo User chưa bị xóa mềm (Status = true)
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

        if (user == null)
            throw new Exception("Email hoặc mật khẩu không chính xác.");

        // 2. Kiểm tra mật khẩu bằng BCrypt
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new Exception("Email hoặc mật khẩu không chính xác.");

        // Cập nhật LastLoginAt
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // 3. Tạo JWT & Refresh Token
        return await GenerateTokensAsync(user);
    }
    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        // 1. Kiểm tra Email tồn tại
        var isExist = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (isExist)
            throw new Exception("Email này đã được sử dụng trong hệ thống.");

        // 2. Tự động tìm Role "Customer" (Khách hàng) trong Database
        // Lưu ý: Đổi chữ "Customer" thành tên chính xác trong bảng Roles của bạn (VD: "Guest", "Khách hàng"...)
        var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
        if (customerRole == null)
            throw new Exception("Hệ thống chưa cấu hình quyền Khách hàng mặc định.");

        // 3. Tạo User mới với Role cố định
        var newUser = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            RoleId = customerRole.Id, // Tự động gán cứng ID của quyền Khách hàng
            Status = true, 
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        return true;
    }
    public async Task<UserProfileResponse> GetCurrentUserProfileAsync(int userId)
    {
        // Tìm User theo ID và Join (Include) với bảng Role để lấy tên quyền
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);

        if (user == null)
            throw new Exception("Không tìm thấy thông tin người dùng hoặc tài khoản đã bị khóa.");

        // Map dữ liệu từ Entity sang DTO để giấu đi PasswordHash và các thông tin nhạy cảm
        return new UserProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            AvatarUrl = user.AvatarUrl,
            LoyaltyPoints = user.LoyaltyPoints,
            RoleName = user.Role?.Name // Nếu có Role thì lấy Name, không thì để null
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
            throw new Exception("Access Token không hợp lệ.");

        var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            throw new Exception("Access Token không hợp lệ.");

        // Kiểm tra Refresh Token trong DB
        var storedRefreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.UserId == userId);

        if (storedRefreshToken == null)
            throw new Exception("Refresh Token không tồn tại.");

        if (storedRefreshToken.IsUsed)
            throw new Exception("Refresh Token đã được sử dụng.");

        if (storedRefreshToken.IsRevoked)
            throw new Exception("Refresh Token đã bị thu hồi.");

        if (storedRefreshToken.ExpireAt < DateTime.UtcNow)
            throw new Exception("Refresh Token đã hết hạn. Vui lòng đăng nhập lại.");

        // Đánh dấu Refresh Token cũ là đã sử dụng
        storedRefreshToken.IsUsed = true;
        _context.RefreshTokens.Update(storedRefreshToken);
        await _context.SaveChangesAsync();

        var user = await _context.Users.Include(u => u.Role).FirstAsync(u => u.Id == userId);
        
        // Cấp cặp Token mới
        return await GenerateTokensAsync(user);
    }

    public async Task<string> AdminGenerateResetPasswordLinkAsync(AdminResetPasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.TargetUserId && u.Status == true);
        if (user == null)
            throw new Exception("Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa.");

        // Tạo một JWT Token đặc biệt chỉ dùng để Reset Password (Hết hạn sau 15 phút)
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("Purpose", "ResetPassword") // Đánh dấu token này dùng để reset pass
            }),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var resetToken = tokenHandler.WriteToken(token);

        // Giả lập tạo Link gửi qua Email
        var resetLink = $"https://localhost:7100/reset-password?token={resetToken}";
        return resetLink;
    }

    public async Task<bool> ResetPasswordWithTokenAsync(ChangePasswordWithTokenRequest request)
    {
        var principal = GetPrincipalFromExpiredToken(request.ResetToken, validateLifetime: true);
        if (principal == null)
            throw new Exception("Link đổi mật khẩu không hợp lệ hoặc đã hết hạn.");

        var purpose = principal.Claims.FirstOrDefault(c => c.Type == "Purpose")?.Value;
        if (purpose != "ResetPassword")
            throw new Exception("Token không đúng định dạng đổi mật khẩu.");

        var userId = int.Parse(principal.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Status == true);
        if (user == null)
            throw new Exception("Người dùng không tồn tại.");

        // Hash mật khẩu mới và lưu
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        
        // Thu hồi toàn bộ Refresh Token cũ để ép người dùng phải đăng nhập lại bằng mật khẩu mới
        var activeRefreshTokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId && !rt.IsRevoked).ToListAsync();
        foreach (var rt in activeRefreshTokens)
        {
            rt.IsRevoked = true;
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return true;
    }

    // --- CÁC HÀM PRIVATE HỖ TRỢ ---

    private async Task<TokenResponse> GenerateTokensAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
        var jwtId = Guid.NewGuid().ToString();

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, jwtId)
        };

        // Gắn Role vào Claims
        if (user.Role != null)
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role.Name));
        }

        var accessTokenExp = int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "15");
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(accessTokenExp),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
        };

        var accessToken = tokenHandler.CreateToken(tokenDescriptor);
        
        // Tạo Refresh Token
        var refreshToken = GenerateSecureRandomString();
        var refreshTokenExpDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            JwtId = jwtId,
            IsUsed = false,
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow,
            ExpireAt = DateTime.UtcNow.AddDays(refreshTokenExpDays)
        };

        await _context.RefreshTokens.AddAsync(newRefreshToken);
        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            AccessToken = tokenHandler.WriteToken(accessToken),
            RefreshToken = refreshToken,
            ExpiryDate = tokenDescriptor.Expires.Value
        };
    }

    private string GenerateSecureRandomString()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token, bool validateLifetime = false)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = _configuration["JwtSettings:Audience"],
            ValidateIssuer = true,
            ValidIssuer = _configuration["JwtSettings:Issuer"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!)),
            ValidateLifetime = validateLifetime // False khi check Refresh Token, True khi check Reset Password Token
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token format");
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }
}