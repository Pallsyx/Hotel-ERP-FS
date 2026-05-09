using HotelERP.BE.Application.DTOs.BookingEngine;
using HotelERP.BE.Application.Interfaces;
using System.Security.Claims;
using HotelERP.BE.API.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Constants; 
using HotelERP.BE.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingEngineController : ControllerBase
{
    private readonly IBookingEngineService _bookingService;
    private readonly HotelDbContext _context;

    // Dùng chung 1 Constructor
    public BookingEngineController(IBookingEngineService bookingService, HotelDbContext context)
    {
        _bookingService = bookingService;
        _context = context;
    }

    // ==========================================
    //  SEARCH & HOLD
    // ==========================================
    
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchRoomRequest request)
    {
        // 1. Validation cơ bản
        if (request.CheckInDate.Date >= request.CheckOutDate.Date)
            return BadRequest(new { success = false, message = "Ngày trả phòng phải sau ngày nhận phòng." });
        if (request.CheckInDate.Date < DateTime.Today)
            return BadRequest(new { success = false, message = "Ngày nhận phòng không được ở trong quá khứ." });

        // 2. Lấy room_id đã bị đặt (overlap) để chặn lại
        var bookedRoomIds = await _context.BookingDetails
            .Where(bd =>
                bd.RoomId.HasValue &&
                (bd.Status == BookingStatus.Confirmed || 
                 bd.Status == BookingStatus.CheckedIn || 
                 bd.Status == BookingStatus.Holding ||
                 bd.Status == BookingStatus.Pending) &&
                bd.CheckInDate.Date < request.CheckOutDate.Date &&
                bd.CheckOutDate.Date > request.CheckInDate.Date)
            .Select(bd => bd.RoomId!.Value)
            .Distinct()
            .ToListAsync();

        // 3. Lấy RoomTypes + Rooms
        var roomTypes = await _context.RoomTypes
            .Include(rt => rt.Rooms)
            .Where(rt => rt.DeletedAt == null && rt.CapacityAdults >= request.AdultsCount)
            .ToListAsync();

        // 4. Map dữ liệu trả về cho Frontend
        var result = roomTypes.Select(rt =>
        {
            var allRooms = rt.Rooms.Where(r => r.DeletedAt == null).ToList();
            var roomDetails = allRooms.Select(r => new {
                id = r.Id,
                roomNumber = r.RoomNumber,
                floor = r.Floor,
                status = bookedRoomIds.Contains(r.Id) ? "Occupied" : (r.Status ?? "Available")
            }).ToList();

            return new {
                id = rt.Id,
                name = rt.Name,
                description = rt.Description,
                basePrice = rt.BasePrice,
                capacityAdults = rt.CapacityAdults,
                capacityChildren = rt.CapacityChildren,
                sizeSqm = rt.SizeSqm,
                bedType = rt.BedType,
                imageUrl = rt.ImageUrl,
                // Số phòng trống = phòng không nằm trong bookedRoomIds và status không phải Maintenance/Occupied
                availableCount = roomDetails.Count(r => r.status == "Available"),
                rooms = roomDetails
            };
        }).Where(rt => rt.availableCount > 0).ToList(); // Chỉ hiện hạng phòng còn phòng trống

        return Ok(result);
    }


    [HttpPost("hold")]
    [Authorize] // Phải đăng nhập mới được giữ phòng
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> HoldRoom([FromBody] HoldRoomRequest request) 
    {
        try 
        {
            // Lấy UserId từ Token đang đăng nhập
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            
            int userId = int.Parse(userIdClaim);

            var result = await _bookingService.HoldRoomAsync(request.RoomTypeId, userId, request.CheckInDate, request.CheckOutDate);
            return Ok(new { success = true, message = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // ==========================================
    //  MULTI-ROOM, CANCEL, CHECK-IN
    // ==========================================
    
    [Authorize]  // Chỉ cần đăng nhập — Cả khách hàng thường lẫn nhân viên đều đặt được
    [HttpPost("multi-booking")]
    public async Task<IActionResult> CreateMultiBooking([FromBody] MultiRoomBookingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        
        try 
        {
            var bookingId = await _bookingService.CreateMultiRoomBookingAsync(userId, request);
            var booking = await _context.Bookings.FindAsync(bookingId);
            return Ok(new { success = true, message = "Đặt phòng thành công (Holding)", bookingId, bookingCode = booking?.BookingCode });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("force-cancel/{id}")]
    [Authorize(Policy = PermissionKeys.ForceCancelBookings)] 
    [AuditLogInterceptor("Admin/Manager can thiệp hủy giữ phòng", "Bookings")] 
    [HttpPut("force-cancel/{bookingId}")] 
// ...PHẢI KHỚP với chữ bookingId ở đây
    public async Task<IActionResult> ForceCancel(int bookingId)
    {
        // Đã đồng bộ sử dụng _bookingService
        var result = await _bookingService.AdminForceCancelBookingAsync(bookingId);
        if (!result) return NotFound(new { message = "Không tìm thấy booking hoặc đã bị hủy trước đó." });

        return Ok(new { success = true, message = "Đã ép hủy và ghi nhận vào Audit Log." });
    }

    // ==========================================
    //  LẤY PHÒNG VẬT LÝ TRỐNG (Cấu trúc B - User tự chọn phòng)
    //  GET api/BookingEngine/available-rooms/{typeId}?checkIn=2025-06-01&checkOut=2025-06-03
    //  Không cần đăng nhập — Guest xem được
    // ==========================================
    [HttpGet("available-rooms/{typeId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailableRooms(int typeId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
    {
        if (checkIn.Date >= checkOut.Date)
            return BadRequest(new { success = false, message = "Ngày không hợp lệ." });

        // Tìm room_id đã bị đặt trùng ngày trong khoảng này
        var bookedRoomIds = await _context.BookingDetails
            .Where(bd =>
                bd.RoomId.HasValue &&
                (bd.Status == BookingStatus.Confirmed || 
                 bd.Status == BookingStatus.CheckedIn || 
                 bd.Status == BookingStatus.Holding ||
                 bd.Status == BookingStatus.Pending) &&
                bd.CheckInDate.Date < checkOut.Date &&
                bd.CheckOutDate.Date > checkIn.Date)
            .Select(bd => bd.RoomId!.Value)
            .Distinct()
            .ToListAsync();

        // Lấy phòng vật lý còn trống của hạng phòng này
        var rooms = await _context.Rooms
            .Where(r =>
                r.RoomTypeId == typeId &&
                r.DeletedAt == null &&
                r.Status == "Available" &&
                !bookedRoomIds.Contains(r.Id))
            .OrderBy(r => r.Floor).ThenBy(r => r.RoomNumber)
            .Select(r => new {
                id         = r.Id,
                roomNumber = r.RoomNumber,
                floor      = r.Floor,
                status     = "Available"
            })
            .ToListAsync();

        return Ok(new { success = true, data = rooms });
    }

    [HttpGet("assignable-rooms/{typeId}")]
    [Authorize(Policy = PermissionKeys.CheckInOut)]
    public async Task<IActionResult> GetRoomsForCheckIn(int typeId)
    {
        // Đã đồng bộ sử dụng _bookingService
        var rooms = await _bookingService.GetAssignableRoomsAsync(typeId);
        return Ok(new { success = true, data = rooms });
    }

    [HttpGet]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> GetAllBookings([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string search = "")
    {
    try 
    {
        // Ở đây bạn cần gọi xuống Service hoặc Repository để lấy dữ liệu thật từ SQL
        // Tạm thời tôi để code trả về danh sách trống để bạn hết lỗi 404 trước
        var result = new {
            data = new List<object>(), // Dữ liệu thật lấy từ DB
            total = 0                  // Tổng số dòng để phân trang
        };
        
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
    }

    [HttpPost("validate-voucher")]
    public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request)
    {
        var (isSuccess, errorCode, voucher) = await _bookingService.ValidateVoucherAsync(request.Code, request.Subtotal);
        if (!isSuccess)
            return BadRequest(new { success = false, message = errorCode });

        return Ok(new { success = true, data = voucher });
    }
}

public class ValidateVoucherRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
}