using System.Security.Claims;
using HotelERP.BE.DTOs.Invoices;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelERP.BE.API.Controllers
{
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
            [FromQuery] int? bookingId,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _invoiceService.GetAllInvoicesAsync(searchTerm, fromDate, toDate, status, bookingId, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi để debug
                Console.Error.WriteLine($"[InvoicesController.GetAll] EXCEPTION: {ex}");
                return StatusCode(500, new
                {
                    message = "Lỗi server khi lấy danh sách hóa đơn.",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }


        [HttpGet("{invoiceId:int}")]
        public async Task<IActionResult> GetInvoice(int invoiceId, CancellationToken cancellationToken)
        {
            var result = await _invoiceService.GetInvoiceAsync(invoiceId, cancellationToken);
            return StatusCode(result.StatusCode, result);
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

        [HttpPost("bookings/{bookingId:int}/voucher")]
public async Task<IActionResult> ApplyVoucherToBooking(
    int bookingId,
    [FromBody] ApplyInvoiceVoucherRequestDto request,
    CancellationToken cancellationToken)
{
    var userId = ResolveCurrentUserId();
    var result = await _invoiceService.ApplyVoucherToBookingAsync(bookingId, request, userId, cancellationToken);
    return StatusCode(result.StatusCode, result);
}

[HttpGet("bookings/{bookingId:int}/birthday-vouchers")]
public async Task<IActionResult> GetBirthdayVouchersForBooking(
    int bookingId,
    CancellationToken cancellationToken)
{
    var result = await _invoiceService.GetBirthdayVouchersForBookingAsync(bookingId, cancellationToken);
    return StatusCode(result.StatusCode, result);
}

[HttpPost("draft")]
        public async Task<IActionResult> CreateDraft(
            [FromBody] CreateDraftInvoiceRequestDto request,
            CancellationToken cancellationToken)
        {
            var userId = ResolveCurrentUserId();
            var role = ResolveCurrentUserRole();
            var result = await _invoiceService.CreateDraftAsync(request, userId, role, cancellationToken);
            return StatusCode(result.StatusCode, result);
        }

    [HttpPut("{invoiceId:int}/damage-charge")]
    public async Task<IActionResult> UpdateDamageCharge(
        int invoiceId,
        [FromBody] UpdateDamageChargeRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = ResolveCurrentUserId();
        var role = ResolveCurrentUserRole();
        var result = await _invoiceService.SetDamageChargeAsync(invoiceId, request, userId, role, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

        [HttpPost("{invoiceId:int}/finalize")]
        public async Task<IActionResult> FinalizeInvoice(
            int invoiceId,
            [FromBody] FinalizeInvoiceRequestDto request,
            CancellationToken cancellationToken)
        {
            var userId = ResolveCurrentUserId();
        var role = ResolveCurrentUserRole();
            var result = await _invoiceService.FinalizeAsync(invoiceId, request, userId, role, cancellationToken);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{invoiceId:int}/extra-fee")]
        public async Task<IActionResult> AddExtraFee(
            int invoiceId,
            [FromBody] AddExtraFeeRequestDto request,
            CancellationToken cancellationToken)
        {
            var userId = ResolveCurrentUserId();
            var role = ResolveCurrentUserRole();
            var result = await _invoiceService.AddExtraFeeAsync(invoiceId, request, userId, role, cancellationToken);
            return StatusCode(result.StatusCode, result);
        }

        private int? ResolveCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var userId) ? userId : null;
        }

        private string? ResolveCurrentUserRole()
        {
            return User.FindFirstValue(ClaimTypes.Role);
        }
    }
}
