using HotelERP.BE.Application.DTOs;

namespace HotelERP.BE.Application.Interfaces;

public interface IRoomService
{
    Task<IEnumerable<RoomResponseDto>> GetRoomsAsync(RoomFilterRequest filter);
    Task<RoomDetailResponseDto?> GetRoomByIdAsync(int roomId);
    Task<int> CreateRoomAsync(CreateRoomRequest request);
    Task<bool> UpdateRoomAsync(int roomId, UpdateRoomRequest request);
    Task<bool> DeleteRoomAsync(int roomId);
    Task<bool> UpdateCleaningStatusAsync(int roomId, UpdateCleaningStatusRequest request);
    Task<bool> UpdateRoomStatusAsync(int roomId, UpdateRoomStatusRequest request);
    Task<bool> ReportDamageAsync(int userId, ReportDamageRequest request);
    Task<IEnumerable<DamageReportResponseDto>> GetRoomDamagesAsync(int roomId);
}