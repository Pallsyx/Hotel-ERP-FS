namespace HotelERP.BE.Domain.Constants;

public static class BookingStatus
{
    public const string Holding = "Holding";
    public const string Paid = "Paid";
    public const string Expired = "Expired";
    public const string CancelledByAdmin = "CancelledByAdmin";
    public const string CheckedIn = "CheckedIn";
    public const string CheckedOut = "CheckedOut";
}

public static class RoomPhysicalStatus
{
    public const string Available = "Available";
    public const string Occupied = "Occupied";
    public const string Maintenance = "Maintenance";
}

public static class CleaningStatus
{
    public const string Clean = "Clean";
    public const string Dirty = "Dirty";
    public const string CleaningInProgress = "CleaningInProgress";
}