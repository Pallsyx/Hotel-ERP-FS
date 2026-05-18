namespace HotelERP.BE.Application.DTOs.OrderService;

// ===================================================
// REQUEST DTOs
// ===================================================

/// <summary>
/// Một mục dịch vụ trong đơn hàng
/// </summary>
public class OrderServiceItemRequest
{
    public int ServiceId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Notes { get; set; }
}

/// <summary>
/// Body tạo đơn dịch vụ mới.
/// - Khách đang lưu trú: truyền BookingDetailId, bỏ GuestName.
/// - Khách vãng lai (POS): BookingDetailId = null, GuestName tùy chọn.
/// </summary>
public class CreateOrderServiceRequest
{
    /// <summary>ID của BookingDetail nếu là khách đang ở phòng; null nếu khách vãng lai.</summary>
    public int? BookingDetailId { get; set; }

    /// <summary>Tên khách vãng lai (tùy chọn, không bắt buộc với dịch vụ lẻ).</summary>
    public string? GuestName { get; set; }

    /// <summary>Danh sách dịch vụ cần đặt.</summary>
    public List<OrderServiceItemRequest> Items { get; set; } = new();

    /// <summary>Ghi chú đơn hàng.</summary>
    public string? Notes { get; set; }
}

// ===================================================
// RESPONSE DTOs
// ===================================================

/// <summary>
/// Thông tin một dịch vụ
/// </summary>
public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? Unit { get; set; }
    public string? ImageUrl { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

/// <summary>
/// Danh mục dịch vụ kèm danh sách services
/// </summary>
public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public List<ServiceDto> Services { get; set; } = new();
}

/// <summary>
/// Một dòng trong đơn dịch vụ
/// </summary>
public class OrderServiceDetailDto
{
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Thông tin một đơn dịch vụ
/// </summary>
public class OrderServiceDto
{
    public int Id { get; set; }
    public string OrderCode { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = null!;
    public string? Notes { get; set; }
    public int? BookingDetailId { get; set; }
    public string? GuestName { get; set; }
    public List<OrderServiceDetailDto> Items { get; set; } = new();
}
