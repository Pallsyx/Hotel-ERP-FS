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

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? searchTerm,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetAllInvoicesAsync(searchTerm, fromDate, toDate, status, cancellationToken);
        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _invoiceService.GetInvoiceSummaryAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("draft/{bookingId:int}")]
    public async Task<IActionResult> GetDraftInvoice(int bookingId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _invoiceService.GetDraftInvoiceAsync(bookingId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmPayment(
        [FromBody] CreateInvoiceDto dto,
        CancellationToken cancellationToken)
    {
        var success = await _invoiceService.ConfirmPaymentAsync(dto, cancellationToken);
        if (success)
        {
            return Ok(new { message = "Thanh toán thành công!" });
        }

        return BadRequest(new { message = "Thanh toán thất bại!" });
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

    [HttpPut("{invoiceId:int}/damage-charge")]
    public async Task<IActionResult> UpdateDamageCharge(
        int invoiceId,
        [FromBody] UpdateDamageChargeRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var result = await _invoiceService.SetDamageChargeAsync(invoiceId, request, userId, cancellationToken);
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
