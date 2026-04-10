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

    [HttpGet("bookings/{bookingId:int}/eligible-details")]
    public async Task<IActionResult> GetEligibleBookingDetails(
        int bookingId,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetEligibleBookingDetailsAsync(bookingId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("draft")]
    public async Task<IActionResult> CreateDraft(
        [FromBody] CreateDraftInvoiceRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.CreateDraftAsync(request, userId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("{invoiceId:int}")]
    public async Task<IActionResult> GetInvoice(
        int invoiceId,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetInvoiceAsync(invoiceId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("{invoiceId:int}/extra-fee")]
    public async Task<IActionResult> AddExtraFee(
        int invoiceId,
        [FromBody] AddExtraFeeRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.AddExtraFeeAsync(invoiceId, request, userId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("{invoiceId:int}/finalize")]
    public async Task<IActionResult> FinalizeInvoice(
        int invoiceId,
        [FromBody] FinalizeInvoiceRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.FinalizeAsync(invoiceId, request, userId, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    private int? ResolveCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var userId) ? userId : null;
    }
}