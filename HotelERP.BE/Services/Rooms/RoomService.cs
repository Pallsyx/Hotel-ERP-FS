using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace HotelERP.BE.Services.Rooms
{
    public class RoomService : IRoomService
    {
        private readonly HotelDbContext _context;
        private readonly IHubContext<RoomHub> _hubContext;

        public RoomService(HotelDbContext context, IHubContext<RoomHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext; // Tiêm SignalR vào đây để bắn data
        }

        public async Task<List<Room>> GetAvailableRoomsForCheckInAsync(int roomTypeId)
        {
            // LOGIC LỌC BẮT BUỘC: Trạng thái phải là Available VÀ dọn dẹp phải là Clean
            return await _context.Rooms
                .Where(r => r.RoomTypeId == roomTypeId 
                         && r.Status == "Available" 
                         && r.CleaningStatus == "Clean")
                .ToListAsync();
        }

        public async Task<bool> UpdateRoomStatusAsync(int roomId, string status, string cleaningStatus)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null) return false;

            room.Status = status;
            room.CleaningStatus = cleaningStatus;
            room.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // QUAN TRỌNG: Bắn tín hiệu SignalR cho tất cả Lễ Tân biết phòng này vừa đổi trạng thái
            await _hubContext.Clients.All.SendAsync("ReceiveRoomStatusUpdate", roomId, status, cleaningStatus);

            return true;
        }
    }
}