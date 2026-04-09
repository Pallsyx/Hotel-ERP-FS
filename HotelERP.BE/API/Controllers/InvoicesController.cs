using System.Security.Claims;
using HotelERP.BE.DTOs.Invoices;
using HotelERP.BE.Services.Invoices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize(Roles = "Admin,Manager,Receptionist")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpPost("{bookingId:int}/extra-fee")]
    public async Task<IActionResult> AddExtraFee(
        int bookingId,
        [FromBody] AddExtraFeeRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.AddExtraFeeAsync(bookingId, request, userId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("{bookingId:int}/finalize")]
    public async Task<IActionResult> FinalizeInvoice(
        int bookingId,
        [FromBody] FinalizeInvoiceRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.FinalizeAsync(bookingId, request, userId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    private int? ResolveCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var userId) ? userId : null;
    }
}