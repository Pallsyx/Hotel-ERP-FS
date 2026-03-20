namespace HotelERP.Application.Interfaces;

public interface IRoomTypeAmenityService
{
    Task<bool> UpdateAmenitiesForRoomTypeAsync(int roomTypeId, List<int> amenityIds);
}