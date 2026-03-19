namespace HotelERP.Application.DTOs.Room;

// Request DTOs
public record RoomFilterRequest(string? Status, string? CleaningStatus, int? RoomTypeId);
public record CreateRoomRequest(string RoomNumber, int RoomTypeId, string Status = "AVAILABLE", string CleaningStatus = "CLEAN");
public record UpdateRoomRequest(string RoomNumber, int RoomTypeId);
public record UpdateCleaningStatusRequest(string NewCleaningStatus);
public record UpdateRoomStatusRequest(string NewStatus, string? MaintenanceReason);
public record ReportDamageRequest(int RoomId, int? BookingId, string ItemName, string Description, decimal Cost);

// Response DTOs
public record RoomResponseDto(int Id, string RoomNumber, string Status, string CleaningStatus, string RoomTypeName);
public record RoomDetailResponseDto(int Id, string RoomNumber, string Status, string CleaningStatus, int RoomTypeId, string RoomTypeName, decimal BasePrice);
public record DamageReportResponseDto(int Id, string ItemName, string Description, decimal Cost, DateTime ReportedAt, string ReportedByUserName);