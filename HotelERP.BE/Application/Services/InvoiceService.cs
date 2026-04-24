using System.Text.Json;
using System.Text.RegularExpressions;
using System.Security.Claims;
using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Invoices;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;
using HotelERP.BE.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using HotelERP.BE.Helpers.AuditLogs;

namespace HotelERP.BE.Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private const decimal VatRate = 0.10m;
        private const string DamageOverrideTokenPrefix = "[[DAMAGE_OVERRIDE:";

        private readonly HotelDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InvoiceService(HotelDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        private sealed class DetailChargeSummary
        {
            public BookingDetail Detail { get; set; } = null!;
            public decimal RoomCharge { get; set; }
            public decimal ServiceCharge { get; set; }
            public decimal DamageCharge { get; set; }
            public decimal Subtotal => RoomCharge + ServiceCharge + DamageCharge;
        }

        public async Task<ApiResult<List<EligibleBookingDetailResponseDto>>> GetEligibleBookingDetailsAsync(
            int bookingId,
        CancellationToken cancellationToken = default)
    {
        var booking = await LoadBookingGraphAsync(bookingId, cancellationToken);
        if (booking is null)
        {
            return ApiResult<List<EligibleBookingDetailResponseDto>>.Fail(
                StatusCodes.Status404NotFound,
                "BOOKING_NOT_FOUND",
                $"Không tìm thấy booking id = {bookingId}.");
        }

        var result = booking.BookingDetails
            .OrderBy(x => x.Id)
            .Select(detail =>
            {
                var summary = BuildDetailChargeSummary(detail);
                var hasOpenInvoice = detail.InvoiceBookingDetails.Any(x => !IsClosedInvoice(x.Invoice?.Status));

                var canCreateInvoice = true;
                string? blockReason = null;

                if (!IsCheckedOut(detail))
                {
                    canCreateInvoice = false;
                    blockReason = "Phòng này chưa checkout.";
                }
                else if (Normalize(detail.SettlementStatus) == "PAID")
                {
                    canCreateInvoice = false;
                    blockReason = "Phòng này đã thanh toán.";
                }
                else if (hasOpenInvoice)
                {
                    canCreateInvoice = false;
                    blockReason = "Phòng này đang nằm trong một invoice nháp khác.";
                }

                return new EligibleBookingDetailResponseDto
                {
                    BookingDetailId = detail.Id,
                    BookingId = booking.Id,
                    RoomId = detail.RoomId,
                    RoomNumber = detail.Room?.RoomNumber ?? string.Empty,
                    RoomTypeId = detail.RoomTypeId,
                    RoomTypeName = detail.RoomType?.Name,
                    CheckInDate = detail.CheckInDate,
                    CheckOutDate = detail.CheckOutDate,
                    RoomCharge = Money(summary.RoomCharge),
                    ServiceCharge = Money(summary.ServiceCharge),
                    DamageCharge = Money(summary.DamageCharge),
                    CheckoutStatus = detail.Status,
                    SettlementStatus = detail.SettlementStatus,
                    CanCreateInvoice = canCreateInvoice,
                    BlockReason = blockReason
                };
            })
            .ToList();

        return ApiResult<List<EligibleBookingDetailResponseDto>>.Ok(
            result,
            "Lấy danh sách phòng đủ điều kiện lập hóa đơn thành công.",
            "GET_ELIGIBLE_BOOKING_DETAILS_SUCCESS");
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> CreateDraftAsync(
        CreateDraftInvoiceRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default)
    {
        var detailIds = request.BookingDetailIds
            .Where(x => x > 0)
            .Distinct()
            .ToList();

        if (request.BookingId <= 0 || detailIds.Count == 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_DRAFT_REQUEST",
                "Phải truyền bookingId và ít nhất 1 bookingDetailId hợp lệ.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var booking = await LoadBookingGraphAsync(request.BookingId, cancellationToken);
        if (booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "BOOKING_NOT_FOUND",
                $"Không tìm thấy booking id = {request.BookingId}.");
        }

        var selectedDetails = booking.BookingDetails
            .Where(x => detailIds.Contains(x.Id))
            .OrderBy(x => x.Id)
            .ToList();

        if (selectedDetails.Count != detailIds.Count)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "BOOKING_DETAILS_NOT_BELONG_TO_BOOKING",
                "Có bookingDetail không thuộc booking đã chọn.",
                new
                {
                    bookingId = request.BookingId,
                    bookingDetailIds = detailIds
                });
        }

        var notCheckedOut = selectedDetails.Where(x => !IsCheckedOut(x)).Select(x => x.Id).ToList();
        if (notCheckedOut.Count > 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "BOOKING_DETAILS_NOT_CHECKED_OUT",
                "Chỉ được lập hóa đơn cho những phòng đã checkout.",
                new { bookingDetailIds = notCheckedOut });
        }

        var alreadyPaid = selectedDetails
            .Where(x => Normalize(x.SettlementStatus) == "PAID")
            .Select(x => x.Id)
            .ToList();

        if (alreadyPaid.Count > 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "BOOKING_DETAILS_ALREADY_PAID",
                "Có phòng đã thanh toán trước đó.",
                new { bookingDetailIds = alreadyPaid });
        }

        var overlappingDraft = booking.Invoices
            .Where(x => !IsClosedInvoice(x.Status))
            .FirstOrDefault(x => x.InvoiceBookingDetails.Any(y => detailIds.Contains(y.BookingDetailId)));

        if (overlappingDraft is not null)
        {
            var existingIds = overlappingDraft.InvoiceBookingDetails
                .Select(x => x.BookingDetailId)
                .OrderBy(x => x)
                .ToList();

            var incomingIds = detailIds.OrderBy(x => x).ToList();

            if (existingIds.SequenceEqual(incomingIds))
            {
                var existingResponse = MapResponse(booking, overlappingDraft);
                return ApiResult<InvoiceActionResponseDto>.Ok(
                    existingResponse,
                    "Nhóm phòng này đã có invoice nháp, trả lại invoice hiện tại.",
                    "DRAFT_INVOICE_ALREADY_EXISTS");
            }

            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "BOOKING_DETAILS_ALREADY_IN_OTHER_DRAFT",
                "Một phần phòng đã nằm trong invoice nháp khác.",
                new
                {
                    incomingBookingDetailIds = incomingIds,
                    existingInvoiceId = overlappingDraft.Id,
                    existingBookingDetailIds = existingIds
                });
        }

        var sequence = booking.Invoices.Count + 1;
        var now = DateTime.UtcNow;

        var invoice = new Invoice
        {
            BookingId = booking.Id,
            InvoiceCode = BuildInvoiceCode(booking.BookingCode, sequence),
            Status = "Draft",
            Notes = string.IsNullOrWhiteSpace(request.Note)
                ? "Invoice nháp tạo theo Hướng B"
                : AppendAuditText(null, request.Note),
            CreatedAt = now,
            UpdatedAt = now,
            TotalRoomAmount = 0,
            TotalServiceAmount = 0,
            TotalDamageAmount = 0,
            DiscountAmount = 0,
            ManualAdjustmentAmount = 0,
            TaxAmount = 0,
            FinalTotal = 0,
            RefundAmount = 0
        };

        foreach (var detail in selectedDetails)
        {
            invoice.InvoiceBookingDetails.Add(new InvoiceBookingDetail
            {
                BookingDetailId = detail.Id,
                RoomCharge = 0,
                ServiceCharge = 0,
                DamageCharge = 0,
                DiscountAmount = 0,
                ExtraFeeAmount = 0,
                TaxAmount = 0,
                LineTotal = 0,
                CreatedAt = now
            });

            detail.SettlementStatus = "DRAFTED";
            detail.UpdatedAt = now;
        }

        booking.Invoices.Add(invoice);
        _dbContext.Invoices.Add(invoice);

        RecalculateInvoice(booking, invoice);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        await AddAuditLog(
            performedByUserId,
            "CREATE_DRAFT_INVOICE_PARTIAL",
            "Invoices",
            invoice.Id,
            null,
            after,
            request.Note);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ApiResult<InvoiceActionResponseDto>.Created(
            after,
            "Tạo hóa đơn tạm tính theo nhóm phòng thành công.",
            "CREATE_DRAFT_INVOICE_SUCCESS");
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> GetInvoiceAsync(
        int invoiceId,
        CancellationToken cancellationToken = default)
    {
        var invoice = await LoadInvoiceGraphAsync(invoiceId, cancellationToken);
        if (invoice is null || invoice.Booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "INVOICE_NOT_FOUND",
                $"Không tìm thấy invoice id = {invoiceId}.");
        }

        if (!IsClosedInvoice(invoice.Status))
        {
            RecalculateInvoice(invoice.Booking, invoice);
            invoice.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return ApiResult<InvoiceActionResponseDto>.Ok(
            MapResponse(invoice.Booking, invoice),
            "Lấy chi tiết hóa đơn thành công.",
            "GET_INVOICE_SUCCESS");
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> AddExtraFeeAsync(
        int invoiceId,
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

        var invoice = await LoadInvoiceGraphAsync(invoiceId, cancellationToken);
        if (invoice is null || invoice.Booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "INVOICE_NOT_FOUND",
                $"Không tìm thấy invoice id = {invoiceId}.");
        }

        if (invoice.InvoiceBookingDetails.Count == 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_HAS_NO_BOOKING_DETAILS",
                "Invoice này chưa gắn với booking detail nào.");
        }

        if (IsClosedInvoice(invoice.Status))
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_ALREADY_CLOSED",
                $"Không thể thêm phụ phí vì hóa đơn đang ở trạng thái {invoice.Status}.",
                new
                {
                    invoiceId,
                    invoiceStatus = invoice.Status
                });
        }

        var booking = invoice.Booking;
        var before = MapResponse(booking, invoice);

        invoice.ManualAdjustmentAmount = Money((invoice.ManualAdjustmentAmount ?? 0m) + request.Amount);
        invoice.Status = "Draft";
        invoice.Notes = AppendAuditText(
            invoice.Notes,
            $"Thêm phụ phí: +{Money(request.Amount):N0} VND" +
            (string.IsNullOrWhiteSpace(request.Reason) ? string.Empty : $" | Lý do: {request.Reason}"));
        invoice.UpdatedAt = DateTime.UtcNow;

        RecalculateInvoice(booking, invoice);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        await AddAuditLog(
            performedByUserId,
            "ADD_EXTRA_FEE_INVOICE",
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

    public async Task<ApiResult<InvoiceActionResponseDto>> SetDamageChargeAsync(
        int invoiceId,
        UpdateDamageChargeRequestDto request,
        int? performedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.Amount < 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_DAMAGE_AMOUNT",
                "Phí đền bù phải lớn hơn hoặc bằng 0.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var invoice = await LoadInvoiceGraphAsync(invoiceId, cancellationToken);
        if (invoice is null || invoice.Booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "INVOICE_NOT_FOUND",
                $"Không tìm thấy invoice id = {invoiceId}.");
        }

        if (invoice.InvoiceBookingDetails.Count == 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_HAS_NO_BOOKING_DETAILS",
                "Invoice này chưa gắn với booking detail nào.");
        }

        if (IsClosedInvoice(invoice.Status))
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_ALREADY_CLOSED",
                $"Không thể cập nhật phí đền bù vì hóa đơn đang ở trạng thái {invoice.Status}.",
                new
                {
                    invoiceId,
                    invoiceStatus = invoice.Status
                });
        }

        var booking = invoice.Booking;
        var before = MapResponse(booking, invoice);

        invoice.Notes = UpsertDamageOverrideAmount(invoice.Notes, Money(request.Amount));
        invoice.Notes = AppendAuditText(
            invoice.Notes,
            $"Cập nhật phí đền bù: {Money(request.Amount):N0} VND" +
            (string.IsNullOrWhiteSpace(request.Reason) ? string.Empty : $" | Lý do: {request.Reason}"));
        invoice.Status = "Draft";
        invoice.UpdatedAt = DateTime.UtcNow;

        RecalculateInvoice(booking, invoice);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        await AddAuditLog(
            performedByUserId,
            "UPDATE_DAMAGE_CHARGE_INVOICE",
            "Invoices",
            invoice.Id,
            before,
            after,
            request.Reason);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ApiResult<InvoiceActionResponseDto>.Ok(
            after,
            "Cập nhật phí đền bù thành công.",
            "UPDATE_DAMAGE_CHARGE_SUCCESS");
    }

    public async Task<ApiResult<InvoiceActionResponseDto>> FinalizeAsync(
        int invoiceId,
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

        var invoice = await LoadInvoiceGraphAsync(invoiceId, cancellationToken);
        if (invoice is null || invoice.Booking is null)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "INVOICE_NOT_FOUND",
                $"Không tìm thấy invoice id = {invoiceId}.");
        }

        if (invoice.InvoiceBookingDetails.Count == 0)
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_HAS_NO_BOOKING_DETAILS",
                "Invoice này chưa gắn với booking detail nào.");
        }

        if (Normalize(invoice.Status) == "PAID")
        {
            return ApiResult<InvoiceActionResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "INVOICE_ALREADY_PAID",
                "Hóa đơn này đã được chốt trước đó.",
                new
                {
                    invoiceId,
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
                    invoiceId,
                    invoiceStatus = invoice.Status
                });
        }

        var booking = invoice.Booking;
        var before = MapResponse(booking, invoice);

        RecalculateInvoice(booking, invoice);

        var selectedDetailIds = invoice.InvoiceBookingDetails
            .Select(x => x.BookingDetailId)
            .Distinct()
            .ToList();

        var selectedDetails = booking.BookingDetails
            .Where(x => selectedDetailIds.Contains(x.Id))
            .ToList();

        var now = DateTime.UtcNow;

        invoice.Status = "Paid";
        invoice.IssuedAt ??= now;
        invoice.PaidAt = now;
        invoice.UpdatedAt = now;

        if (!string.IsNullOrWhiteSpace(request.Note))
        {
            invoice.Notes = AppendAuditText(invoice.Notes, $"Ghi chú chốt hóa đơn: {request.Note}");
        }

        foreach (var detail in selectedDetails)
        {
            detail.Status = "Checked_out";
            detail.ActualCheckOutAt ??= now;
            detail.SettlementStatus = "PAID";
            detail.SettledAt = now;
            detail.UpdatedAt = now;
        }

        var payment = GetOrCreateInboundPayment(invoice, request, now);
        if (payment.Id == 0)
        {
            _dbContext.Payments.Add(payment);
        }

        UpdateBookingAggregateStatus(booking, now);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = MapResponse(booking, invoice);

        await AddAuditLog(
            performedByUserId,
            "FINALIZE_INVOICE_PARTIAL",
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



    public async Task<List<InvoiceListDto>> GetAllInvoicesAsync(
        string? searchTerm,
        DateTime? fromDate,
        DateTime? toDate,
        string? status,
        CancellationToken cancellationToken = default)
    {
        await RefreshOpenInvoicesAsync(cancellationToken);

        var results = new List<InvoiceListDto>();

        var invoiceQuery = _dbContext.Invoices
            .AsNoTracking()
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.InvoiceBookingDetails)
                .ThenInclude(x => x.BookingDetail)
                    .ThenInclude(x => x.Room)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim();
            invoiceQuery = invoiceQuery.Where(x =>
                (x.InvoiceCode != null && x.InvoiceCode.Contains(term)) ||
                (x.Booking != null && x.Booking.BookingCode.Contains(term)) ||
                (x.Booking != null && x.Booking.GuestName != null && x.Booking.GuestName.Contains(term)) ||
                (x.Booking != null && x.Booking.User != null && x.Booking.User.FullName.Contains(term)) ||
                x.InvoiceBookingDetails.Any(d => d.BookingDetail != null && d.BookingDetail.Room != null && d.BookingDetail.Room.RoomNumber.Contains(term)));
        }

        if (fromDate.HasValue)
        {
            var from = fromDate.Value.Date;
            invoiceQuery = invoiceQuery.Where(x => x.CreatedAt >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = toDate.Value.Date.AddDays(1);
            invoiceQuery = invoiceQuery.Where(x => x.CreatedAt < toExclusive);
        }

        var normalizedStatus = Normalize(status);
        var invoices = await invoiceQuery
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(normalizedStatus) && normalizedStatus != "UNPAID")
        {
            invoices = invoices
                .Where(x => Normalize(x.Status) == normalizedStatus)
                .ToList();
        }

        results.AddRange(invoices.Select(x =>
        {
            var roomNumbers = x.InvoiceBookingDetails?
                .Select(d => d.BookingDetail?.Room?.RoomNumber)
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Distinct()
                .ToList() ?? new List<string?>();

            var firstBookingDetailId = x.InvoiceBookingDetails?
                .Select(d => (int?)d.BookingDetailId)
                .FirstOrDefault();

            return new InvoiceListDto
            {
                RowId = $"inv-{x.Id}",
                Id = x.Id,
                InvoiceId = x.Id,
                BookingId = x.Booking?.Id ?? 0,
                BookingDetailId = firstBookingDetailId,
                InvoiceCode = x.InvoiceCode,
                CustomerName = x.Booking?.GuestName
                   ?? x.Booking?.User?.FullName
                   ?? "Khách lẻ",
                BookingCode = x.Booking?.BookingCode,
                RoomNumber = roomNumbers.Count == 0 ? "-" : string.Join(", ", roomNumbers),
                FinalTotal = x.FinalTotal,
                Status = Normalize(x.Status) == "DRAFT" ? "DRAFT" : Normalize(x.Status),
                CreatedAt = x.CreatedAt,
                IsDraftPreview = false
            };
        }));

        if (string.IsNullOrWhiteSpace(normalizedStatus) || normalizedStatus == "UNPAID")
        {
            var bookingQuery = _dbContext.Bookings
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Voucher)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.Room)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.InvoiceBookingDetails)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.OrderServices)
                        .ThenInclude(x => x.OrderServiceDetails)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.LossAndDamages)
                .Include(x => x.Invoices)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                bookingQuery = bookingQuery.Where(x =>
                    x.BookingCode.Contains(term) ||
                    (x.GuestName != null && x.GuestName.Contains(term)) ||
                    (x.User != null && x.User.FullName.Contains(term)) ||
                    x.BookingDetails.Any(d => d.Room != null && d.Room.RoomNumber.Contains(term)));
            }

            if (fromDate.HasValue)
            {
                var from = fromDate.Value.Date;
                bookingQuery = bookingQuery.Where(x => x.CreatedAt >= from);
            }

            if (toDate.HasValue)
            {
                var toExclusive = toDate.Value.Date.AddDays(1);
                bookingQuery = bookingQuery.Where(x => x.CreatedAt < toExclusive);
            }

            var bookings = await bookingQuery
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);

            foreach (var booking in bookings)
            {
                if (Normalize(booking.Status) is "CANCELLED" or "COMPLETED")
                {
                    continue;
                }

                var customerName = booking.GuestName
                                   ?? booking.User?.FullName
                                   ?? "Khách lẻ";

                var wholeBookingSubtotal = Money(booking.BookingDetails.Select(BuildDetailChargeSummary).Sum(x => x.Subtotal));
                var wholeBookingRoomTotal = Money(booking.BookingDetails.Sum(CalculateRoomLineAmount));
                var bookingDiscountAmount = CalculateBookingDiscountAmount(booking, wholeBookingSubtotal);

                var previewableDetails = booking.BookingDetails
                    .Where(ShouldShowInvoicePreviewRow)
                    .OrderBy(bd => bd.Id)
                    .ToList();

                foreach (var detail in previewableDetails)
                {
                    var summary = BuildDetailChargeSummary(detail);
                    var detailSubtotal = Money(summary.Subtotal);
                    var discountShare = wholeBookingSubtotal > 0
                        ? Money(bookingDiscountAmount * (detailSubtotal / wholeBookingSubtotal))
                        : 0m;
                    var grossTotal = Money(Math.Max(0, detailSubtotal - discountShare));
                    var depositShare = wholeBookingRoomTotal > 0
                        ? Money(booking.DepositAmount * (summary.RoomCharge / wholeBookingRoomTotal))
                        : Money(Math.Max(0, booking.DepositAmount));
                    var amountDue = Money(Math.Max(0, grossTotal - depositShare));

                    results.Add(new InvoiceListDto
                    {
                        RowId = $"draft-{booking.Id}-{detail.Id}",
                        Id = 0,
                        InvoiceId = null,
                        BookingId = booking.Id,
                        BookingDetailId = detail.Id,
                        InvoiceCode = IsCheckedOut(detail) ? "(Dự thảo)" : "(Tạm tính)",
                        CustomerName = customerName,
                        BookingCode = booking.BookingCode,
                        RoomNumber = detail.Room?.RoomNumber ?? "-",
                        FinalTotal = amountDue,
                        Status = "UNPAID",
                        CreatedAt = detail.ActualCheckInAt ?? detail.CreatedAt,
                        IsDraftPreview = true
                    });
                }
            }
        }

        return results
            .OrderByDescending(x => x.CreatedAt ?? DateTime.MinValue)
            .ToList();
    }

    public async Task<DraftInvoiceDto> GetDraftInvoiceAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        var booking = await _dbContext.Bookings
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Voucher)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.OrderServices)
                    .ThenInclude(x => x.OrderServiceDetails)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.LossAndDamages)
            .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);

        if (booking is null)
        {
            throw new KeyNotFoundException($"Không tìm thấy booking id = {bookingId}.");
        }

        var summaries = booking.BookingDetails
            .OrderBy(x => x.Id)
            .Select(BuildDetailChargeSummary)
            .ToList();

        var totalRoom = Money(summaries.Sum(x => x.RoomCharge));
        var totalService = Money(summaries.Sum(x => x.ServiceCharge));
        var totalDamage = Money(summaries.Sum(x => x.DamageCharge));
        var subTotal = Money(summaries.Sum(x => x.Subtotal));

        var discountAmount = CalculateBookingDiscountAmount(booking, subTotal);

        var grossTotal = Money(Math.Max(0, subTotal - discountAmount));
        var depositAmount = Money(Math.Max(0, booking.DepositAmount));

        return new DraftInvoiceDto
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            CustomerName = booking.GuestName
                           ?? booking.User?.FullName
                           ?? "Khách lẻ",
            TotalRoomAmount = totalRoom,
            TotalServiceAmount = totalService,
            TotalDamageAmount = totalDamage,
            SubTotal = subTotal,
            DiscountAmount = discountAmount,
            GrossTotal = grossTotal,
            DepositAmount = depositAmount,
            FinalTotal = Money(Math.Max(0, grossTotal - depositAmount))
        };
    }

    public async Task<bool> ConfirmPaymentAsync(
        CreateInvoiceDto dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.BookingId <= 0)
        {
            return false;
        }

        var booking = await LoadBookingGraphAsync(dto.BookingId, cancellationToken);
        if (booking is null)
        {
            return false;
        }

        var openInvoice = booking.Invoices
            .Where(x => !IsClosedInvoice(x.Status) && x.InvoiceBookingDetails.Count > 0)
            .OrderByDescending(x => x.Id)
            .FirstOrDefault();

        var invoiceId = openInvoice?.Id ?? 0;

        if (invoiceId == 0)
        {
            var eligibleResult = await GetEligibleBookingDetailsAsync(dto.BookingId, cancellationToken);
            if (!eligibleResult.Success)
            {
                return false;
            }

            var bookingDetailIds = eligibleResult.Data?
                .Where(x => x.CanCreateInvoice)
                .Select(x => x.BookingDetailId)
                .Distinct()
                .ToList() ?? new List<int>();

            if (bookingDetailIds.Count == 0)
            {
                return false;
            }

            var createResult = await CreateDraftAsync(
                new CreateDraftInvoiceRequestDto
                {
                    BookingId = dto.BookingId,
                    BookingDetailIds = bookingDetailIds,
                    Note = string.IsNullOrWhiteSpace(dto.Notes)
                        ? "Tạo draft từ màn hình dashboard hóa đơn"
                        : dto.Notes
                },
                null,
                cancellationToken);

            if (!createResult.Success || createResult.Data is null)
            {
                return false;
            }

            invoiceId = createResult.Data.InvoiceId;
        }

        var finalizeResult = await FinalizeAsync(
            invoiceId,
            new FinalizeInvoiceRequestDto
            {
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "CASH" : dto.PaymentMethod,
                Note = dto.Notes
            },
            null,
            cancellationToken);

        return finalizeResult.Success;
    }

    public async Task<object> GetInvoiceSummaryAsync(CancellationToken cancellationToken = default)
    {
        var invoices = await _dbContext.Invoices
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var paidInvoices = invoices
            .Where(x => Normalize(x.Status) == "PAID")
            .ToList();

        var today = DateTime.Today;

        var activeBookings = await _dbContext.Bookings
            .AsNoTracking()
            .CountAsync(x => x.Status == "Confirmed"
                             || x.Status == "CheckedIn"
                             || x.Status == "Checked_in"
                             || x.Status == "Partially_checked_out",
                        cancellationToken);

        return new
        {
            TotalRevenueAllTime = Money(paidInvoices.Sum(x => x.FinalTotal ?? 0m)),
            TodayRevenue = Money(paidInvoices
                .Where(x => (x.PaidAt ?? x.CreatedAt ?? DateTime.MinValue).Date == today)
                .Sum(x => x.FinalTotal ?? 0m)),
            TotalInvoices = invoices.Count,
            PaidInvoices = paidInvoices.Count,
            ActiveBookings = activeBookings
        };
    }

    private async Task<Booking?> LoadBookingGraphAsync(int bookingId, CancellationToken cancellationToken)
    {
        return await _dbContext.Bookings
            .Include(x => x.User)
            .Include(x => x.Voucher)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.Room)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.RoomType)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.OrderServices)
                    .ThenInclude(x => x.OrderServiceDetails)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.LossAndDamages)
            .Include(x => x.BookingDetails)
                .ThenInclude(x => x.InvoiceBookingDetails)
                    .ThenInclude(x => x.Invoice)
            .Include(x => x.Invoices)
                .ThenInclude(x => x.Payments)
            .Include(x => x.Invoices)
                .ThenInclude(x => x.InvoiceBookingDetails)
                    .ThenInclude(x => x.BookingDetail)
                        .ThenInclude(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);
    }

    private async Task<Invoice?> LoadInvoiceGraphAsync(int invoiceId, CancellationToken cancellationToken)
    {
        return await _dbContext.Invoices
            .Include(x => x.Payments)
            .Include(x => x.InvoiceBookingDetails)
                .ThenInclude(x => x.BookingDetail)
                    .ThenInclude(x => x.Room)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.Voucher)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.BookingDetails)
                    .ThenInclude(x => x.Room)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.BookingDetails)
                    .ThenInclude(x => x.RoomType)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.BookingDetails)
                    .ThenInclude(x => x.OrderServices)
                        .ThenInclude(x => x.OrderServiceDetails)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.BookingDetails)
                    .ThenInclude(x => x.LossAndDamages)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.User)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.BookingDetails)
                    .ThenInclude(x => x.InvoiceBookingDetails)
                        .ThenInclude(x => x.Invoice)
            .Include(x => x.Booking)
                .ThenInclude(x => x!.Invoices)
                    .ThenInclude(x => x.InvoiceBookingDetails)
                        .ThenInclude(x => x.BookingDetail)
                            .ThenInclude(x => x.Room)
            .FirstOrDefaultAsync(x => x.Id == invoiceId, cancellationToken);
    }

    private async Task RefreshOpenInvoicesAsync(CancellationToken cancellationToken)
    {
        var invoiceStatuses = await _dbContext.Invoices
            .Select(x => new { x.Id, x.Status })
            .ToListAsync(cancellationToken);

        var openInvoiceIds = invoiceStatuses
            .Where(x => !IsClosedInvoice(x.Status))
            .Select(x => x.Id)
            .ToList();

        if (openInvoiceIds.Count == 0)
        {
            return;
        }

        foreach (var openInvoiceId in openInvoiceIds)
        {
            var invoice = await LoadInvoiceGraphAsync(openInvoiceId, cancellationToken);
            if (invoice is null || invoice.Booking is null)
            {
                continue;
            }

            RecalculateInvoice(invoice.Booking, invoice);
            invoice.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static bool IsInHouseDetail(BookingDetail detail)
    {
        var normalizedStatus = Normalize(detail.Status);
        return (detail.ActualCheckInAt.HasValue && !detail.ActualCheckOutAt.HasValue)
               || normalizedStatus is "CHECKEDIN" or "CHECKED_IN" or "PARTIALLY_CHECKED_OUT";
    }

    private static bool ShouldShowInvoicePreviewRow(BookingDetail detail)
    {
        var hasOpenInvoice = detail.InvoiceBookingDetails?.Any(x => !IsClosedInvoice(x.Invoice?.Status)) ?? false;
        var isUnpaid = Normalize(detail.SettlementStatus) != "PAID";

        return isUnpaid
               && !hasOpenInvoice
               && (IsCheckedOut(detail) || IsInHouseDetail(detail));
    }

    private static decimal CalculateBookingDiscountAmount(Booking booking, decimal subtotal)
    {
        var discountAmount = Money(booking.DiscountAmount);
        if (discountAmount > 0)
        {
            return discountAmount;
        }

        if (booking.Voucher is null || subtotal <= 0)
        {
            return 0;
        }

        var voucherMin = booking.Voucher.MinBookingValue > 0
            ? booking.Voucher.MinBookingValue
            : booking.Voucher.MinBookingAmount;

        if (subtotal < voucherMin)
        {
            return 0;
        }

        return Normalize(booking.Voucher.DiscountType) == "PERCENT"
            ? Money(subtotal * (booking.Voucher.DiscountValue / 100m))
            : Money(booking.Voucher.DiscountValue);
    }

    private void RecalculateInvoice(Booking booking, Invoice invoice)
    {
        var selectedDetails = GetSelectedDetails(booking, invoice);
        var summaries = selectedDetails
            .Select(BuildDetailChargeSummary)
            .ToList();

        var roomTotal = Money(summaries.Sum(x => x.RoomCharge));
        var serviceTotal = Money(summaries.Sum(x => x.ServiceCharge));
        var actualDamageTotal = Money(summaries.Sum(x => x.DamageCharge));
        var overrideDamageTotal = ExtractDamageOverrideAmount(invoice.Notes);
        var effectiveDamageTotal = Money(Math.Max(0, overrideDamageTotal ?? actualDamageTotal));
        var effectiveDamageLines = BuildEffectiveDamageLineAmounts(summaries, overrideDamageTotal);
        var selectedSubtotal = Money(roomTotal + serviceTotal + effectiveDamageTotal);

        var wholeBookingBase = Money(
            booking.BookingDetails
                .Select(BuildDetailChargeSummary)
                .Sum(x => x.Subtotal));

        var discountShare = 0m;
        if (wholeBookingBase > 0 && booking.DiscountAmount > 0 && selectedSubtotal > 0)
        {
            discountShare = Money(booking.DiscountAmount * (selectedSubtotal / wholeBookingBase));
        }

        var manualAdjustment = Money(Math.Max(0m, invoice.ManualAdjustmentAmount ?? 0m));
        var refundAmount = Money(Math.Max(0m, invoice.RefundAmount ?? 0m));

        var taxableBase = Money(Math.Max(0, selectedSubtotal + manualAdjustment - discountShare));
        var taxAmount = Money(taxableBase * VatRate);
        var grossTotal = Money(Math.Max(0, taxableBase + taxAmount - refundAmount));

        invoice.TotalRoomAmount = roomTotal;
        invoice.TotalServiceAmount = serviceTotal;
        invoice.TotalDamageAmount = effectiveDamageTotal;
        invoice.DiscountAmount = discountShare;
        invoice.ManualAdjustmentAmount = manualAdjustment;
        invoice.TaxAmount = taxAmount;
        invoice.FinalTotal = grossTotal;

        ApplyLineBreakdown(invoice, summaries, effectiveDamageLines, discountShare, manualAdjustment, taxAmount);
    }

    private void ApplyLineBreakdown(
        Invoice invoice,
        List<DetailChargeSummary> summaries,
        IReadOnlyList<decimal> effectiveDamageLines,
        decimal discountShare,
        decimal manualAdjustment,
        decimal taxAmount)
    {
        if (invoice.InvoiceBookingDetails.Count == 0 || summaries.Count == 0)
        {
            return;
        }

        var lineSubtotals = summaries
            .Select((x, index) => Money(x.RoomCharge + x.ServiceCharge + effectiveDamageLines[index]))
            .ToList();

        var discountDistribution = DistributeAmount(discountShare, lineSubtotals);
        var extraFeeDistribution = DistributeAmount(manualAdjustment, lineSubtotals);
        var taxDistribution = DistributeAmount(taxAmount, lineSubtotals);

        for (var i = 0; i < summaries.Count; i++)
        {
            var summary = summaries[i];
            var line = invoice.InvoiceBookingDetails.First(x => x.BookingDetailId == summary.Detail.Id);

            line.RoomCharge = Money(summary.RoomCharge);
            line.ServiceCharge = Money(summary.ServiceCharge);
            line.DamageCharge = Money(effectiveDamageLines[i]);
            line.DiscountAmount = Money(discountDistribution[i]);
            line.ExtraFeeAmount = Money(extraFeeDistribution[i]);
            line.TaxAmount = Money(taxDistribution[i]);
            line.LineTotal = Money(
                lineSubtotals[i]
                - line.DiscountAmount
                + line.ExtraFeeAmount
                + line.TaxAmount);
        }
    }

    private static List<decimal> DistributeAmount(decimal total, IReadOnlyList<decimal> weights)
    {
        if (weights.Count == 0)
        {
            return new List<decimal>();
        }

        var result = Enumerable.Repeat(0m, weights.Count).ToList();
        total = Money(total);

        if (total == 0)
        {
            return result;
        }

        var safeWeights = weights.Select(x => Math.Max(0, x)).ToList();
        var weightSum = safeWeights.Sum();

        if (weightSum <= 0)
        {
            var even = Money(total / weights.Count);
            for (var i = 0; i < weights.Count - 1; i++)
            {
                result[i] = even;
            }

            result[^1] = Money(total - result.Take(weights.Count - 1).Sum());
            return result;
        }

        decimal assigned = 0;
        for (var i = 0; i < weights.Count - 1; i++)
        {
            result[i] = Money(total * safeWeights[i] / weightSum);
            assigned += result[i];
        }

        result[^1] = Money(total - assigned);
        return result;
    }

    private List<BookingDetail> GetSelectedDetails(Booking booking, Invoice invoice)
    {
        var selectedIds = invoice.InvoiceBookingDetails
            .Select(x => x.BookingDetailId)
            .Distinct()
            .ToHashSet();

        return booking.BookingDetails
            .Where(x => selectedIds.Contains(x.Id))
            .OrderBy(x => x.Id)
            .ToList();
    }

    private DetailChargeSummary BuildDetailChargeSummary(BookingDetail detail)
    {
        var roomCharge = CalculateRoomLineAmount(detail);

        var serviceCharge = Money(
            detail.OrderServices
                .Where(x => Normalize(x.Status) != "CANCELLED")
                .Sum(CalculateOrderServiceAmount));

        var damageCharge = Money(
            detail.LossAndDamages
                .Where(x => IsChargeableDamage(x.Status))
                .Sum(x => x.PenaltyAmount));

        return new DetailChargeSummary
        {
            Detail = detail,
            RoomCharge = roomCharge,
            ServiceCharge = serviceCharge,
            DamageCharge = damageCharge
        };
    }

    private void UpdateBookingAggregateStatus(Booking booking, DateTime now)
    {
        var allPaid = booking.BookingDetails.Count > 0 &&
                      booking.BookingDetails.All(x => Normalize(x.SettlementStatus) == "PAID");

        var anyPaid = booking.BookingDetails.Any(x => Normalize(x.SettlementStatus) == "PAID");
        var allCheckedOut = booking.BookingDetails.Count > 0 &&
                            booking.BookingDetails.All(IsCheckedOut);
        var anyCheckedOut = booking.BookingDetails.Any(IsCheckedOut);

        booking.PaymentStatus = allPaid
            ? "PAID"
            : anyPaid
                ? "PARTIALLY_PAID"
                : "UNPAID";

        if (allPaid && allCheckedOut)
        {
            booking.Status = "Completed";
        }
        else if (anyCheckedOut)
        {
            booking.Status = "Partially_checked_out";
        }

        booking.FinalAmount = Money(
            booking.Invoices
                .Where(x => Normalize(x.Status) == "PAID")
                .Sum(x => x.FinalTotal ?? 0m));

        booking.UpdatedAt = now;
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
            existing.AmountPaid = CalculateAmountDue(invoice.Booking, invoice);
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
            AmountPaid = CalculateAmountDue(invoice.Booking, invoice),
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

        var detailIds = invoice.InvoiceBookingDetails
            .Select(x => x.BookingDetailId)
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        var roomNumbers = invoice.InvoiceBookingDetails
            .Select(x => x.BookingDetail?.Room?.RoomNumber ?? $"Detail#{x.BookingDetailId}")
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        var depositAmount = CalculateDepositApplied(booking, invoice);
        var grossTotal = Money(invoice.FinalTotal ?? 0m);
        var amountDue = Money(Math.Max(0, grossTotal - depositAmount));

        return new InvoiceActionResponseDto
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            CustomerName = booking.GuestName
                           ?? booking.User?.FullName
                           ?? "Khách lẻ",
            InvoiceId = invoice.Id,
            InvoiceCode = invoice.InvoiceCode ?? string.Empty,
            InvoiceStatus = invoice.Status ?? string.Empty,
            BookingStatus = booking.Status,
            PaymentStatus = booking.PaymentStatus,
            BookingDetailIds = detailIds,
            RoomNumbers = roomNumbers,
            TotalRoomAmount = invoice.TotalRoomAmount ?? 0m,
            TotalServiceAmount = invoice.TotalServiceAmount ?? 0m,
            TotalDamageAmount = invoice.TotalDamageAmount ?? 0m,
            ManualAdjustmentAmount = invoice.ManualAdjustmentAmount ?? 0m,
            DiscountAmount = invoice.DiscountAmount ?? 0m,
            TaxAmount = invoice.TaxAmount ?? 0m,
            GrossTotal = grossTotal,
            DepositAmount = depositAmount,
            FinalTotal = amountDue,
            Notes = SanitizeInvoiceNotes(invoice.Notes),
            IssuedAt = invoice.IssuedAt,
            PaidAt = invoice.PaidAt,
            UpdatedAt = invoice.UpdatedAt,
            PaymentId = latestPayment?.Id,
            PaymentMethod = latestPayment?.PaymentMethod,
            TransactionCode = latestPayment?.TransactionCode
        };
    }

    private decimal CalculateDepositApplied(Booking? booking, Invoice invoice)
    {
        if (booking is null || booking.DepositAmount <= 0)
        {
            return 0;
        }

        var selectedDetails = GetSelectedDetails(booking, invoice);
        var selectedRoomTotal = Money(selectedDetails.Sum(CalculateRoomLineAmount));
        var wholeBookingRoomTotal = Money(booking.BookingDetails.Sum(CalculateRoomLineAmount));

        if (wholeBookingRoomTotal <= 0 || selectedRoomTotal <= 0)
        {
            return Money(Math.Max(0, booking.DepositAmount));
        }

        var applied = booking.DepositAmount * (selectedRoomTotal / wholeBookingRoomTotal);
        return Money(Math.Min(Math.Max(0, booking.DepositAmount), applied));
    }

    private decimal CalculateAmountDue(Booking? booking, Invoice invoice)
    {
        var grossTotal = Money(invoice.FinalTotal ?? 0m);
        var depositAmount = CalculateDepositApplied(booking, invoice);
        return Money(Math.Max(0, grossTotal - depositAmount));
    }

    private static IReadOnlyList<decimal> BuildEffectiveDamageLineAmounts(
        IReadOnlyList<DetailChargeSummary> summaries,
        decimal? overrideDamageTotal)
    {
        if (summaries.Count == 0)
        {
            return Array.Empty<decimal>();
        }

        if (!overrideDamageTotal.HasValue)
        {
            return summaries
                .Select(x => Money(Math.Max(0, x.DamageCharge)))
                .ToList();
        }

        var overrideAmount = Money(Math.Max(0, overrideDamageTotal.Value));
        var weights = summaries
            .Select(x => x.DamageCharge > 0 ? x.DamageCharge : x.Subtotal > 0 ? x.Subtotal : 1m)
            .ToList();

        return DistributeAmount(overrideAmount, weights);
    }

    private static decimal? ExtractDamageOverrideAmount(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
        {
            return null;
        }

        var match = Regex.Match(notes, Regex.Escape(DamageOverrideTokenPrefix) + @"(?<amount>\d+(?:\.\d+)?)\]\]");
        if (!match.Success)
        {
            return null;
        }

        if (!decimal.TryParse(match.Groups["amount"].Value, out var amount))
        {
            return null;
        }

        return Money(amount);
    }

    private static string UpsertDamageOverrideAmount(string? notes, decimal amount)
    {
        var token = $"{DamageOverrideTokenPrefix}{Money(Math.Max(0, amount)):0.##}]]";
        var sanitized = SanitizeInvoiceNotes(notes);
        return string.IsNullOrWhiteSpace(sanitized)
            ? token
            : token + Environment.NewLine + sanitized.Trim();
    }

    private static string? SanitizeInvoiceNotes(string? notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
        {
            return notes;
        }

        var cleaned = Regex.Replace(
            notes,
            Regex.Escape(DamageOverrideTokenPrefix) + @"\d+(?:\.\d+)?\]\]\s*",
            string.Empty,
            RegexOptions.Multiline);

        cleaned = Regex.Replace(cleaned, @"(\r?\n){3,}", Environment.NewLine + Environment.NewLine);
        cleaned = cleaned.Trim();

        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }

    private async Task AddAuditLog(
        int? userId,
        string action,
        string tableName,
        int recordId,
        object? oldValue,
        object? newValue,
        string? reason)
    {
        var (resolvedUserId, resolvedRole) = ResolveUser();
        await _dbContext.AddAuditLogAsync(
            userId: userId ?? resolvedUserId,
            roleName: resolvedRole,
            actionType: action,
            entityType: tableName,
            message: reason ?? "No reason provided",
            contextParams: new { recordId },
            changes: new { oldData = oldValue, newData = newValue }
        );
    }

    private (int UserId, string RoleName) ResolveUser()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userIdClaim = user?.FindFirst("UserId")?.Value ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int uid = int.TryParse(userIdClaim, out int id) ? id : 0;
        var roleName = user?.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        return (uid, roleName);
    }

    private static string BuildInvoiceCode(string bookingCode, int sequence)
    {
        return $"INV-{bookingCode}-{sequence:00}".Trim().ToUpperInvariant();
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

    private static bool IsCheckedOut(BookingDetail detail)
    {
        return detail.ActualCheckOutAt.HasValue
               || Normalize(detail.Status) is "CHECKED_OUT" or "COMPLETED";
    }

    private static string AppendAuditText(string? current, string newLine)
    {
        var prefix = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] ";
        var tokenMatch = Regex.Match(
            current ?? string.Empty,
            Regex.Escape(DamageOverrideTokenPrefix) + @"\d+(?:\.\d+)?\]\]");

        var systemToken = tokenMatch.Success ? tokenMatch.Value : null;
        var visibleNotes = SanitizeInvoiceNotes(current);
        var appended = string.IsNullOrWhiteSpace(visibleNotes)
            ? prefix + newLine.Trim()
            : visibleNotes.Trim() + Environment.NewLine + prefix + newLine.Trim();

        return string.IsNullOrWhiteSpace(systemToken)
            ? appended
            : systemToken + Environment.NewLine + appended;
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
}
