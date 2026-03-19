using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using HotelERP.BE.Domain.Models;
using System.Text.Json;

namespace HotelERP.Infrastructure.Interceptors;

public class AuditLogInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, 
        InterceptionResult<int> result, 
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            // Bỏ qua nếu chính nó là Audit_Log để tránh lặp vô tận
            if (entry.Entity.GetType().Name == "Audit_Log") continue;

            // Lấy ID người dùng (Trong thực tế nên lấy từ IHttpContextAccessor, ở đây tạm mock ID = 1)
            int userId = 1; 

            var auditLog = new AuditLog
            {
                UserId = userId,
                TableName = entry.Entity.GetType().Name,
                Action = entry.State.ToString().ToUpper(), // ADDED, MODIFIED, DELETED
                CreatedAt = DateTime.UtcNow,
                Reason = "Hệ thống tự động ghi nhận thay đổi từ Module 3"
            };

            // Lấy ID của record bị thay đổi
            var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
            if (primaryKey != null && primaryKey.CurrentValue != null)
            {
                auditLog.RecordId = (int)primaryKey.CurrentValue;
            }

            // Lưu giá trị cũ và mới dưới dạng JSON
            if (entry.State == EntityState.Modified)
            {
                var oldValues = new Dictionary<string, object>();
                var newValues = new Dictionary<string, object>();

                foreach (var property in entry.Properties)
                {
                    if (property.IsModified)
                    {
                        oldValues[property.Metadata.Name] = property.OriginalValue!;
                        newValues[property.Metadata.Name] = property.CurrentValue!;
                    }
                }
                auditLog.OldValue = JsonSerializer.Serialize(oldValues);
                auditLog.NewValue = JsonSerializer.Serialize(newValues);
            }

            // Ghi log vào database (Cần tạo Entity AuditLog và DbSet AuditLogs trong HotelDbContext trước)
            // LƯU Ý: Dùng Database.ExecuteSqlRawAsync hoặc Add riêng để không can thiệp vào transaction hiện tại
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}