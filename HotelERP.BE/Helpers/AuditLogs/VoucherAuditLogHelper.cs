using System.Text.Json;
using HotelERP.BE.Domain.Models;
using HotelERP.BE.Infrastructure.Data;

namespace HotelERP.BE.Helpers.AuditLogs;

public class VoucherAuditLogHelper : IVoucherAuditLogHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly HotelDbContext _dbContext;

    public VoucherAuditLogHelper(HotelDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public object BuildSnapshot(Voucher voucher)
    {
        return new
        {
            voucher.Id,
            voucher.Code,
            voucher.DiscountType,
            voucher.DiscountValue,
            voucher.MinBookingAmount,
            voucher.ValidFrom,
            voucher.ValidTo,
            voucher.UsageLimit,
            voucher.UsedCount,
            voucher.Status,
            voucher.CreatedAt,
            voucher.UpdatedAt
        };
    }

    public async Task WriteAsync(
        int? userId,
        string action,
        int recordId,
        object? oldValue,
        object? newValue,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = action,
            TableName = "Vouchers",
            RecordId = recordId,
            OldValue = Serialize(oldValue),
            NewValue = Serialize(newValue),
            Reason = reason?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.AuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string? Serialize(object? value)
    {
        if (value is null)
        {
            return null;
        }

        return JsonSerializer.Serialize(value, JsonOptions);
    }
}