using System;
using System.Collections.Generic;

namespace HotelERP.BE.Domain.Models.DTOs
{
    public class CreateBookingRequestDto
    {
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Note { get; set; }
        
        // Danh sách các phòng khách đặt (Multi-room)
        public List<RoomBookingDto> Rooms { get; set; } 
    }
}