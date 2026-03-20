using HotelERP.BE.DTOs.RoomTypes;
using HotelERP.BE.Services.RoomTypes;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.Controllers.Public;

[ApiController]
[Route("api/public/room-types")]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeQueryService _roomTypeQueryService;

    public RoomTypesController(IRoomTypeQueryService roomTypeQueryService)
    {
        _roomTypeQueryService = roomTypeQueryService;
    }

    [HttpGet("search-by-occupancy")]
    public async Task<IActionResult> SearchByOccupancy(
        [FromQuery] SearchRoomTypesByOccupancyRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _roomTypeQueryService.SearchByOccupancyAsync(request, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("price-preview")]
    public async Task<IActionResult> PreviewPrice(
        [FromBody] RoomPricePreviewRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _roomTypeQueryService.PreviewPriceAsync(request, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }
}