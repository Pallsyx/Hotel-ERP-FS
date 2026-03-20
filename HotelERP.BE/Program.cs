using System.Text;
using HotelERP.BE.API.Filters;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.Services;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using RedLockNet;
using RedLockNet.SERedis;
using RedLockNet.SERedis.Configuration;
using Hangfire;
using HotelERP.BE.Utils;
using HotelERP.BE.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CẤU HÌNH DATABASE ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- 2. CẤU HÌNH JSON (Tránh vòng lặp dữ liệu) ---
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// --- 3. CẤU HÌNH JWT AUTHENTICATION ---
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
    options.RequireHttpsMetadata = true;
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

// --- 4. CẤU HÌNH HANGFIRE & REDIS ---
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString)); 

builder.Services.AddHangfireServer(); 

var redisConnection = ConnectionMultiplexer.Connect("localhost:6379");
builder.Services.AddSingleton<IConnectionMultiplexer>(redisConnection);

builder.Services.AddSingleton<IDistributedLockFactory>(provider =>
{
    var multiplexers = new List<RedLockMultiplexer> { new RedLockMultiplexer(redisConnection) };
    return RedLockFactory.Create(multiplexers);
});

// --- 5. ĐĂNG KÝ SERVICES (Gộp đủ 100% của team) ---
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IBookingEngineService, BookingEngineService>();
builder.Services.AddScoped<IRoomInventoryService, RoomInventoryService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<LoyaltyService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();

// --- 6. CẤU HÌNH SWAGGER ---
builder.Services.AddSwaggerGen(c =>
{
    c.OperationFilter<AuditReasonHeaderFilter>(); 
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Hotel ERP Backend API v1", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập 'Bearer' [khoảng trắng] và token của bạn vào ô bên dưới.",
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

// --- 7. MIDDLEWARE PIPELINE ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel ERP Backend API v1");
    c.RoutePrefix = "swagger";
});

// Chạy Background Job quét phòng quá hạn
using (var scope = app.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
    recurringJobManager.AddOrUpdate("ReleaseExpiredBookings", 
        () => scope.ServiceProvider.GetRequiredService<IBookingEngineService>().ReleaseExpiredBookingsAsync(), 
        Cron.Minutely);
}

app.UseHttpsRedirection(); 
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// --- 8. MINIMAL APIS (Health Checks & Summary) ---
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.MapGet("/health", () => Results.Ok(new { status = "ok", utcTime = DateTime.UtcNow })).ExcludeFromDescription();

app.MapGet("/health/db", async () =>
{
    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        return Results.Ok(new { status = "ok", database = connection.Database, utcTime = DateTime.UtcNow });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, statusCode: 503);
    }
}).ExcludeFromDescription();

app.MapGet("/api/system/seed-summary", async () =>
{
    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        var sql = "SELECT (SELECT COUNT(*) FROM Users) AS users, (SELECT COUNT(*) FROM Rooms) AS rooms, (SELECT COUNT(*) FROM Bookings) AS bookings";
        await using var cmd = new SqlCommand(sql, connection);
        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();
        return Results.Ok(new { users = reader[0], rooms = reader[1], bookings = reader[2] });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message);
    }
}).ExcludeFromDescription();

app.Run();