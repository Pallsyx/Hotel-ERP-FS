using HotelERP.BE.Application.DTOs.OrderService;

namespace HotelERP.BE.Application.Interfaces;

public interface IOrderServiceManagementService
{
    /// <summary>
    /// Lấy toàn bộ dịch vụ đang ACTIVE, nhóm theo danh mục.
    /// </summary>
    Task<List<ServiceCategoryDto>> GetAllServicesByCategoryAsync();

    /// <summary>
    /// Lấy danh sách đơn dịch vụ theo BookingDetailId.
    /// </summary>
    Task<List<OrderServiceDto>> GetOrdersByBookingDetailAsync(int bookingDetailId);

    /// <summary>
    /// Tạo đơn dịch vụ mới.
    /// - Nếu BookingDetailId != null: gắn vào phòng khách đang ở.
    /// - Nếu BookingDetailId == null: đơn độc lập cho khách vãng lai (POS).
    /// </summary>
    Task<(bool Success, string Message, OrderServiceDto? Order)> CreateOrderAsync(CreateOrderServiceRequest request);
}
