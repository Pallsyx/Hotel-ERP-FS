using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Invoices;

namespace HotelERP.BE.Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<ApiResult<List<EligibleBookingDetailResponseDto>>> GetEligibleBookingDetailsAsync(
            int bookingId,
            CancellationToken cancellationToken = default);

        Task<ApiResult<InvoiceActionResponseDto>> CreateDraftAsync(
            CreateDraftInvoiceRequestDto request,
            int? performedByUserId,
            CancellationToken cancellationToken = default);

        Task<ApiResult<InvoiceActionResponseDto>> GetInvoiceAsync(
            int invoiceId,
            CancellationToken cancellationToken = default);

        Task<ApiResult<InvoiceActionResponseDto>> AddExtraFeeAsync(
            int invoiceId,
            AddExtraFeeRequestDto request,
            int? performedByUserId,
            CancellationToken cancellationToken = default);

    Task<ApiResult<InvoiceActionResponseDto>> SetDamageChargeAsync(
        int invoiceId,
        UpdateDamageChargeRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default);

    Task<ApiResult<InvoiceActionResponseDto>> FinalizeAsync(
        int invoiceId,
        FinalizeInvoiceRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default);

        Task<List<InvoiceListDto>> GetAllInvoicesAsync(
            string? searchTerm,
            DateTime? fromDate,
            DateTime? toDate,
            string? status,
            CancellationToken cancellationToken = default);

        Task<DraftInvoiceDto> GetDraftInvoiceAsync(
            int bookingId,
            CancellationToken cancellationToken = default);

        Task<bool> ConfirmPaymentAsync(
            CreateInvoiceDto dto,
            CancellationToken cancellationToken = default);

        Task<object> GetInvoiceSummaryAsync(
            CancellationToken cancellationToken = default);

        Task SendInvoiceEmailJobAsync(int invoiceId, string email);
    }
}
