using HotelERP.BE.Application.DTOs.BookingManagement;

namespace HotelERP.BE.Application.Interfaces;

public interface IBookingManagementService
{
    /// <summary>
    /// API 1: Search + filter bookings có phân trang
    /// </summary>
    Task<PagedResult<BookingListItemDto>> SearchBookingsAsync(BookingSearchRequest request);

    /// <summary>
    /// API 2: Cập nhật trạng thái booking theo quy trình hotel thực tế
    /// </summary>
    Task<(bool Success, string Message)> UpdateBookingStatusAsync(int bookingId, string newStatus);

    /// <summary>
    /// API 3: Lấy danh sách "Khách đến hôm nay" 
    /// (Bookings có BookingDetail.CheckInDate = Today AND Booking.Status = Confirmed)
    /// </summary>
    Task<List<BookingListItemDto>> GetTodayArrivalsAsync();

    /// <summary>
    /// API 4: Lấy danh sách "Khách đang lưu trú" (Booking.Status = Checked_in)
    /// </summary>
    Task<List<BookingListItemDto>> GetInHouseGuestsAsync();
}
