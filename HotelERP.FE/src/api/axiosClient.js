import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosClient = axios.create({
  baseURL: 'https://localhost:7100/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để đẩy các request bị chờ vào hàng đợi
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// Hàm để thực thi lại các request sau khi đã có token mới
const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response: { status } } = error;
    const originalRequest = config;

    if (status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        try {
          // Gọi API Refresh Token của Backend
          const response = await axios.post('https://localhost:7100/api/Auth/refresh-token', {
            token: localStorage.getItem('token'),
            refreshToken: refreshToken
          });

          const { accessToken, newRefreshToken } = response.data.data;

          // Lưu token mới
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          useAuthStore.getState().login(useAuthStore.getState().user, accessToken, newRefreshToken);

          isRefreshing = false;
          onRefreshed(accessToken); // Thông báo cho các request đang chờ
        } catch (refreshError) {
          isRefreshing = false;
          useAuthStore.getState().logout(); // Nếu refresh thất bại thì ép đăng xuất
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Đưa request hiện tại vào hàng đợi chờ token mới
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;