import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7100/api', // Đảm bảo đúng cổng 7100 của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào Header trước khi gửi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Kiểm tra xem token có thật sự hợp lệ không, tránh gửi chữ "undefined"
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Đang gửi kèm Token:", token.substring(0, 20) + "..."); 
  } else {
    console.warn("⚠️ CẢNH BÁO: Không có Token hoặc Token bị lỗi rác!");
  }
  
  return config;
});

export default axiosClient;