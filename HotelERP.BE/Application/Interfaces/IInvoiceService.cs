using HotelERP.BE.Application.DTOs;
using HotelERP.BE.Application.DTOs.Invoices;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelERP.BE.Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<DraftInvoiceDto> GetDraftInvoiceAsync(int bookingId);
        Task<bool> ConfirmPaymentAsync(CreateInvoiceDto dto);
        Task<object> GetInvoiceSummaryAsync();
        Task<List<InvoiceListDto>> GetAllInvoicesAsync(string? searchTerm, DateTime? fromDate, DateTime? toDate, string? status);
    }
}