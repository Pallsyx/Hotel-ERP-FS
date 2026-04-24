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
using HotelERP.BE.Services;
using HotelERP.BE.DTOs.Notifications;
using HotelERP.BE.Models.Enums;
using HotelERP.BE.Models;
using HotelERP.BE.Helpers.AuditLogs;
using Hangfire;

namespace HotelERP.BE.Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private const decimal VatRate = 0.10m;
        private const string DamageOverrideTokenPrefix = "[[DAMAGE_OVERRIDE:";

        private readonly HotelDbContext _dbContext;
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly Hangfire.IBackgroundJobClient _backgroundJobClient;
        private readonly IEmailService _emailService;

        public InvoiceService(
            HotelDbContext dbContext, Hangfire.IBackgroundJobClient backgroundJobClient, IEmailService emailService, 
            INotificationService notificationService,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
            _backgroundJobClient = backgroundJobClient;
            _emailService = emailService;
        }

        private sealed class DetailChargeSummary
        {
            public BookingDetail Detail { get; set; } = null!;
            public decimal RoomCharge { get; set; }
            public decimal ServiceCharge { get; set; }
            public decimal DamageCharge { get; set; }
            public decimal Subtotal => RoomCharge + ServiceCharge + DamageCharge;
        }

        private sealed class BookingSelectionPreview
        {
            public List<int> BookingDetailIds { get; set; } = new();
            public List<string> RoomNumbers { get; set; } = new();
            public decimal TotalRoomAmount { get; set; }
            public decimal TotalServiceAmount { get; set; }
            public decimal TotalDamageAmount { get; set; }
            public decimal SubTotal { get; set; }
            public decimal DiscountAmount { get; set; }
            public decimal TaxAmount { get; set; }
            public decimal GrossTotal { get; set; }
            public decimal DepositAmount { get; set; }
            public decimal FinalTotal { get; set; }
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
                    var openInvoiceLink = detail.InvoiceBookingDetails
                        .Where(x => !IsClosedInvoice(x.Invoice?.Status))
                        .OrderByDescending(x => x.InvoiceId)
                        .FirstOrDefault();
                    var hasOpenInvoice = openInvoiceLink is not null;

                    var canCreateInvoice = true;
                    string? blockReason = null;

                    if (!CanStartInvoice(detail))
                    {
                        canCreateInvoice = false;
                        blockReason = "Phòng này chưa trả phòng/checkout.";
                    }
                    else if (Normalize(detail.SettlementStatus) == "PAID")
                    {
                        canCreateInvoice = false;
                        blockReason = "Phòng này đã thanh toán.";
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
                        BlockReason = blockReason,
                        OpenInvoiceId = openInvoiceLink?.InvoiceId,
                        OpenInvoiceCode = openInvoiceLink?.Invoice?.InvoiceCode
                    };
                }).ToList();

            return ApiResult<List<EligibleBookingDetailResponseDto>>.Ok(
                result,
                "Lấy danh sách phòng trong booking thành công.",
                "GET_ELIGIBLE_BOOKING_DETAILS_SUCCESS");
        }

        public async Task<ApiResult<InvoiceActionResponseDto>> CreateDraftAsync(
            CreateDraftInvoiceRequestDto request,
            int? performedByUserId,
            string? performedByRole = null,
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

            var notReadyForInvoice = selectedDetails.Where(x => !CanStartInvoice(x)).Select(x => x.Id).ToList();
            if (notReadyForInvoice.Count > 0)
            {
                return ApiResult<InvoiceActionResponseDto>.Fail(
                    StatusCodes.Status409Conflict,
                    "BOOKING_DETAILS_NOT_READY_FOR_INVOICE",
                    "Chỉ được lập hóa đơn cho phòng đã trả phòng/checkout.",
                    new { bookingDetailIds = notReadyForInvoice });
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

            var incomingIds = detailIds.OrderBy(x => x).ToList();
            var now = DateTime.UtcNow;

            var exactDraft = booking.Invoices
                .Where(x => !IsClosedInvoice(x.Status) && x.InvoiceBookingDetails.Count > 0)
                .FirstOrDefault(x => x.InvoiceBookingDetails
                    .Select(y => y.BookingDetailId)
                    .OrderBy(y => y)
                    .SequenceEqual(incomingIds));

            if (exactDraft is not null)
            {
                var existingResponse = MapResponse(booking, exactDraft);
                return ApiResult<InvoiceActionResponseDto>.Ok(
                    existingResponse,
                    "Nhóm phòng này đã có invoice nháp, trả lại invoice hiện tại.",
                    "DRAFT_INVOICE_ALREADY_EXISTS");
            }

            var overlappingDrafts = booking.Invoices
                .Where(x => !IsClosedInvoice(x.Status))
                .Where(x => x.InvoiceBookingDetails.Any(y => incomingIds.Contains(y.BookingDetailId)))
                .ToList();

            foreach (var draft in overlappingDrafts)
            {
                var linksToDetach = draft.InvoiceBookingDetails
                    .Where(x => incomingIds.Contains(x.BookingDetailId))
                    .ToList();

                if (linksToDetach.Count == 0) continue;

                foreach (var link in linksToDetach)
                {
                    draft.InvoiceBookingDetails.Remove(link);
                }

                _dbContext.RemoveRange(linksToDetach);
                draft.UpdatedAt = now;

                if (draft.InvoiceBookingDetails.Count == 0)
                {
                    draft.Status = "Cancelled";
                    draft.TotalRoomAmount = 0;
                    draft.TotalServiceAmount = 0;
                    draft.TotalDamageAmount = 0;
                    draft.DiscountAmount = 0;
                    draft.ManualAdjustmentAmount = 0;
                    draft.TaxAmount = 0;
                    draft.FinalTotal = 0;
                    draft.RefundAmount = 0;
                    draft.Notes = AppendAuditText(
                        draft.Notes,
                        $"Hủy draft vì các phòng [{string.Join(", ", incomingIds)}] được tách sang invoice nháp mới.");
                }
                else
                {
                    RecalculateInvoice(booking, draft);
                    draft.Notes = AppendAuditText(
                        draft.Notes,
                        $"Tách các phòng [{string.Join(", ", incomingIds)}] sang invoice nháp mới.");
                }
            }

            if (overlappingDrafts.Count > 0)
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            var sequence = booking.Invoices.Count + 1;

            var invoice = new Invoice
            {
                BookingId = booking.Id,
                InvoiceCode = BuildInvoiceCode(booking.BookingCode, sequence),
                Status = "Draft",
                Notes = string.IsNullOrWhiteSpace(request.Note)
                    ? "Invoice nháp tạo tự động"
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
                performedByRole,
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
            string? performedByRole = null,
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
                performedByRole,
                "ADD_EXTRA_FEE_INVOICE",
                "Invoices",
                invoice.Id,
                before,
                after,
                request.Reason);

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Gửi Notification
            var extraFeeMsg = new NotificationMessage
            {
                Title = "Phụ phí mới",
                Content = $"Hóa đơn #{invoice.InvoiceCode} nhận thêm phụ phí: {request.Amount:N0}đ.",
                Type = "Info",
                Action = NotificationAction.AddExtraFee
            };
            var dbNotif = new Notification
            {
                Title = extraFeeMsg.Title,
                Content = extraFeeMsg.Content,
                Type = extraFeeMsg.Type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(dbNotif);
            await _dbContext.SaveChangesAsync(cancellationToken);
            
            extraFeeMsg.Id = dbNotif.Id;
            await _notificationService.SendToRoleAsync("Admin", extraFeeMsg);

            return ApiResult<InvoiceActionResponseDto>.Ok(
                after,
                "Thêm phụ phí thành công.",
                "ADD_EXTRA_FEE_SUCCESS");
        }

        public async Task<ApiResult<InvoiceActionResponseDto>> SetDamageChargeAsync(
            int invoiceId,
            UpdateDamageChargeRequestDto request,
            int? performedByUserId,
            string? performedByRole = null,
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
                performedByRole,
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
            string? performedByRole = null,
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
                performedByRole,
                "FINALIZE_INVOICE_PARTIAL",
                "Invoices",
                invoice.Id,
                before,
                after,
                request.Note);

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Gửi Notification
            var payMsg = new NotificationMessage
            {
                Title = "Thanh toán thành công",
                Content = $"Hóa đơn #{invoice.InvoiceCode} đã được thanh toán: {invoice.FinalTotal:N0}đ.",
                Type = "Success",
                Action = NotificationAction.ConfirmPayment
            };
            var dbNotif = new Notification
            {
                Title = payMsg.Title,
                Content = payMsg.Content,
                Type = payMsg.Type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(dbNotif);
            await _dbContext.SaveChangesAsync(cancellationToken);
            
            payMsg.Id = dbNotif.Id; 
            await _notificationService.SendToRoleAsync("Admin", payMsg);

        var customerEmail = booking.GuestEmail ?? booking.User?.Email;
        if (!string.IsNullOrWhiteSpace(customerEmail))
        {
            _backgroundJobClient.Enqueue(() => SendInvoiceEmailJobAsync(invoice.Id, customerEmail));
        }

            return ApiResult<InvoiceActionResponseDto>.Ok(
                after,
                "Chốt và xuất hóa đơn thành công.",
                "FINALIZE_INVOICE_SUCCESS");
        }

    public async Task SendInvoiceEmailJobAsync(int invoiceId, string email)
    {
        var invoice = await _dbContext.Invoices
            .AsNoTracking()
            .Include(x => x.Booking)
            .FirstOrDefaultAsync(x => x.Id == invoiceId);

        if (invoice == null || invoice.Booking == null) return;

        string subject = $"[Hotel ERP] Hóa đơn thanh toán #{invoice.InvoiceCode}";
        string customerName = invoice.Booking.GuestName ?? "Quý khách";
        string htmlMessage = $@"
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <h2 style='color: #4CAF50;'>Cảm ơn quý khách đã sử dụng dịch vụ!</h2>
                <p>Kính gửi <strong>{customerName}</strong>,</p>
                <p>Hệ thống xin gửi đến quý khách thông tin hóa đơn thanh toán cho mã đặt phòng <strong>{invoice.Booking.BookingCode}</strong>.</p>
                <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                    <tr style='background: #f4f4f4;'>
                        <td style='padding: 10px; border: 1px solid #ddd;'><strong>Mã hóa đơn:</strong></td>
                        <td style='padding: 10px; border: 1px solid #ddd;'>{invoice.InvoiceCode}</td>
                    </tr>
                    <tr>
                        <td style='padding: 10px; border: 1px solid #ddd;'><strong>Tổng tiền (đã bao gồm thuế/phí):</strong></td>
                        <td style='padding: 10px; border: 1px solid #ddd;'>{invoice.FinalTotal:N0} VND</td>
                    </tr>
                    <tr style='background: #f4f4f4;'>
                        <td style='padding: 10px; border: 1px solid #ddd;'><strong>Ngày xuất:</strong></td>
                        <td style='padding: 10px; border: 1px solid #ddd;'>{invoice.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? DateTime.Now.ToString("dd/MM/yyyy HH:mm")}</td>
                    </tr>
                </table>
                <p style='margin-top: 20px;'>Mọi thắc mắc xin vui lòng liên hệ lễ tân hoặc phản hồi qua email này.</p>
                <p>Trân trọng,<br><strong>Đội ngũ Hotel ERP</strong></p>
            </div>";

        await _emailService.SendEmailAsync(email, subject, htmlMessage);
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
            await RefreshOpenInvoicesAsync(cancellationToken);

            var bookingQuery = _dbContext.Bookings
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Voucher)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.Room)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.InvoiceBookingDetails)
                        .ThenInclude(x => x.Invoice)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.OrderServices)
                        .ThenInclude(x => x.OrderServiceDetails)
                .Include(x => x.BookingDetails)
                    .ThenInclude(x => x.LossAndDamages)
                .Include(x => x.Invoices)
                    .ThenInclude(x => x.InvoiceBookingDetails)
                        .ThenInclude(x => x.BookingDetail)
                            .ThenInclude(x => x.Room)
                .AsQueryable();

            if (bookingId.HasValue && bookingId.Value > 0)
            {
                bookingQuery = bookingQuery.Where(x => x.Id == bookingId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                bookingQuery = bookingQuery.Where(x =>
                    x.BookingCode.Contains(term) ||
                    x.Id.ToString().Contains(term) ||
                    (x.GuestName != null && x.GuestName.Contains(term)) ||
                    (x.User != null && x.User.FullName.Contains(term)) ||
                    x.BookingDetails.Any(d => d.Room != null && d.Room.RoomNumber.Contains(term)) ||
                    x.Invoices.Any(inv => inv.InvoiceCode != null && inv.InvoiceCode.Contains(term)));
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

            var normalizedStatus = Normalize(status);
            var rows = new List<InvoiceListDto>();

            foreach (var booking in bookings)
            {
                if (Normalize(booking.Status) == "CANCELLED") continue;

                var allRoomNumbers = booking.BookingDetails
                    .Select(x => x.Room?.RoomNumber)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct()
                    .OrderBy(x => x)
                    .Cast<string>()
                    .ToList();

                var latestOpenInvoice = booking.Invoices
                    .Where(x => !IsClosedInvoice(x.Status) && x.InvoiceBookingDetails.Count > 0)
                    .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt ?? DateTime.MinValue)
                    .ThenByDescending(x => x.Id)
                    .FirstOrDefault();

                var latestInvoice = booking.Invoices
                    .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt ?? DateTime.MinValue)
                    .ThenByDescending(x => x.Id)
                    .FirstOrDefault();

                var latestPaidInvoice = booking.Invoices
                    .Where(x => Normalize(x.Status) == "PAID")
                    .OrderByDescending(x => x.PaidAt ?? x.UpdatedAt ?? x.CreatedAt ?? DateTime.MinValue)
                    .ThenByDescending(x => x.Id)
                    .FirstOrDefault();

                var unpaidDetailIds = booking.BookingDetails
                    .Where(x => Normalize(x.SettlementStatus) != "PAID")
                    .Select(x => x.Id)
                    .ToList();

                var preview = unpaidDetailIds.Count > 0
                    ? BuildSelectionPreview(booking, unpaidDetailIds)
                    : null;

                var rowStatus = DetermineBookingListStatus(booking, latestOpenInvoice, unpaidDetailIds.Count > 0);
                if (!ShouldIncludeStatusFilter(normalizedStatus, rowStatus))
                {
                    continue;
                }

                var referenceInvoice = latestOpenInvoice ?? latestInvoice ?? latestPaidInvoice;
                var referenceAmount = preview?.FinalTotal
                    ?? (referenceInvoice is not null ? CalculateAmountDue(booking, referenceInvoice) : booking.FinalAmount);

                rows.Add(new InvoiceListDto
                {
                    RowId = $"booking-{booking.Id}",
                    Id = booking.Id,
                    InvoiceId = latestOpenInvoice?.Id ?? latestInvoice?.Id,
                    BookingId = booking.Id,
                    BookingDetailId = null,
                    InvoiceCode = latestOpenInvoice?.InvoiceCode
                        ?? latestPaidInvoice?.InvoiceCode
                        ?? (preview is not null ? "(Tạm tính)" : "-"),
                    CustomerName = booking.GuestName
                        ?? booking.User?.FullName
                        ?? "Khách lẻ",
                    BookingCode = booking.BookingCode,
                    RoomNumber = allRoomNumbers.Count == 0 ? "-" : string.Join(", ", allRoomNumbers),
                    FinalTotal = Money(referenceAmount),
                    Status = rowStatus,
                    BookingStatus = booking.Status,
                    PaymentStatus = booking.PaymentStatus,
                    CreatedAt = latestOpenInvoice?.CreatedAt
                        ?? latestPaidInvoice?.CreatedAt
                        ?? latestInvoice?.CreatedAt
                        ?? booking.CreatedAt,
                    IsDraftPreview = latestOpenInvoice is null && preview is not null
                });
            }

            return rows
                .OrderByDescending(x => x.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(x => x.BookingId)
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
                FinalTotal = Money(Math.Max(0, grossTotal - depositAmount)),
                VoucherId = booking.VoucherId,
                VoucherCode = booking.Voucher?.Code
            };
        }

        public async Task<bool> ConfirmPaymentAsync(
            CreateInvoiceDto dto,
            CancellationToken cancellationToken = default)
        {
            if (dto.BookingId <= 0) return false;

            var booking = await LoadBookingGraphAsync(dto.BookingId, cancellationToken);
            if (booking is null) return false;

            var openInvoice = booking.Invoices
                .Where(x => !IsClosedInvoice(x.Status) && x.InvoiceBookingDetails.Count > 0)
                .OrderByDescending(x => x.Id)
                .FirstOrDefault();

            var invoiceId = openInvoice?.Id ?? 0;

            if (invoiceId == 0)
            {
                var eligibleResult = await GetEligibleBookingDetailsAsync(dto.BookingId, cancellationToken);
                if (!eligibleResult.Success) return false;

                var bookingDetailIds = eligibleResult.Data?
                    .Where(x => x.CanCreateInvoice)
                    .Select(x => x.BookingDetailId)
                    .Distinct()
                    .ToList() ?? new List<int>();

                if (bookingDetailIds.Count == 0) return false;

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
                    null,
                    cancellationToken);

                if (!createResult.Success || createResult.Data is null) return false;

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
                    .ThenInclude(x => x!.BookingDetails)
                        .ThenInclude(x => x.RoomType)
                .Include(x => x.Booking)
                    .ThenInclude(x => x!.BookingDetails)
                        .ThenInclude(x => x.OrderServices)
                            .ThenInclude(x => x.OrderServiceDetails)
                .Include(x => x.Booking)
                    .ThenInclude(x => x!.BookingDetails)
                        .ThenInclude(x => x.LossAndDamages)
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

        private static bool CanStartInvoice(BookingDetail detail)
        {
            return IsCheckedOut(detail);
        }

        private static bool ShouldShowInvoicePreviewRow(BookingDetail detail)
        {
            var hasOpenInvoice = detail.InvoiceBookingDetails?.Any(x => !IsClosedInvoice(x.Invoice?.Status)) ?? false;
            var isUnpaid = Normalize(detail.SettlementStatus) != "PAID";

            return isUnpaid
                   && !hasOpenInvoice
                   && CanStartInvoice(detail);
        }

        private static decimal CalculateBookingDiscountAmount(Booking booking, decimal subtotal)
        {
            var discountAmount = Money(booking.DiscountAmount);
            if (discountAmount > 0) return discountAmount;

            if (booking.Voucher is null || subtotal <= 0) return 0;

            var voucherMin = booking.Voucher.MinBookingValue > 0
                ? booking.Voucher.MinBookingValue.Value
                : booking.Voucher.MinBookingAmount;

            if (subtotal < voucherMin) return 0;

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
            if (invoice.InvoiceBookingDetails.Count == 0 || summaries.Count == 0) return;

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
            if (weights.Count == 0) return new List<decimal>();

            var result = Enumerable.Repeat(0m, weights.Count).ToList();
            total = Money(total);

            if (total == 0) return result;

            var safeWeights = weights.Select(x => Math.Max(0, x)).ToList();
            var weightSum = safeWeights.Sum();

            if (weightSum <= 0)
            {
                var even = Money(total / weights.Count);
                for (var i = 0; i < weights.Count - 1; i++) result[i] = even;
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

        private BookingSelectionPreview BuildSelectionPreview(Booking booking, IReadOnlyCollection<int> detailIds)
        {
            var selectedDetails = booking.BookingDetails
                .Where(x => detailIds.Contains(x.Id))
                .OrderBy(x => x.Id)
                .ToList();

            var summaries = selectedDetails.Select(BuildDetailChargeSummary).ToList();

            var roomTotal = Money(summaries.Sum(x => x.RoomCharge));
            var serviceTotal = Money(summaries.Sum(x => x.ServiceCharge));
            var damageTotal = Money(summaries.Sum(x => x.DamageCharge));
            var subTotal = Money(summaries.Sum(x => x.Subtotal));

            var wholeBookingSubtotal = Money(booking.BookingDetails.Select(BuildDetailChargeSummary).Sum(x => x.Subtotal));
            var wholeBookingRoomTotal = Money(booking.BookingDetails.Sum(CalculateRoomLineAmount));
            var bookingDiscountAmount = CalculateBookingDiscountAmount(booking, wholeBookingSubtotal);

            var discountShare = wholeBookingSubtotal > 0
                ? Money(bookingDiscountAmount * (subTotal / wholeBookingSubtotal))
                : 0m;

            var taxableBase = Money(Math.Max(0, subTotal - discountShare));
            var taxAmount = Money(taxableBase * VatRate);
            var grossTotal = Money(Math.Max(0, taxableBase + taxAmount));
            var depositShare = wholeBookingRoomTotal > 0
                ? Money(booking.DepositAmount * (roomTotal / wholeBookingRoomTotal))
                : Money(Math.Max(0, booking.DepositAmount));
            var finalTotal = Money(Math.Max(0, grossTotal - depositShare));

            return new BookingSelectionPreview
            {
                BookingDetailIds = selectedDetails.Select(x => x.Id).ToList(),
                RoomNumbers = selectedDetails
                    .Select(x => x.Room?.RoomNumber ?? $"Detail#{x.Id}")
                    .Distinct()
                    .OrderBy(x => x)
                    .ToList(),
                TotalRoomAmount = roomTotal,
                TotalServiceAmount = serviceTotal,
                TotalDamageAmount = damageTotal,
                SubTotal = subTotal,
                DiscountAmount = discountShare,
                TaxAmount = taxAmount,
                GrossTotal = grossTotal,
                DepositAmount = depositShare,
                FinalTotal = finalTotal
            };
        }

        private static string DetermineBookingListStatus(Booking booking, Invoice? latestOpenInvoice, bool hasOutstandingDetails)
        {
            if (Normalize(booking.PaymentStatus) == "PAID") return "PAID";
            if (latestOpenInvoice is not null) return "DRAFT";
            if (Normalize(booking.PaymentStatus) == "PARTIALLY_PAID") return hasOutstandingDetails ? "PARTIALLY_PAID" : "PAID";

            return hasOutstandingDetails ? "UNPAID" : Normalize(booking.PaymentStatus);
        }

        private static bool ShouldIncludeStatusFilter(string normalizedStatus, string rowStatus)
        {
            if (string.IsNullOrWhiteSpace(normalizedStatus)) return true;
            if (normalizedStatus == "UNPAID") return rowStatus is "UNPAID" or "PARTIALLY_PAID";

            return rowStatus == normalizedStatus;
        }

        private static string? NormalizeVoucherCode(string? code)
        {
            return string.IsNullOrWhiteSpace(code) ? null : code.Trim().ToUpperInvariant();
        }

        private static decimal CalculateVoucherDiscountAmount(Voucher voucher, decimal subtotal)
        {
            if (subtotal <= 0) return 0;

            var rawDiscount = Normalize(voucher.DiscountType) == "PERCENT"
                ? subtotal * (voucher.DiscountValue / 100m)
                : voucher.DiscountValue;

            return Money(Math.Min(Math.Max(0, rawDiscount), subtotal));
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
                : anyPaid ? "PARTIALLY_PAID" : "UNPAID";

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
            if (detail.LineTotal > 0) return Money(detail.LineTotal);

            var nights = detail.Nights > 0
                ? detail.Nights
                : Math.Max(1, (detail.CheckOutDate.Date - detail.CheckInDate.Date).Days);

            var amount = (detail.PricePerNight * nights) + detail.EarlyCheckInFee + detail.LateCheckOutFee;
            return Money(amount);
        }

        private static decimal CalculateOrderServiceAmount(OrderService order)
        {
            if (order.TotalAmount > 0) return Money(order.TotalAmount);

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
                TransactionCode = latestPayment?.TransactionCode,
                VoucherId = booking.VoucherId,
                VoucherCode = booking.Voucher?.Code
            };
        }

        private decimal CalculateDepositApplied(Booking? booking, Invoice invoice)
        {
            if (booking is null || booking.DepositAmount <= 0) return 0;

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
            if (summaries.Count == 0) return Array.Empty<decimal>();

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
            if (string.IsNullOrWhiteSpace(notes)) return null;

            var match = Regex.Match(notes, Regex.Escape(DamageOverrideTokenPrefix) + @"(?<amount>\d+(?:\.\d+)?)\]\]");
            if (!match.Success) return null;

            if (!decimal.TryParse(match.Groups["amount"].Value, out var amount)) return null;

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
            if (string.IsNullOrWhiteSpace(notes)) return notes;

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
            string? roleName,
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
                roleName: roleName ?? resolvedRole,
                actionType: action,
                entityType: tableName,
                message: reason ?? "No reason provided",
                contextParams: new { recordId },
                changes: new { oldData = oldValue, newData = newValue }
            );
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

        private (int UserId, string RoleName) ResolveUser()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var userIdClaim = user?.FindFirst("UserId")?.Value ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int uid = int.TryParse(userIdClaim, out int id) ? id : 0;
            var roleName = user?.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            return (uid, roleName);
        }

        public Task<ApiResult<object>> ApplyVoucherToBookingAsync(int bookingId, ApplyInvoiceVoucherRequestDto request, int? performedByUserId, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task FinalizeAsync(int invoiceId, FinalizeInvoiceRequestDto request, int? userId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}