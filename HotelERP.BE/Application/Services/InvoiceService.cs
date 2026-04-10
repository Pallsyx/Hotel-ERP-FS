using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Application.DTOs.Invoices;
using HotelERP.BE.Application.Interfaces;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelERP.BE.Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly HotelDbContext _context;

        public InvoiceService(HotelDbContext context)
        {
            _context = context;
        }

        public async Task<List<InvoiceListDto>> GetAllInvoicesAsync(string? searchTerm, DateTime? fromDate, DateTime? toDate, string? status)
        {
            var results = new List<InvoiceListDto>();

            // 1. Phân loại: Lọc hóa đơn thật trong DB (PAID, REFUNDED, etc.)
            // Nếu lọc UNPAID (Chưa thanh toán) thì vẫn chạy để lấy những Invoice đã lưu trạng thái UNPAID
            if (string.IsNullOrEmpty(status) || status != "DỰ THẢO")
            {
                var invoiceQuery = _context.Invoices.Include(i => i.Booking).AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    invoiceQuery = invoiceQuery.Where(i => i.InvoiceCode.Contains(searchTerm) || 
                                             (i.Booking != null && i.Booking.BookingCode.Contains(searchTerm)));
                }

                if (fromDate.HasValue) invoiceQuery = invoiceQuery.Where(i => i.CreatedAt >= fromDate.Value);
                if (toDate.HasValue) invoiceQuery = invoiceQuery.Where(i => i.CreatedAt <= toDate.Value);

                if (!string.IsNullOrEmpty(status))
                {
                    invoiceQuery = invoiceQuery.Where(i => i.Status == status);
                }

                var paidInvoices = await invoiceQuery.OrderByDescending(i => i.CreatedAt).ToListAsync();
                results.AddRange(paidInvoices.Select(i => new InvoiceListDto
                {
                    Id = i.Id,
                    InvoiceCode = i.InvoiceCode,
                    BookingCode = i.Booking?.BookingCode, 
                    BookingId = i.BookingId,
                    FinalTotal = i.FinalTotal,
                    Status = i.Status,
                    CreatedAt = i.CreatedAt
                }));
            }

            // 2. Lấy danh sách Booking chưa xuất hóa đơn (UNPAID)
            if (string.IsNullOrEmpty(status) || status == "UNPAID")
            {
                var draftQuery = _context.Bookings
                    .Where(b => b.Status != "Cancelled" && b.Status != "Completed" && 
                                !_context.Invoices.Any(i => i.BookingId == b.Id))
                    .AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    draftQuery = draftQuery.Where(b => b.BookingCode.Contains(searchTerm));
                }

                var drafts = await draftQuery.ToListAsync();
                results.AddRange(drafts.Select(b => new InvoiceListDto
                {
                    Id = 0,
                    InvoiceCode = "(Dự thảo)",
                    BookingCode = b.BookingCode,
                    BookingId = b.Id,
                    FinalTotal = b.FinalAmount, // Lấy tạm FinalAmount của Booking làm gợi ý
                    Status = "UNPAID",
                    CreatedAt = b.CreatedAt
                }));
            }

            return results.OrderByDescending(r => r.CreatedAt).ToList();
        }

        public async Task<DraftInvoiceDto> GetDraftInvoiceAsync(int bookingId)
        {
            var bookingData = await _context.Bookings
                .Where(b => b.Id == bookingId)
                .Select(b => new {
                    b.BookingCode,
                    VoucherType = b.Voucher != null ? b.Voucher.DiscountType : null,
                    VoucherValue = b.Voucher != null ? b.Voucher.DiscountValue : 0,
                    VoucherMin = b.Voucher != null ? b.Voucher.MinBookingValue : 0,
                    Details = b.BookingDetails.Select(bd => new { bd.Id, bd.LineTotal }).ToList()
                })
                .FirstOrDefaultAsync();

            if (bookingData == null) throw new Exception("Đéo thấy cái Booking này đâu!");

            decimal totalRoom = bookingData.Details.Sum(d => d.LineTotal);
            var detailIds = bookingData.Details.Select(d => d.Id).ToList();

            decimal totalService = await _context.OrderServices
                .Where(os => os.BookingDetailId.HasValue && detailIds.Contains(os.BookingDetailId.Value) && os.Status == "Delivered")
                .SumAsync(os => (decimal?)os.TotalAmount) ?? 0;

            decimal totalDamage = await _context.LossAndDamages
                .Where(ld => ld.BookingDetailId.HasValue && detailIds.Contains(ld.BookingDetailId.Value))
                .SumAsync(ld => (decimal?)ld.PenaltyAmount) ?? 0;

            decimal subTotal = totalRoom + totalService + totalDamage;
            decimal discountAmount = 0;

            if (bookingData.VoucherType != null && subTotal >= (bookingData.VoucherMin ?? 0))
            {
                if (bookingData.VoucherType == "PERCENT")
                    discountAmount = subTotal * (bookingData.VoucherValue / 100);
                else
                    discountAmount = bookingData.VoucherValue;
            }

            return new DraftInvoiceDto
            {
                BookingCode = bookingData.BookingCode,
                TotalRoomAmount = totalRoom,
                TotalServiceAmount = totalService,
                TotalDamageAmount = totalDamage,
                SubTotal = subTotal,
                DiscountAmount = discountAmount,
                FinalTotal = subTotal - discountAmount
            };
        }

        public async Task<bool> ConfirmPaymentAsync(CreateInvoiceDto dto)
        {
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null) return false;

            var draft = await GetDraftInvoiceAsync(dto.BookingId);

            var invoice = new HotelERP.BE.Domain.Models.Invoice
            {
                BookingId = dto.BookingId,
                InvoiceCode = "INV-" + DateTime.Now.Ticks.ToString().Substring(10),
                TotalRoomAmount = draft.TotalRoomAmount,
                TotalServiceAmount = draft.TotalServiceAmount,
                TotalDamageAmount = draft.TotalDamageAmount,
                FinalTotal = draft.FinalTotal,
                Status = "PAID",
                Notes = dto.Notes,
                CreatedAt = DateTime.Now
            };

            _context.Invoices.Add(invoice);
            booking.Status = "Completed";
            
            return await _context.SaveChangesAsync() > 0;
        }

        // --- HÀM THỐNG KÊ MỚI NHẤT ĐÂY DU ---
        public async Task<object> GetInvoiceSummaryAsync()
        {
            var today = DateTime.Today;
            var invoices = await _context.Invoices.ToListAsync();

            return new
            {
                TotalRevenueAllTime = invoices.Sum(i => i.FinalTotal ?? 0),
                TodayRevenue = invoices.Where(i => i.CreatedAt >= today).Sum(i => i.FinalTotal ?? 0),
                TotalInvoices = invoices.Count,
                ActiveBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed" || b.Status == "CheckedIn")
            };
        }
    }
}