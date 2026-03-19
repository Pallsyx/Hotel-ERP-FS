using HotelERP.BE.Configurations;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Loyalty;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HotelERP.BE.Services.Loyalty;

public class LoyaltyPointService : ILoyaltyPointService
{
    private const string BookingPaidEarnAction = "BOOKING_PAID_EARN";
    private const string BookingPaidReason = "Cộng điểm sau khi booking thanh toán thành công";

    private const string PaidStatus = "PAID";
    private const string InvoicePaidStatus = "PAID";
    private const string MembershipActiveStatus = "ACTIVE";

    private const string AmountSourceFinalAmount = "FINAL_AMOUNT";
    private const string AmountSourceBookingSubtotal = "BOOKING_SUBTOTAL";

    private const string RoundingFloor = "FLOOR";
    private const string RoundingRound = "ROUND";
    private const string RoundingCeiling = "CEILING";

    private readonly HotelDbContext _dbContext;
    private readonly LoyaltyPointsOptions _options;

    public LoyaltyPointService(
        HotelDbContext dbContext,
        IOptions<LoyaltyPointsOptions> options)
    {
        _dbContext = dbContext;
        _options = options.Value ?? new LoyaltyPointsOptions();
    }

    public async Task<ApiResult<LoyaltyPointAwardResultDto>> AddPointsAfterBookingPaidAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var booking = await _dbContext.Bookings
                .Include(x => x.User)
                .Include(x => x.Invoices)
                .FirstOrDefaultAsync(x => x.Id == bookingId, cancellationToken);

