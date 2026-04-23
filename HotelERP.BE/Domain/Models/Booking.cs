using System;
using System.Collections.Generic;

namespace HotelERP.BE.Domain.Models;

public partial class Booking
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string? GuestName { get; set; }

    public string? GuestPhone { get; set; }

    public string? GuestEmail { get; set; }

    public string BookingCode { get; set; } = null!;

    public int? VoucherId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime BookedAt { get; set; }

    public DateTime? HoldExpiresAt { get; set; }

    public decimal BookingSubtotal { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public decimal DepositAmount { get; set; }

    public string PaymentStatus { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual User? User { get; set; }

    public virtual Voucher? Voucher { get; set; }

    public bool? IsPointsAwarded { get; set; }
}
