using HotelERP.BE.Application.DTOs.OrderService;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Application.Services;

public class OrderServiceManagementService : IOrderServiceManagementService
{
    private readonly HotelDbContext _context;

    public OrderServiceManagementService(HotelDbContext context)
    {
        _context = context;
    }

    // ==============================================================
    // Lấy toàn bộ dịch vụ ACTIVE, nhóm theo danh mục
    // ==============================================================
    public async Task<List<ServiceCategoryDto>> GetAllServicesByCategoryAsync()
    {
        var categories = await _context.ServiceCategories
            .Where(c => c.Status == "ACTIVE")
            .Include(c => c.Services.Where(s => s.Status == "ACTIVE"))
            .OrderBy(c => c.Name)
            .ToListAsync();

        return categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Services = c.Services.Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Price = s.Price,
                Unit = s.Unit,
                ImageUrl = s.ImageUrl,
                CategoryId = s.CategoryId,
                CategoryName = c.Name
            }).OrderBy(s => s.Name).ToList()
        }).ToList();
    }

    // ==============================================================
    // Lấy đơn dịch vụ theo BookingDetailId
    // ==============================================================
    public async Task<List<OrderServiceDto>> GetOrdersByBookingDetailAsync(int bookingDetailId)
    {
        var orders = await _context.OrderServices
            .Include(os => os.OrderServiceDetails)
                .ThenInclude(osd => osd.Service)
            .Include(os => os.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
            .Where(os => os.BookingDetailId == bookingDetailId)
            .OrderByDescending(os => os.OrderDate)
            .ToListAsync();

        return orders.Select(os => MapOrderToDto(os)).ToList();
    }

    // ==============================================================
    // Tạo đơn dịch vụ mới (in-house hoặc POS vãng lai)
    // ==============================================================
    public async Task<(bool Success, string Message, OrderServiceDto? Order)> CreateOrderAsync(CreateOrderServiceRequest request)
    {
        // Kiểm tra phải có ít nhất 1 dịch vụ
        if (request.Items == null || request.Items.Count == 0)
            return (false, "Vui lòng chọn ít nhất một dịch vụ.", null);

        // Nếu gắn với BookingDetail, kiểm tra tồn tại
        if (request.BookingDetailId.HasValue)
        {
            var detailExists = await _context.BookingDetails
                .AnyAsync(bd => bd.Id == request.BookingDetailId.Value);
            if (!detailExists)
                return (false, $"Không tìm thấy phòng/BookingDetail #{request.BookingDetailId}.", null);
        }

        // Lấy thông tin tất cả dịch vụ được yêu cầu
        var serviceIds = request.Items.Select(i => i.ServiceId).Distinct().ToList();
        var services = await _context.Services
            .Where(s => serviceIds.Contains(s.Id) && s.Status == "ACTIVE")
            .ToListAsync();

        if (services.Count != serviceIds.Count)
        {
            var foundIds = services.Select(s => s.Id).ToHashSet();
            var missingIds = serviceIds.Where(id => !foundIds.Contains(id)).ToList();
            return (false, $"Dịch vụ không hợp lệ hoặc không còn hoạt động: ID [{string.Join(", ", missingIds)}].", null);
        }

        // Tạo OrderCode unique
        var orderCode = await GenerateUniqueOrderCodeAsync();

        // Tính tổng tiền và tạo các dòng chi tiết
        var details = new List<OrderServiceDetail>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var service = services.First(s => s.Id == item.ServiceId);
            var qty = Math.Max(item.Quantity, 1);
            var lineTotal = service.Price * qty;
            totalAmount += lineTotal;

            details.Add(new OrderServiceDetail
            {
                ServiceId = service.Id,
                Quantity = qty,
                UnitPrice = service.Price,
                LineTotal = lineTotal,
                Notes = item.Notes
            });
        }

        // Tạo OrderService entity
        var order = new OrderService
        {
            BookingDetailId = request.BookingDetailId,
            OrderCode = orderCode,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            Status = "Pending",
            Notes = string.IsNullOrWhiteSpace(request.GuestName)
                ? request.Notes
                : $"Khách: {request.GuestName?.Trim()}" + (string.IsNullOrWhiteSpace(request.Notes) ? "" : $" | {request.Notes}"),
            CreatedAt = DateTime.UtcNow,
            OrderServiceDetails = details
        };

        _context.OrderServices.Add(order);
        await _context.SaveChangesAsync();

        // Reload để lấy thông tin đầy đủ trả về
        var createdOrder = await _context.OrderServices
            .Include(os => os.OrderServiceDetails)
                .ThenInclude(osd => osd.Service)
            .Include(os => os.BookingDetail)
                .ThenInclude(bd => bd!.Booking)
            .FirstAsync(os => os.Id == order.Id);

        return (true, $"Tạo đơn dịch vụ {orderCode} thành công.", MapOrderToDto(createdOrder, request.GuestName));
    }

    // ==============================================================
    // HELPER: Map entity → DTO
    // ==============================================================
    private static OrderServiceDto MapOrderToDto(OrderService os, string? guestName = null)
    {
        // GuestName: nếu truyền vào thì dùng, không thì lấy từ Notes hoặc từ Booking
        string? resolvedGuestName = guestName;
        if (string.IsNullOrWhiteSpace(resolvedGuestName))
        {
            // Thử lấy từ Booking gắn liền (khách đang ở)
            resolvedGuestName = os.BookingDetail?.Booking?.GuestName;
        }

        return new OrderServiceDto
        {
            Id = os.Id,
            OrderCode = os.OrderCode,
            OrderDate = os.OrderDate,
            TotalAmount = os.TotalAmount,
            Status = os.Status,
            Notes = os.Notes,
            BookingDetailId = os.BookingDetailId,
            GuestName = resolvedGuestName,
            Items = os.OrderServiceDetails.Select(d => new OrderServiceDetailDto
            {
                ServiceId = d.ServiceId ?? 0,
                ServiceName = d.Service?.Name ?? "N/A",
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice,
                LineTotal = d.LineTotal,
                Notes = d.Notes
            }).ToList()
        };
    }

    // ==============================================================
    // HELPER: Tạo mã OrderCode unique dạng SVC-YYYYMMDD-XXXX
    // ==============================================================
    private async Task<string> GenerateUniqueOrderCodeAsync()
    {
        var dateStr = DateTime.UtcNow.ToString("yyyyMMdd");
        string code;
        int attempt = 0;

        do
        {
            var suffix = new Random().Next(1000, 9999).ToString();
            code = $"SVC-{dateStr}-{suffix}";
            attempt++;
            // Phòng trường hợp trùng lặp cực kỳ hiếm
            if (attempt > 20) code = $"SVC-{dateStr}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        }
        while (await _context.OrderServices.AnyAsync(os => os.OrderCode == code) && attempt <= 20);

        return code;
    }
}
