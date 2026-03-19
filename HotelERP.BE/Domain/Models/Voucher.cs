using System;
using System.Collections.Generic;

namespace HotelERP.BE.Domain.Models;

public partial class Voucher
{
    public int Id { get; set; }

    public string Code { get; set; } = null!;

    public string DiscountType { get; set; } = null!;

    public decimal DiscountValue { get; set; }

    public decimal MinBookingValue { get; set; }

    public decimal MinBookingAmount { get; set; }

    public DateTime? ValidFrom { get; set; }

    public DateTime? ValidTo { get; set; }

    public int? UsageLimit { get; set; }

    public int UsedCount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
