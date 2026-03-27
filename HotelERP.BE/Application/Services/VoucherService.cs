using HotelERP.BE.Domain.Models;
using HotelERP.BE.DTOs.Common;
using HotelERP.BE.DTOs.Vouchers;
using HotelERP.BE.Helpers.AuditLogs;
using HotelERP.BE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelERP.BE.Services.Vouchers;

public class VoucherService : IVoucherService
{
    private const string StatusActive = "ACTIVE";
    private const string StatusInactive = "INACTIVE";
    private const string DiscountTypePercent = "PERCENT";
    private const string DiscountTypeFixedAmount = "FIXED_AMOUNT";

    private readonly HotelDbContext _dbContext;

    public VoucherService(HotelDbContext dbContext, IVoucherAuditLogHelper voucherAuditLogHelper)
    {
        _dbContext = dbContext;
    }

    public async Task<ApiResult<List<VoucherResponseDto>>> GetAllAsync(string? status, string? search, CancellationToken cancellationToken = default)
    {
        var normalizedStatus = Normalize(status);
        if (!string.IsNullOrWhiteSpace(normalizedStatus) && !IsValidStatus(normalizedStatus))
        {
            return ApiResult<List<VoucherResponseDto>>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_STATUS",
                "status chỉ nhận ACTIVE hoặc INACTIVE.",
                new { field = "status", acceptedValues = new[] { StatusActive, StatusInactive } });
        }

