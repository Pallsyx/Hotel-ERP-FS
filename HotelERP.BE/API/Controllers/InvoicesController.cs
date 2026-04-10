using Microsoft.AspNetCore.Mvc;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Application.DTOs.Invoices;
using System;
using System.Threading.Tasks;

namespace HotelERP.BE.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        public InvoicesController(IInvoiceService invoiceService) => _invoiceService = invoiceService;

        // 1. LẤY DANH SÁCH HÓA ĐƠN + TÌM KIẾM + LỌC NGÀY
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? searchTerm, 
            [FromQuery] DateTime? fromDate, 
            [FromQuery] DateTime? toDate,
            [FromQuery] string? status)
        {
            var result = await _invoiceService.GetAllInvoicesAsync(searchTerm, fromDate, toDate, status);
            return Ok(result);
        }

        // 2. LẤY HÓA ĐƠN TẠM TÍNH (DRAFT)
        [HttpGet("draft/{bookingId}")]
        public async Task<IActionResult> GetDraft(int bookingId) 
        {
            var res = await _invoiceService.GetDraftInvoiceAsync(bookingId);
            return Ok(res);
        }

        // 3. XÁC NHẬN THANH TOÁN (CONFIRM)
        [HttpPost("confirm")]
        public async Task<IActionResult> Confirm([FromBody] CreateInvoiceDto dto)
        {
            var result = await _invoiceService.ConfirmPaymentAsync(dto);
            if (result) return Ok("Thanh toán thành công!");
            return BadRequest("Thanh toán thất bại!");
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var res = await _invoiceService.GetInvoiceSummaryAsync();
            return Ok(res);
        }
    }
}