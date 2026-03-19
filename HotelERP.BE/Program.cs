using HotelERP.BE.DTOs.Common;
using HotelERP.BE.Helpers.AuditLogs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Services.Vouchers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Configurations;
using HotelERP.BE.Services.Loyalty;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<HotelDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value is not null && x.Value.Errors.Count > 0)
            .Select(x => new
            {
                field = x.Key,
                errors = x.Value!.Errors.Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value." : e.ErrorMessage)
            });

        var response = ApiResult<object>.Fail(
            StatusCodes.Status400BadRequest,
            "VALIDATION_ERROR",
            "Dữ liệu đầu vào không hợp lệ.",
            errors);

        return new BadRequestObjectResult(response);
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<LoyaltyPointsOptions>(
    builder.Configuration.GetSection(LoyaltyPointsOptions.SectionName));

builder.Services.AddScoped<ILoyaltyPointService, LoyaltyPointService>();

builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IVoucherAuditLogHelper, VoucherAuditLogHelper>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel ERP Backend API v1");
    c.RoutePrefix = "swagger";
});

app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "HotelERP.BE",
    environment = app.Environment.EnvironmentName,
    utcTime = DateTime.UtcNow
}));

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
});

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