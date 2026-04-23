using System.Collections.Generic;
using System.Threading.Tasks;
using HotelERP.BE.Application.DTOs.AuditLogs;

namespace HotelERP.BE.Application.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLogResponseDto>> GetAuditLogsAsync(AuditLogQueryDto query, int currentUserId, string currentUserRole);
    Task<byte[]> ExportToExcelAsync(AuditLogQueryDto query, int currentUserId, string currentUserRole);
}
