using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HotelERP.BE.API.Attributes;

public class AuditLogInterceptorAttribute : ActionFilterAttribute
{
    private readonly string _actionName;
    private readonly string _tableName;

    public AuditLogInterceptorAttribute(string actionName, string tableName)
    {
        _actionName = actionName;
        _tableName = tableName;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var rawReason = context.HttpContext.Request.Headers["X-Audit-Reason"].FirstOrDefault();
        
        if (string.IsNullOrWhiteSpace(rawReason))
        {
            context.Result = new BadRequestObjectResult(new { 
                success = false, 
                message = $"Thao tác '{_actionName}' yêu cầu bắt buộc phải có lý do (Header: X-Audit-Reason)." 
            });
            return;
        }

        context.HttpContext.Items["AuditAction"] = _actionName;
        context.HttpContext.Items["AuditTableName"] = _tableName;
    }
}