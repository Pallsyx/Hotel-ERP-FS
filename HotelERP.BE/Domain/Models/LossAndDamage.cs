namespace HotelERP.BE.Domain.Models;

public partial class LossAndDamage
{
    public int Id { get; set; }

    public int RoomId { get; set; }

    public int? BookingId { get; set; } 

    public int ReportedByUserId { get; set; } 

    public string ItemName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Cost { get; set; }

    public string? EvidenceImageUrl { get; set; }

    public string? CloudinaryPublicId { get; set; }
    
    public DateTime ReportedAt { get; set; }

    public virtual Room Room { get; set; } = null!;
}