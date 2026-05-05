import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Tìm kiếm phòng trống theo khoảng thời gian và số khách.
 * @param {{ checkIn: string, checkOut: string, adults: number, children: number, rooms: number }} params
 */
export async function searchRooms({ checkIn, checkOut, adults, children, rooms }) {
  const { data } = await api.post('/api/BookingEngine/search', {
    checkInDate:   checkIn,
    checkOutDate:  checkOut,
    adultsCount:   adults,
    childrenCount: children,
    roomsRequested: rooms,
  });
  return data; // { success, searchParams, availableRooms }
}

export default api;
