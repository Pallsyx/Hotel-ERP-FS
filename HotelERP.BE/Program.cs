using System.Text;
using Hangfire;
using HotelERP.BE.API.Filters;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.Services;
using HotelERP.BE.DTOs.Hubs;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CẤU HÌNH DATABASE ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.MapHub<HotelERP.BE.Hubs.RoomHub>("/roomHub");
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel ERP Backend API v1");
    c.RoutePrefix = "swagger";
});

// Hangfire Job của bạn
using (var scope = app.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
    recurringJobManager.AddOrUpdate("ReleaseExpiredBookings", 
        () => scope.ServiceProvider.GetRequiredService<IBookingEngineService>().ReleaseExpiredBookingsAsync(), 
        Cron.Minutely);
}

app.UseHttpsRedirection(); 
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SignalR Hub của Long
app.MapHub<RoomHub>("/roomHub");

// --- 8. MINIMAL APIS (Health Checks & Summary) ---
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.MapGet("/health", () => Results.Ok(new { status = "ok", utcTime = DateTime.UtcNow })).ExcludeFromDescription();

// Health DB (Bản của Long xịn hơn)
app.MapGet("/health/db", async () =>
{
    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var cmd = new SqlCommand(
            "SELECT DB_NAME() AS DbName, @@SERVERNAME AS ServerName",
            connection);
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