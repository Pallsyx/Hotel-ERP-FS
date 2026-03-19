// Application/Services/RoomService.cs
using Microsoft.EntityFrameworkCore;
using HotelERP.Application.Interfaces;
using HotelERP.Application.DTOs.Room;
using HotelERP.Infrastructure.Persistence;
using HotelERP.Domain.Entities;

namespace HotelERP.Application.Services;

public class RoomService(HotelDbContext context) : IRoomService
{
    public async Task<IEnumerable<RoomResponseDto>> GetRoomsAsync(RoomFilterRequest filter)
    {
        var query = context.Rooms.AsQueryable(); // Đã tự động lọc DeletedAt == null

        if (!string.IsNullOrEmpty(filter.Status))
            query = query.Where(r => r.Status == filter.Status);
            
        if (!string.IsNullOrEmpty(filter.CleaningStatus))
            query = query.Where(r => r.CleaningStatus == filter.CleaningStatus);

        if (filter.RoomTypeId.HasValue)
            query = query.Where(r => r.RoomTypeId == filter.RoomTypeId.Value);

        return await query.Select(r => new RoomResponseDto(
            r.Id, r.RoomNumber, r.Status, r.CleaningStatus, "Loại phòng Mock" // Thực tế cần Join hoặc Include với bảng RoomTypes
        )).ToListAsync();
    }

    public async Task<RoomDetailResponseDto?> GetRoomByIdAsync(int roomId)
    {
        var room = await context.Rooms.FindAsync(roomId);
        if (room == null) return null;

        return new RoomDetailResponseDto(room.Id, room.RoomNumber, room.Status, room.CleaningStatus, room.RoomTypeId, "Loại phòng Mock", 500000);
    }

    public async Task<int> CreateRoomAsync(CreateRoomRequest request)
    {
        var room = new Room
        {
            RoomNumber = request.RoomNumber,
            RoomTypeId = request.RoomTypeId,
            Status = request.Status.ToUpper(),
            CleaningStatus = request.CleaningStatus.ToUpper()
        };

        context.Rooms.Add(room);
        await context.SaveChangesAsync();
        return room.Id;
    }

    public async Task<bool> UpdateRoomAsync(int roomId, UpdateRoomRequest request)
    {
        var room = await context.Rooms.FindAsync(roomId);
        if (room == null) return false;

        room.RoomNumber = request.RoomNumber;
        room.RoomTypeId = request.RoomTypeId;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoomAsync(int roomId)
    {
        var room = await context.Rooms.FindAsync(roomId);
        if (room == null) return false;

        room.DeletedAt = DateTime.UtcNow; // XÓA MỀM
        room.Status = "OUT_OF_ORDER";
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateCleaningStatusAsync(int roomId, UpdateCleaningStatusRequest request)
    {
        var room = await context.Rooms.FindAsync(roomId);
        if (room == null) return false;

        room.CleaningStatus = request.NewCleaningStatus.ToUpper();
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request)
    {
        var room = await context.Rooms.FindAsync(roomId);
        if (room == null) return false;

        room.Status = request.NewStatus.ToUpper();
        // Có thể lưu MaintenanceReason vào bảng Audit_Logs hoặc 1 bảng phụ
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReportDamageAsync(int userId, ReportDamageRequest request)
    {
        var damage = new LossAndDamage
        {
            RoomId = request.RoomId,
            BookingId = request.BookingId,
            ReportedByUserId = userId,
            ItemName = request.ItemName,
            Description = request.Description,
            Cost = request.Cost,
            ReportedAt = DateTime.UtcNow
        };

        context.LossAndDamages.Add(damage);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<DamageReportResponseDto>> GetRoomDamagesAsync(int roomId)
    {
        return await context.LossAndDamages
            .Where(d => d.RoomId == roomId)
            .Select(d => new DamageReportResponseDto(
                d.Id, d.ItemName, d.Description, d.Cost, d.ReportedAt, "Tên Nhân Viên Mock" // Thực tế Join với Users
            )).ToListAsync();
    }
}