            if (booking is null)
            {
                return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                    StatusCodes.Status404NotFound,
                    "BOOKING_NOT_FOUND",
                    $"Không tìm thấy booking id = {bookingId}.");
            }

            if (!booking.UserId.HasValue || booking.User is null)
            {
                return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                    StatusCodes.Status400BadRequest,
                    "BOOKING_USER_INVALID",
                    "Booking không có user hợp lệ để cộng điểm.");
            }

            if (!booking.User.Status)
            {
                return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                    StatusCodes.Status400BadRequest,
                    "USER_INACTIVE",
                    "User đang bị khóa hoặc không hợp lệ.");
            }

            if (!IsBookingPaid(booking))
            {
                return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                    StatusCodes.Status400BadRequest,
                    "BOOKING_NOT_PAID",
                    "Booking chưa ở trạng thái PAID nên chưa thể cộng điểm.",
                    new
                    {
                        bookingId = booking.Id,
                        bookingPaymentStatus = booking.PaymentStatus,
                        invoiceStatuses = booking.Invoices.Select(x => x.Status).ToList()
                    });
            }

            var existingHistory = await _dbContext.LoyaltyPointHistories
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.BookingId == booking.Id && x.ActionType == BookingPaidEarnAction,
                    cancellationToken);

            if (existingHistory is not null)
            {
                return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                    StatusCodes.Status409Conflict,
                    "POINTS_ALREADY_AWARDED",
                    "Booking này đã được cộng điểm trước đó.",
                    new
                    {
                        bookingId = booking.Id,
                        loyaltyHistoryId = existingHistory.Id,
                        pointsAdded = existingHistory.PointsAdded,
                        processedAt = existingHistory.CreatedAt
                    });
            }

            var eligibleAmount = ResolveEligibleAmount(booking);
            var pointsAdded = CalculatePoints(eligibleAmount);

            var user = booking.User;
            var loyaltyPointsBefore = user.LoyaltyPoints;
            var membershipIdBefore = user.MembershipId;

            user.LoyaltyPoints += pointsAdded;
            user.UpdatedAt = DateTime.UtcNow;

            if (_options.AutoUpdateMembership)
            {
                var membershipId = await ResolveMembershipIdAsync(user.LoyaltyPoints, cancellationToken);
                user.MembershipId = membershipId;
            }

            var history = new LoyaltyPointHistory
            {
                BookingId = booking.Id,
                UserId = user.Id,
                ActionType = BookingPaidEarnAction,
                SourceAmount = eligibleAmount,
                PointsAdded = pointsAdded,
                BalanceBefore = loyaltyPointsBefore,
                BalanceAfter = user.LoyaltyPoints,
                Reason = BookingPaidReason,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.LoyaltyPointHistories.Add(history);

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var result = new LoyaltyPointAwardResultDto
            {
                BookingId = booking.Id,
                UserId = user.Id,
                EligibleAmount = eligibleAmount,
                PointsAdded = pointsAdded,
                LoyaltyPointsBefore = loyaltyPointsBefore,
                LoyaltyPointsAfter = user.LoyaltyPoints,
                MembershipIdBefore = membershipIdBefore,
                MembershipIdAfter = user.MembershipId,
                LoyaltyHistoryId = history.Id,
                AppliedRule = BuildAppliedRule(),
                ProcessedAt = history.CreatedAt
            };

            return ApiResult<LoyaltyPointAwardResultDto>.Ok(
                result,
                pointsAdded > 0
                    ? "Cộng điểm sau thanh toán booking thành công."
                    : "Booking đã được ghi nhận thanh toán nhưng số điểm cộng bằng 0 theo rule hiện tại.",
                "ADD_POINTS_AFTER_BOOKING_PAID_SUCCESS");
        }
        catch (DbUpdateException ex) when (IsUniqueHistoryViolation(ex))
        {
            await transaction.RollbackAsync(cancellationToken);

            return ApiResult<LoyaltyPointAwardResultDto>.Fail(
                StatusCodes.Status409Conflict,
                "POINTS_ALREADY_AWARDED",
                "Booking này đã được cộng điểm ở một request khác. Không cộng trùng.");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private bool IsBookingPaid(Booking booking)
    {
        if (Normalize(booking.PaymentStatus) == PaidStatus)
        {
            return true;
        }

        return booking.Invoices.Any(x => Normalize(x.Status) == InvoicePaidStatus);
    }

    private decimal ResolveEligibleAmount(Booking booking)
    {
        var amountSource = Normalize(_options.AmountSource);

        var amount = amountSource switch
        {
            AmountSourceBookingSubtotal => booking.BookingSubtotal,
            _ => booking.FinalAmount
        };

        return Math.Max(0, amount);
    }

    private int CalculatePoints(decimal eligibleAmount)
    {
        if (eligibleAmount < Math.Max(0, _options.MinimumEligibleAmount))
        {
            return 0;
        }

        var moneyPerPoint = _options.MoneyPerPoint <= 0 ? 10000m : _options.MoneyPerPoint;
        var rawPoints = eligibleAmount / moneyPerPoint;

        var points = Normalize(_options.RoundingMode) switch
        {
            RoundingCeiling => (int)Math.Ceiling(rawPoints),
            RoundingRound => (int)Math.Round(rawPoints, MidpointRounding.AwayFromZero),
            _ => (int)Math.Floor(rawPoints)
        };

        return Math.Max(0, points);
    }

    private async Task<int?> ResolveMembershipIdAsync(int loyaltyPoints, CancellationToken cancellationToken)
    {
        var membership = await _dbContext.Memberships
            .AsNoTracking()
            .Where(x => x.Status == MembershipActiveStatus && x.MinPoints <= loyaltyPoints)
            .OrderByDescending(x => x.MinPoints)
            .ThenByDescending(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return membership?.Id;
    }

    private string BuildAppliedRule()
    {
        return $"amountSource={Normalize(_options.AmountSource)}; moneyPerPoint={_options.MoneyPerPoint}; roundingMode={Normalize(_options.RoundingMode)}; minimumEligibleAmount={_options.MinimumEligibleAmount}";
    }

    private static bool IsUniqueHistoryViolation(DbUpdateException exception)
    {
        return exception.InnerException is SqlException sqlException
               && (sqlException.Number == 2601 || sqlException.Number == 2627);
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToUpperInvariant();
    }
}