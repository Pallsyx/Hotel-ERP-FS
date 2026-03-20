using HotelERP.BE.Application.DTOs.BookingEngine;

namespace HotelERP.BE.Application.Interfaces;

public interface IBookingEngineService
{
    Task<int> CreateMultiRoomBookingAsync(int userId, MultiRoomBookingRequest request);

    Task<bool> AdminForceCancelBookingAsync(int bookingId);

    Task<IEnumerable<object>> GetAssignableRoomsAsync(int roomTypeId);
}