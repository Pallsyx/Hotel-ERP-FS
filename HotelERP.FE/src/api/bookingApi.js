import axiosClient from './axiosClient';

// Base URL trên Controller C# là: api/BookingEngine
const bookingApi = {
  // 1. Tìm kiếm phòng trống
  // [HttpPost("search")]
  searchAvailableRooms: (data) => {
    return axiosClient.post('/BookingEngine/search', data);
  },

  // 2. Giữ phòng (Tạm thời)
  // [HttpPost("hold")]
  holdRoom: (data) => {
    return axiosClient.post('/BookingEngine/hold', data);
  },

  // 3. Tạo Đặt phòng nhiều phòng cùng lúc
  // [HttpPost("multi-booking")]
  createMultiBooking: (data) => {
    return axiosClient.post('/BookingEngine/multi-booking', data);
  },

  // 4. Lấy danh sách phòng trống để gán cho khách Check-in
  // [HttpGet("assignable-rooms/{typeId}")]
  getAssignableRooms: (typeId) => {
    return axiosClient.get(`/BookingEngine/assignable-rooms/${typeId}`);
  },

  // 5. Ép hủy đặt phòng (Dành cho Admin/Manager)
  // Lưu ý: Cần sửa nhẹ backend (đọc giải thích bên dưới)
  forceCancelBooking: (id) => {
    return axiosClient.post(`/BookingEngine/force-cancel/${id}`); 
  }
};

export default bookingApi;