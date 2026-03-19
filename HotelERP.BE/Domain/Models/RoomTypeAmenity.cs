using System;
using System.Collections.Generic;

namespace HotelERP.BE.Domain.Models;

public partial class RoomTypeAmenity
{
    public int RoomTypeId { get; set; }

    public int AmenityId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Amenity Amenity { get; set; } = null!;

    public virtual RoomType RoomType { get; set; } = null!;
}
