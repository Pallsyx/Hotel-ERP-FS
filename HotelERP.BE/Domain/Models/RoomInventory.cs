using System;
using System.Collections.Generic;

namespace HotelERP.BE.Domain.Models;

public partial class RoomInventory
{
    public int Id { get; set; }

    public int? RoomId { get; set; }

    public string ItemName { get; set; } = null!;

    public string ItemType { get; set; } = null!;

    public string? Unit { get; set; }

    public int Quantity { get; set; }

    public decimal PriceIfLost { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();

    public virtual Room? Room { get; set; }
}