        IQueryable<Voucher> query = _dbContext.Vouchers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(normalizedStatus))
        {
            query = query.Where(x => x.Status == normalizedStatus);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x => x.Code.Contains(keyword));
        }

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id)
            .Select(x => new VoucherResponseDto
            {
                Id = x.Id,
                Code = x.Code,
                DiscountType = x.DiscountType,
                DiscountValue = x.DiscountValue,
                MinBookingAmount = x.MinBookingAmount,
                ValidFrom = x.ValidFrom,
                ValidTo = x.ValidTo,
                UsageLimit = x.UsageLimit,
                UsedCount = x.UsedCount,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return ApiResult<List<VoucherResponseDto>>.Ok(items, "Lấy danh sách voucher thành công.", "VOUCHER_LIST_SUCCESS");
    }

    public async Task<ApiResult<VoucherResponseDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var voucher = await _dbContext.Vouchers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (voucher is null)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "VOUCHER_NOT_FOUND",
                $"Không tìm thấy voucher id = {id}.");
        }

        return ApiResult<VoucherResponseDto>.Ok(MapToResponse(voucher), "Lấy chi tiết voucher thành công.", "VOUCHER_DETAIL_SUCCESS");
    }

    public async Task<ApiResult<VoucherResponseDto>> CreateAsync(CreateVoucherRequestDto request, int? performedByUserId, CancellationToken cancellationToken = default)
    {
        var validationResult = await ValidateUpsertRequestAsync(
            request.Code,
            request.DiscountType,
            request.DiscountValue,
            request.MinBookingAmount,
            request.Status,
            request.ValidFrom,
            request.ValidTo,
            request.UsageLimit,
            performedByUserId,
            request.Reason,
            excludeVoucherId: null,
            cancellationToken: cancellationToken);

        if (validationResult is not null)
        {
            return validationResult;
        }

        var now = DateTime.UtcNow;
        var normalizedCode = Normalize(request.Code);
        var normalizedDiscountType = Normalize(request.DiscountType);
        var normalizedStatus = Normalize(request.Status);

        var voucher = new Voucher
        {
            Code = normalizedCode!,
            DiscountType = normalizedDiscountType!,
            DiscountValue = request.DiscountValue,
            MinBookingAmount = request.MinBookingAmount,
            MinBookingValue = request.MinBookingAmount,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            Status = normalizedStatus!,
            CreatedAt = now,
            UpdatedAt = null
        };

        _dbContext.Vouchers.Add(voucher);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResult<VoucherResponseDto>.Created(MapToResponse(voucher), "Tạo voucher thành công.", "CREATE_VOUCHER_SUCCESS");
    }

    public async Task<ApiResult<VoucherResponseDto>> UpdateAsync(int id, UpdateVoucherRequestDto request, int? performedByUserId, CancellationToken cancellationToken = default)
    {
        var voucher = await _dbContext.Vouchers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (voucher is null)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status404NotFound,
                "VOUCHER_NOT_FOUND",
                $"Không tìm thấy voucher id = {id}.");
        }

        var validationResult = await ValidateUpsertRequestAsync(
            request.Code,
            request.DiscountType,
            request.DiscountValue,
            request.MinBookingAmount,
            request.Status,
            request.ValidFrom,
            request.ValidTo,
            request.UsageLimit,
            performedByUserId,
            request.Reason,
            excludeVoucherId: id,
            cancellationToken: cancellationToken);

        if (validationResult is not null)
        {
            return validationResult;
        }

        voucher.Code = Normalize(request.Code)!;
        voucher.DiscountType = Normalize(request.DiscountType)!;
        voucher.DiscountValue = request.DiscountValue;
        voucher.MinBookingAmount = request.MinBookingAmount;
        voucher.MinBookingValue = request.MinBookingAmount;
        voucher.ValidFrom = request.ValidFrom;
        voucher.ValidTo = request.ValidTo;
        voucher.UsageLimit = request.UsageLimit;
        voucher.Status = Normalize(request.Status)!;
        voucher.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResult<VoucherResponseDto>.Ok(MapToResponse(voucher), "Cập nhật voucher thành công.", "UPDATE_VOUCHER_SUCCESS");
    }

    public async Task<ApiResult<object>> DisableAsync(int id, DisableVoucherRequestDto request, int? performedByUserId, CancellationToken cancellationToken = default)
    {
        var actorValidation = await ValidateActorAndReasonAsync(performedByUserId, request.Reason, cancellationToken);
        if (actorValidation is not null)
        {
            return actorValidation;
        }

        var voucher = await _dbContext.Vouchers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (voucher is null)
        {
            return ApiResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "VOUCHER_NOT_FOUND",
                $"Không tìm thấy voucher id = {id}.");
        }

        if (voucher.Status == StatusInactive)
        {
            return ApiResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "VOUCHER_ALREADY_INACTIVE",
                "Voucher đã ở trạng thái INACTIVE.");
        }

        voucher.Status = StatusInactive;
        voucher.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ApiResult<object>.Ok(new
        {
            voucherId = voucher.Id,
            status = voucher.Status,
            updatedAt = voucher.UpdatedAt
        }, "Vô hiệu hóa voucher thành công.", "DISABLE_VOUCHER_SUCCESS");
    }

    private async Task<ApiResult<VoucherResponseDto>?> ValidateUpsertRequestAsync(
        string? code,
        string? discountType,
        decimal discountValue,
        decimal minBookingAmount,
        string? status,
        DateTime? validFrom,
        DateTime? validTo,
        int? usageLimit,
        int? performedByUserId,
        string? reason,
        int? excludeVoucherId,
        CancellationToken cancellationToken)
    {
        var actorValidation = await ValidateActorAndReasonAsync(performedByUserId, reason, cancellationToken);
        if (actorValidation is not null)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                actorValidation.StatusCode,
                actorValidation.Code,
                actorValidation.Message,
                actorValidation.Details);
        }

        var normalizedCode = Normalize(code);
        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "CODE_REQUIRED",
                "code là bắt buộc.",
                new { field = "code" });
        }

        var normalizedDiscountType = Normalize(discountType);
        if (!IsValidDiscountType(normalizedDiscountType))
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_DISCOUNT_TYPE",
                "discount_type chỉ nhận PERCENT hoặc FIXED_AMOUNT.",
                new { field = "discountType", acceptedValues = new[] { DiscountTypePercent, DiscountTypeFixedAmount } });
        }

        if (discountValue < 0)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_DISCOUNT_VALUE",
                "discount_value phải >= 0.",
                new { field = "discountValue" });
        }

        if (minBookingAmount < 0)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_MIN_BOOKING_AMOUNT",
                "min_booking_amount phải >= 0.",
                new { field = "minBookingAmount" });
        }

        if (usageLimit.HasValue && usageLimit.Value < 0)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_USAGE_LIMIT",
                "usage_limit phải >= 0.",
                new { field = "usageLimit" });
        }

        var normalizedStatus = Normalize(status);
        if (!IsValidStatus(normalizedStatus))
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_STATUS",
                "status chỉ nhận ACTIVE hoặc INACTIVE.",
                new { field = "status", acceptedValues = new[] { StatusActive, StatusInactive } });
        }

        if (validFrom.HasValue && validTo.HasValue && validTo.Value < validFrom.Value)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status400BadRequest,
                "INVALID_DATE_RANGE",
                "valid_to không được nhỏ hơn valid_from.",
                new { field = "validTo" });
        }

        var codeExists = await _dbContext.Vouchers.AnyAsync(
            x => x.Code == normalizedCode && (!excludeVoucherId.HasValue || x.Id != excludeVoucherId.Value),
            cancellationToken);

        if (codeExists)
        {
            return ApiResult<VoucherResponseDto>.Fail(
                StatusCodes.Status409Conflict,
                "VOUCHER_CODE_ALREADY_EXISTS",
                $"Voucher code '{normalizedCode}' đã tồn tại.",
                new { field = "code", value = normalizedCode });
        }

        return null;
    }

    private async Task<ApiResult<object>?> ValidateActorAndReasonAsync(int? performedByUserId, string? reason, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            return ApiResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "REASON_REQUIRED",
                "reason là bắt buộc để ghi audit log.",
                new { field = "reason" });
        }

        if (performedByUserId.HasValue)
        {
            var actorExists = await _dbContext.Users.AnyAsync(x => x.Id == performedByUserId.Value, cancellationToken);
            if (!actorExists)
            {
                return ApiResult<object>.Fail(
                    StatusCodes.Status400BadRequest,
                    "INVALID_ACTOR",
                    $"userId = {performedByUserId.Value} không tồn tại.",
                    new { field = "x-user-id", value = performedByUserId.Value });
            }
        }

        return null;
    }

    private static bool IsValidStatus(string? status)
    {
        return status == StatusActive || status == StatusInactive;
    }

    private static bool IsValidDiscountType(string? discountType)
    {
        return discountType == DiscountTypePercent || discountType == DiscountTypeFixedAmount;
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim().ToUpperInvariant();
    }

    private static VoucherResponseDto MapToResponse(Voucher voucher)
    {
        return new VoucherResponseDto
        {
            Id = voucher.Id,
            Code = voucher.Code,
            DiscountType = voucher.DiscountType,
            DiscountValue = voucher.DiscountValue,
            MinBookingAmount = voucher.MinBookingAmount,
            ValidFrom = voucher.ValidFrom,
            ValidTo = voucher.ValidTo,
            UsageLimit = voucher.UsageLimit,
            UsedCount = voucher.UsedCount,
            Status = voucher.Status,
            CreatedAt = voucher.CreatedAt,
            UpdatedAt = voucher.UpdatedAt
        };
    }
}