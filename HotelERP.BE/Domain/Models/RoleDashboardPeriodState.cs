using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelERP.BE.Domain.Models;

public partial class RoleDashboardPeriodState
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public string DashboardCode { get; set; } = null!;

    public string DashboardTitle { get; set; } = null!;

    public string PeriodType { get; set; } = null!;

    public string PeriodKey { get; set; } = null!;

    public DateTime PeriodStart { get; set; }

    public DateTime PeriodEnd { get; set; }

    public string DashboardJson { get; set; } = null!;

    public string? ComparisonJson { get; set; }

    public string Status { get; set; } = null!;

    public bool IsCurrent { get; set; }

    public string? LastEventType { get; set; }

    public string? LastEventSource { get; set; }

    public int? LastEventRefId { get; set; }

    public int Version { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual User? UpdatedByUser { get; set; }
}
