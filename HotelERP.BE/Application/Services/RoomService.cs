using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.DTOs;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Utils;
using Microsoft.AspNetCore.SignalR;
using HotelERP.BE.DTOs.Hubs;

namespace HotelERP.BE.Application.Services;

public class RoomService : IRoomService
{
    private readonly HotelDbContext? _context;
    private readonly IHubContext<RoomHub>? _hubContext;
    private readonly ICloudinaryService _cloudinary;
    public RoomService(HotelDbContext context, ICloudinaryService cloudinary, IHubContext<RoomHub> hubContext)
    {
            _context = context;
            _hubContext = hubContext; // Tiêm SignalR vào đây để bắn data
            _cloudinary = cloudinary;
    }
    public async Task<IEnumerable<RoomResponseDto>> GetRoomsAsync(RoomFilterRequest filter)
    {
        var query = _context!.Rooms.Include(r => r.RoomType).Where(r => r.DeletedAt == null).AsQueryable();

        if (!string.IsNullOrEmpty(filter.Status)) query = query.Where(r => r.Status == filter.Status);
        if (!string.IsNullOrEmpty(filter.CleaningStatus)) query = query.Where(r => r.CleaningStatus == filter.CleaningStatus);
        if (filter.RoomTypeId.HasValue) query = query.Where(r => r.RoomTypeId == filter.RoomTypeId.Value);

        return await query.Select(r => new RoomResponseDto(
            r.Id, r.RoomNumber, r.Status, r.CleaningStatus, r.RoomType != null ? r.RoomType.Name : "N/A"
        )).ToListAsync();
    }

    public async Task<RoomDetailResponseDto?> GetRoomByIdAsync(int roomId)
    {
        var room = await _context!.Rooms.Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == roomId && r.DeletedAt == null);
        if (room == null) return null;
        
        return new RoomDetailResponseDto(
            room.Id, room.RoomNumber, room.Status, room.CleaningStatus, 
            room.RoomTypeId, room.RoomType?.Name ?? "N/A", room.RoomType?.BasePrice ?? 0
        );
    }

    public async Task<int> CreateRoomAsync(CreateRoomRequest request)
    {
        var room = new Room { 
            RoomNumber = request.RoomNumber, 
            RoomTypeId = request.RoomTypeId, 
            Status = request.Status.ToUpper(), 
            CleaningStatus = request.CleaningStatus.ToUpper(),
            CreatedAt = DateTime.UtcNow
        };
        _context!.Rooms.Add(room);
        await _context!.SaveChangesAsync();
        return room.Id;
    }

    public async Task<bool> UpdateRoomAsync(int roomId, UpdateRoomRequest request)
    {
        var room = await _context!.Rooms.FindAsync(roomId);
        if (room == null || room.DeletedAt != null) return false;
        room.RoomNumber = request.RoomNumber;
        room.RoomTypeId = request.RoomTypeId;
        room.UpdatedAt = DateTime.UtcNow;
        await _context!.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteRoomAsync(int roomId)
    {
        var room = await _context!.Rooms.FindAsync(roomId);
        if (room == null) return false;
        room.DeletedAt = DateTime.UtcNow;
        room.Status = "OUT_OF_ORDER";
        await _context!.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateCleaningStatusAsync(int roomId, UpdateCleaningStatusRequest request)
    {
        var room = await _context!.Rooms.FindAsync(roomId);
        if (room == null) return false;
        room.CleaningStatus = request.NewCleaningStatus.ToUpper();
        await _context!.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request)
    {
        var room = await _context!.Rooms.FindAsync(roomId);
        if (room == null) return false;
        room.Status = request.NewStatus.ToUpper();
        await _context!.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReportDamageAsync(int userId, ReportDamageRequest request)
{
    var damage = new LossAndDamage
    {
        RoomId = request.RoomId,
        BookingDetailId = request.BookingDetailId, // Dùng trường SQL gốc
        RoomInventoryId = request.RoomInventoryId, // Dùng trường SQL gốc
        ReportedByUserId = userId,
        Description = request.Description,
        PenaltyAmount = request.PenaltyAmount,     // Dùng trường SQL gốc
        Quantity = request.Quantity,               // Dùng trường SQL gốc
        CreatedAt = DateTime.UtcNow
    };

    if (request.EvidenceImage != null && request.EvidenceImage.Length > 0) {
        var res = await _cloudinary.UploadImageAsync(request.EvidenceImage, "damages");
        damage.EvidenceImageUrl = res.Url;
        damage.EvidencePublicId = res.PublicId; // Khớp với trường DB
    }

    _context!.LossAndDamages.Add(damage);
    await _context!.SaveChangesAsync(); 

    _context!.AuditLogs.Add(new AuditLog {
        UserId = userId,
        Action = "REPORT_DAMAGE",
        TableName = "Loss_And_Damages",
        RecordId = damage.Id,
        Reason = request.Reason,
        CreatedAt = DateTime.UtcNow
    });

    await _context!.SaveChangesAsync();
    return true;
}

public async Task<IEnumerable<DamageReportResponseDto>> GetRoomDamagesAsync(int roomId)
{
    return await _context!.LossAndDamages
        .Where(d => d.RoomId == roomId)
        .Select(d => new DamageReportResponseDto(
            d.Id, d.Description ?? "", d.PenaltyAmount, d.Quantity, d.EvidenceImageUrl, d.CreatedAt))
        .ToListAsync();
}
public async Task<List<Room>> GetAvailableRoomsForCheckInAsync(int roomTypeId)
        {
            // LOGIC LỌC BẮT BUỘC: Trạng thái phải là Available VÀ dọn dẹp phải là Clean
            return await _context!.Rooms
                .Where(r => r.RoomTypeId == roomTypeId 
                         && r.Status == "Available" 
                         && r.CleaningStatus == "Clean")
                .ToListAsync();
        }

        public async Task<bool> UpdateRoomStatusAsync(int roomId, string status, string cleaningStatus)
        {
            var room = await _context!.Rooms.FindAsync(roomId);
            if (room == null) return false;

            room.Status = status;
            room.CleaningStatus = cleaningStatus;
            room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // QUAN TRỌNG: Bắn tín hiệu SignalR cho tất cả Lễ Tân biết phòng này vừa đổi trạng thái
            await _hubContext!.Clients.All.SendAsync("ReceiveRoomStatusUpdate", roomId, status, cleaningStatus);

            return true;
        }
}