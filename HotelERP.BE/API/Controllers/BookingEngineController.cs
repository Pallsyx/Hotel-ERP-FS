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
    
    // POST api/BookingEngine/search  –– public, khách vãng lai được phép tìm kiếm
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchRoomRequest request)
    {
        // ── Validation ───────────────────────────────────────────────────────────
        if (request.CheckInDate.Date >= request.CheckOutDate.Date)
            return BadRequest(new { success = false, message = "Ngày trả phòng phải sau ngày nhận phòng." });

        if (request.CheckInDate.Date < DateTime.Today)
            return BadRequest(new { success = false, message = "Ngày nhận phòng không được ở trong quá khứ." });

        int nights = (int)(request.CheckOutDate.Date - request.CheckInDate.Date).TotalDays;

        // ── Lấy room_id đã bị đặt (overlap) ─────────────────────────────────────
        var bookedRoomIds = await _context.BookingDetails
            .Where(bd =>
                bd.RoomId.HasValue &&
                (bd.Status == BookingStatus.Confirmed || 
                 bd.Status == BookingStatus.CheckedIn || 
                 bd.Status == BookingStatus.Holding ||
                 bd.Status == BookingStatus.Pending) &&
                bd.CheckInDate.Date  < request.CheckOutDate.Date &&
                bd.CheckOutDate.Date > request.CheckInDate.Date)
            .Select(bd => bd.RoomId!.Value)
            .Distinct()
            .ToListAsync();

        // ── Query room types phù hợp sức chứa ───────────────────────────────────
        var roomTypes = await _context.RoomTypes
            .Include(rt => rt.Rooms)
            .Include(rt => rt.RoomImages)
            .Include(rt => rt.RoomTypeAmenities)
                .ThenInclude(rta => rta.Amenity)
            .Where(rt =>
                rt.DeletedAt == null &&
                (rt.Status == "ACTIVE" || rt.Status == "active" || rt.Status == "Active") &&
                rt.CapacityAdults   >= request.AdultsCount &&
                rt.CapacityChildren >= request.ChildrenCount)
            .OrderBy(rt => rt.BasePrice)
            .ToListAsync();

        // ── Tính số phòng còn trống sau khi trừ phòng đã bị block ───────────────
        var available = roomTypes
            .Select(rt =>
            {
                var freeRooms = rt.Rooms
                    .Where(r => r.Status == RoomPhysicalStatus.Available && r.DeletedAt == null && !bookedRoomIds.Contains(r.Id))
                    .ToList();

                return new AvailableRoomTypeResponse
                {
                    RoomTypeId        = rt.Id,
                    Name              = rt.Name,
                    Description       = rt.Description,
                    BedType           = rt.BedType,
                    SizeSqm           = rt.SizeSqm,
                    BasePrice         = rt.BasePrice,
                    CapacityAdults    = rt.CapacityAdults,
                    CapacityChildren  = rt.CapacityChildren,
                    AvailableCount    = freeRooms.Count,
                    ImageUrl          = rt.RoomImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? rt.ImageUrl,
                    SampleRoomNumbers = freeRooms.Take(3).Select(r => r.RoomNumber).ToList(),
                    Amenities         = rt.RoomTypeAmenities.Select(rta => rta.Amenity.Name).ToList(),
                };
            })
            .Where(r => r.AvailableCount >= request.RoomsRequested)
            .ToList();


        return Ok(new {
            success = true,
            searchParams = new {
                checkIn  = request.CheckInDate.ToString("yyyy-MM-dd"),
                checkOut = request.CheckOutDate.ToString("yyyy-MM-dd"),
                nights,
                adults   = request.AdultsCount,
                children = request.ChildrenCount,
                rooms    = request.RoomsRequested,
            },
            availableRooms = available,
        });
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
    
    [Authorize]
    [HttpPost("multi-booking")]
    [Authorize(Policy = PermissionKeys.ManageBookings)]
    public async Task<IActionResult> CreateMultiBooking([FromBody] MultiRoomBookingRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        
        try 
        {
            var bookingId = await _bookingService.CreateMultiRoomBookingAsync(userId, request);
            return Ok(new { success = true, message = "Đặt phòng thành công (Holding)", bookingId });
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
}