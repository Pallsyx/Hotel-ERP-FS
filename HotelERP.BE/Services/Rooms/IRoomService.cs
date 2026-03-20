using HotelERP.BE.Domain.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelERP.BE.Services.Rooms
{
    public interface IRoomService
    {
        // Thuật toán lấy phòng Check-in
        Task<List<Room>> GetAvailableRoomsForCheckInAsync(int roomTypeId);
        
        // Cập nhật trạng thái và bắn SignalR
        Task<bool> UpdateRoomStatusAsync(int roomId, string status, string cleaningStatus);
    }
}