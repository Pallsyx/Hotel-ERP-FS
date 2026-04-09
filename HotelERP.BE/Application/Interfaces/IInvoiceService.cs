using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Invoices;

namespace HotelERP.BE.Services.Invoices;

public interface IInvoiceService
{
    Task<ApiResult<InvoiceActionResponseDto>> AddExtraFeeAsync(
        int bookingId,
        AddExtraFeeRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default);

    Task<ApiResult<InvoiceActionResponseDto>> FinalizeAsync(
        int bookingId,
        FinalizeInvoiceRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default);
}