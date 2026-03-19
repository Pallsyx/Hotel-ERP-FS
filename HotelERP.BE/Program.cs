using System.Text;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKeyString = jwtSettings["Secret"] ?? "HotelERP_Super_Secret_Key_Must_Be_Long_Enough_2026_DotNet10";
var secretKey = Encoding.UTF8.GetBytes(secretKeyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true; // Bắt buộc dùng HTTPS
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "HotelERP.BE",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "HotelERP.Clients",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Đăng ký IAuthService map với AuthService
builder.Services.AddScoped<HotelERP.BE.Application.Interfaces.IAuthService, HotelERP.BE.Application.Services.AuthService>();
// Đăng ký IUserProfileService map với UserProfileService
builder.Services.AddScoped<HotelERP.BE.Application.Interfaces.IUserProfileService, HotelERP.BE.Application.Services.UserProfileService>();
// Đăng ký IPhotoService map với PhotoService
builder.Services.AddScoped<HotelERP.BE.Application.Interfaces.IPhotoService, HotelERP.BE.Application.Services.PhotoService>();
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. Cấu hình Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hotel ERP Backend API v1", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập 'Bearer' [khoảng trắng] và token của bạn vào ô bên dưới.\nVí dụ: 'Bearer eyJhbGci...'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 4. Middleware Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel ERP Backend API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection(); // Bắt buộc HTTPS
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 5. Đánh dấu ExcludeFromDescription để tránh lỗi 500 Swagger
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "HotelERP.BE",
    environment = app.Environment.EnvironmentName,
    utcTime = DateTime.UtcNow
})).ExcludeFromDescription();

app.Run();