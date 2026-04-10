using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Invoices;

namespace HotelERP.BE.Services.Invoices;

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

    Task<ApiResult<InvoiceActionResponseDto>> FinalizeAsync(
        int invoiceId,
        FinalizeInvoiceRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default);
}