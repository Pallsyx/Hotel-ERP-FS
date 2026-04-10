import axiosClient from './axiosClient';

const bookingManagementApi = {
  // Lấy khách đến hôm nay
  getTodayArrivals: () => {
    return axiosClient.get('/booking-management/today-arrivals');
  },

  // Lấy khách đang lưu trú
  getInHouseGuests: () => {
    return axiosClient.get('/booking-management/in-house');
  },

  // Lấy khách dự kiến rời đi hôm nay
  getTodayDepartures: () => {
    return axiosClient.get('/booking-management/today-departures');
  },

  // Cập nhật trạng thái cho từng phòng lẻ (Check-in, Check-out, etc.)
  updateDetailStatus: (detailId, newStatus) => {
    return axiosClient.put(`/booking-management/details/${detailId}/status`, { newStatus });
  },

  // Lấy tất cả bookings (có phân trang/lọc)
  searchBookings: (params) => {
    return axiosClient.get('/booking-management', { params });
  },

  // Cập nhật trạng thái nguyên 1 booking
  updateBookingStatus: (bookingId, newStatus) => {
    return axiosClient.put(`/booking-management/${bookingId}/status`, { newStatus });
  },

  // Đổi phòng cho khách
  changeRoom: (detailId, newRoomId) => {
    return axiosClient.put(`/booking-management/details/${detailId}/change-room`, { newRoomId });
  }
};

export default bookingManagementApi;
