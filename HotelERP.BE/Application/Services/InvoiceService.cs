using System.Text.Json;
using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Invoices;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Services.Invoices;

public class InvoiceService : IInvoiceService
{
    private const decimal VatRate = 0.10m;

    private readonly HotelDbContext _dbContext;

    public InvoiceService(HotelDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> AddExtraFeeAsync(
        int bookingId,
        AddExtraFeeRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_EXTRA_FEE_AMOUNT",
                "Số tiền phụ phí phải lớn hơn 0.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var booking = await LoadBookingForInvoiceAsync(bookingId, cancellationToken);
        if (booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "BOOKING_NOT_FOUND",
                $"Không tìm thấy booking id = {bookingId}.");
        }

        var invoice = GetOrCreateWorkingInvoice(booking);

        if (IsClosedInvoice(invoice.Status))
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_ALREADY_CLOSED",
                $"Không thể thêm phụ phí vì hóa đơn đang ở trạng thái {invoice.Status}.",
                new
                {
                    bookingId,
                    invoiceId = invoice.Id,
                    invoiceStatus = invoice.Status
                });
        }

        var before = MapResponse(booking, invoice);

        invoice.ManualAdjustmentAmount = Money(invoice.ManualAdjustmentAmount + request.Amount);
        invoice.Status = "Draft";
        invoice.Notes = AppendAuditText(
            invoice.Notes,
            $"Thêm phụ phí: +{Money(request.Amount):N0} VND" +
            (string.IsNullOrWhiteSpace(request.Reason) ? string.Empty : $" | Lý do: {request.Reason}"));
        invoice.UpdatedAt = DateTime.UtcNow;

        RecalculateInvoice(booking, invoice);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        AddAuditLog(
            performedByUserId,
            "ADD_EXTRA_FEE",
            "Invoices",
            invoice.Id,
            before,
            after,
            request.Reason);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ApiResult<InvoiceActionResponseDto>.Ok(
            after,
            "Thêm phụ phí thành công.",
            "ADD_EXTRA_FEE_SUCCESS");
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> FinalizeAsync(
        int bookingId,
        FinalizeInvoiceRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "PAYMENT_METHOD_REQUIRED",
                "paymentMethod là bắt buộc.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var booking = await LoadBookingForInvoiceAsync(bookingId, cancellationToken);
        if (booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "BOOKING_NOT_FOUND",
                $"Không tìm thấy booking id = {bookingId}.");
        }

        var invoice = GetOrCreateWorkingInvoice(booking);

        if (Normalize(invoice.Status) == "PAID")
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_ALREADY_PAID",
                "Hóa đơn này đã được chốt trước đó.",
                new
                {
                    bookingId,
                    invoiceId = invoice.Id,
                    invoiceStatus = invoice.Status,
                    paidAt = invoice.PaidAt
                });
        }

        if (Normalize(invoice.Status) is "REFUNDED" or "CANCELLED" or "VOIDED")
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_CLOSED",
                $"Không thể chốt hóa đơn vì trạng thái hiện tại là {invoice.Status}.",
                new
                {
                    bookingId,
                    invoiceId = invoice.Id,
                    invoiceStatus = invoice.Status
                });
        }

        var before = MapResponse(booking, invoice);

        invoice.Status = "Draft";
        if (!string.IsNullOrWhiteSpace(request.Note))
        {
            invoice.Notes = AppendAuditText(invoice.Notes, $"Ghi chú chốt hóa đơn: {request.Note}");
        }

        RecalculateInvoice(booking, invoice);

        var now = DateTime.UtcNow;

        invoice.Status = "Paid";
        invoice.IssuedAt ??= now;
        invoice.PaidAt = now;
        invoice.UpdatedAt = now;

        booking.PaymentStatus = "PAID";
        booking.Status = "Completed";
        booking.FinalAmount = invoice.FinalTotal;
        booking.UpdatedAt = now;

        foreach (var detail in booking.BookingDetails)
        {
            detail.Status = "Checked_out";
            detail.ActualCheckOutAt ??= now;
            detail.UpdatedAt = now;
        }

        var payment = GetOrCreateInboundPayment(invoice, request, now);
        if (payment.Id == 0)
        {
            _dbContext.Payments.Add(payment);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        AddAuditLog(
            performedByUserId,
            "FINALIZE_INVOICE",
            "Invoices",
            invoice.Id,
            before,
            after,
            request.Note);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ApiResult<InvoiceActionResponseDto>.Ok(
            after,
            "Chốt và xuất hóa đơn thành công.",
            "FINALIZE_INVOICE_SUCCESS");
    }

    private async Task<Booking?> LoadBookingForInvoiceAsync(int bookingId, CancellationToken cancellationToken)
    {
        return await _dbContext.Bookings
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.OrderServices)
                    .ThenInclude(x => x.OrderServiceDetails)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.LossAndDamages)
            .Include(x => x.Invoices)
                .ThenInclude(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);
    }

    private Invoice GetOrCreateWorkingInvoice(Booking booking)
    {
        var latestInvoice = booking.Invoices
            .OrderByDescending(x => x.Id)
            .FirstOrDefault();

        if (latestInvoice is not null)
        {
            if (string.IsNullOrWhiteSpace(latestInvoice.InvoiceCode))
            {
                latestInvoice.InvoiceCode = BuildInvoiceCode(booking.BookingCode);
            }

            if (!IsClosedInvoice(latestInvoice.Status))
            {
                latestInvoice.Status = "Draft";
            }

            return latestInvoice;
        }

        var invoice = new Invoice
        {
            BookingId = booking.Id,
            InvoiceCode = BuildInvoiceCode(booking.BookingCode),
            Status = "Draft",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            TotalRoomAmount = 0,
            TotalServiceAmount = 0,
            TotalDamageAmount = 0,
            DiscountAmount = 0,
            ManualAdjustmentAmount = 0,
            TaxAmount = 0,
            FinalTotal = 0,
            RefundAmount = 0
        };

        booking.Invoices.Add(invoice);
        _dbContext.Invoices.Add(invoice);

        return invoice;
    }

    private void RecalculateInvoice(Booking booking, Invoice invoice)
    {
        var roomTotal = Money(booking.BookingDetails.Sum(CalculateRoomLineAmount));

        var serviceTotal = Money(
            booking.BookingDetails
                .SelectMany(x => x.OrderServices)
                .Where(x => Normalize(x.Status) != "CANCELLED")
                .Sum(CalculateOrderServiceAmount));

        var damageTotal = Money(
            booking.BookingDetails
                .SelectMany(x => x.LossAndDamages)
                .Where(x => IsChargeableDamage(x.Status))
                .Sum(x => x.PenaltyAmount));

        var discount = Money(Math.Max(0, booking.DiscountAmount));
        var manualAdjustment = Money(Math.Max(0, invoice.ManualAdjustmentAmount));
        var refundAmount = Money(Math.Max(0, invoice.RefundAmount));

        var taxableBase = Money(Math.Max(0, roomTotal + serviceTotal + damageTotal + manualAdjustment - discount));
        var taxAmount = Money(taxableBase * VatRate);
        var finalTotal = Money(Math.Max(0, taxableBase + taxAmount - refundAmount));

        invoice.TotalRoomAmount = roomTotal;
        invoice.TotalServiceAmount = serviceTotal;
        invoice.TotalDamageAmount = damageTotal;
        invoice.DiscountAmount = discount;
        invoice.ManualAdjustmentAmount = manualAdjustment;
        invoice.TaxAmount = taxAmount;
        invoice.FinalTotal = finalTotal;
    }

    private static decimal CalculateRoomLineAmount(BookingDetail detail)
    {
        if (detail.LineTotal > 0)
        {
            return Money(detail.LineTotal);
        }

        var nights = detail.Nights > 0
            ? detail.Nights
            : Math.Max(1, (detail.CheckOutDate.Date - detail.CheckInDate.Date).Days);

        var amount = (detail.PricePerNight * nights) + detail.EarlyCheckInFee + detail.LateCheckOutFee;
        return Money(amount);
    }

    private static decimal CalculateOrderServiceAmount(OrderService order)
    {
        if (order.TotalAmount > 0)
        {
            return Money(order.TotalAmount);
        }

        var fallback = order.OrderServiceDetails.Sum(d =>
            d.LineTotal > 0 ? d.LineTotal : (d.Quantity * d.UnitPrice));

        return Money(fallback);
    }

    private Payment GetOrCreateInboundPayment(Invoice invoice, FinalizeInvoiceRequestDto request, DateTime now)
    {
        var existing = invoice.Payments
            .OrderByDescending(x => x.Id)
            .FirstOrDefault(x => Normalize(x.PaymentDirection) == "IN");

        if (existing is not null)
        {
            existing.PaymentMethod = request.PaymentMethod;
            existing.TransactionCode = request.TransactionCode;
            existing.AmountPaid = invoice.FinalTotal;
            existing.PaymentDate = now;
            existing.PaymentDirection = "IN";
            existing.Status = "SUCCESS";
            existing.GatewayName = request.PaymentMethod;
            existing.ProviderResponse = request.Note;
            return existing;
        }

        return new Payment
        {
            InvoiceId = invoice.Id == 0 ? null : invoice.Id,
            PaymentMethod = request.PaymentMethod,
            TransactionCode = request.TransactionCode,
            AmountPaid = invoice.FinalTotal,
            PaymentDate = now,
            PaymentDirection = "IN",
            Status = "SUCCESS",
            GatewayName = request.PaymentMethod,
            ProviderResponse = request.Note,
            CreatedAt = now
        };
    }

    private InvoiceActionResponseDto MapResponse(Booking booking, Invoice invoice)
    {
        var latestPayment = invoice.Payments
            .OrderByDescending(x => x.Id)
            .FirstOrDefault(x => Normalize(x.PaymentDirection) == "IN");

        return new InvoiceActionResponseDto
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            InvoiceId = invoice.Id,
            InvoiceCode = invoice.InvoiceCode,
            InvoiceStatus = invoice.Status,
            BookingStatus = booking.Status,
            PaymentStatus = booking.PaymentStatus,
            TotalRoomAmount = invoice.TotalRoomAmount,
            TotalServiceAmount = invoice.TotalServiceAmount,
            TotalDamageAmount = invoice.TotalDamageAmount,
            ManualAdjustmentAmount = invoice.ManualAdjustmentAmount,
            DiscountAmount = invoice.DiscountAmount,
            TaxAmount = invoice.TaxAmount,
            FinalTotal = invoice.FinalTotal,
            Notes = invoice.Notes,
            IssuedAt = invoice.IssuedAt,
            PaidAt = invoice.PaidAt,
            UpdatedAt = invoice.UpdatedAt,
            PaymentId = latestPayment?.Id,
            PaymentMethod = latestPayment?.PaymentMethod,
            TransactionCode = latestPayment?.TransactionCode
        };
    }

    private void AddAuditLog(
        int? userId,
        string action,
        string tableName,
        int recordId,
        object? oldValue,
        object? newValue,
        string? reason)
    {
        _dbContext.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = action,
            TableName = tableName,
            RecordId = recordId,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue),
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        });
    }

    private static string BuildInvoiceCode(string bookingCode)
    {
        return $"INV-{bookingCode}".Trim().ToUpperInvariant();
    }

    private static bool IsClosedInvoice(string? status)
    {
        var normalized = Normalize(status);
        return normalized is "PAID" or "REFUNDED" or "CANCELLED" or "VOIDED";
    }

    private static bool IsChargeableDamage(string? status)
    {
        var normalized = Normalize(status);
        return normalized is not "WAIVED" and not "CANCELLED" and not "VOIDED";
    }

    private static string AppendAuditText(string? current, string newLine)
    {
        var prefix = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] ";
        if (string.IsNullOrWhiteSpace(current))
        {
            return prefix + newLine.Trim();
        }

        return current.Trim() + Environment.NewLine + prefix + newLine.Trim();
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToUpperInvariant();
    }

    private static decimal Money(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }
}