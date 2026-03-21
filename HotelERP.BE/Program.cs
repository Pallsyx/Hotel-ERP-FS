using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HotelERP.BE.API.Filters;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.Services;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Services;
using HotelERP.BE.Utils;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Cấu hình Controllers và xử lý lỗi vòng lặp JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// 3. Đăng ký các Services (DI)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<LoyaltyService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();

// 4. Cấu hình JWT Authentication
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
builder.Services.AddAuthorization();

// 5. Cấu hình Swagger (Tích hợp ổ khóa nhập Token JWT)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<AuditReasonHeaderFilter>(); // Thêm header "X-Audit-Reason" vào Swagger
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

// ==========================================
// THIẾT LẬP MIDDLEWARE PIPELINE
// ==========================================

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel ERP Backend API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection(); // Bắt buộc HTTPS
app.UseAuthentication();   // Xác thực phải đi trước Ủy quyền
app.UseAuthorization();
app.MapControllers();      // Gọi Controller

// ==========================================
// CÁC API HẠ TẦNG (Tự động ẩn khỏi Swagger)
// ==========================================

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "HotelERP.BE",
    environment = app.Environment.EnvironmentName,
    utcTime = DateTime.UtcNow
})).ExcludeFromDescription();

app.MapGet("/health/db", async () =>
{
    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var cmd = new SqlCommand("SELECT DB_NAME() AS DbName, @@SERVERNAME AS ServerName", connection);
        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();

        var dbName = reader.IsDBNull(0) ? null : reader.GetString(0);
        var serverName = reader.IsDBNull(1) ? null : reader.GetString(1);

        return Results.Ok(new
        {
            status = "ok",
            database = dbName,
            server = serverName,
            utcTime = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Database connection failed",
            detail: ex.Message,
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}).ExcludeFromDescription();

app.MapGet("/api/system/seed-summary", async () =>
{
    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
SELECT 
    (SELECT COUNT(*) FROM Roles) AS roles_count,
    (SELECT COUNT(*) FROM Users) AS users_count,
    (SELECT COUNT(*) FROM Memberships) AS memberships_count,
    (SELECT COUNT(*) FROM Room_Types) AS room_types_count,
    (SELECT COUNT(*) FROM Rooms) AS rooms_count,
    (SELECT COUNT(*) FROM Vouchers) AS vouchers_count,
    (SELECT COUNT(*) FROM Bookings) AS bookings_count,
    (SELECT COUNT(*) FROM Booking_Details) AS booking_details_count,
    (SELECT COUNT(*) FROM Invoices) AS invoices_count,
    (SELECT COUNT(*) FROM Payments) AS payments_count,
    (SELECT COUNT(*) FROM Articles) AS articles_count,
    (SELECT COUNT(*) FROM Attractions) AS attractions_count,
    (SELECT COUNT(*) FROM Reviews) AS reviews_count,
    (SELECT COUNT(*) FROM Audit_Logs) AS audit_logs_count;";

        await using var cmd = new SqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();

        return Results.Ok(new
        {
            message = "Seed data summary",
            roles = reader.GetInt32(0),
            users = reader.GetInt32(1),
            memberships = reader.GetInt32(2),
            roomTypes = reader.GetInt32(3),
            rooms = reader.GetInt32(4),
            vouchers = reader.GetInt32(5),
            bookings = reader.GetInt32(6),
            bookingDetails = reader.GetInt32(7),
            invoices = reader.GetInt32(8),
            payments = reader.GetInt32(9),
            articles = reader.GetInt32(10),
            attractions = reader.GetInt32(11),
            reviews = reader.GetInt32(12),
            auditLogs = reader.GetInt32(13)
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Failed to read seed summary",
            detail: ex.Message,
            statusCode: StatusCodes.Status500InternalServerError);
    }
});

app.Run();