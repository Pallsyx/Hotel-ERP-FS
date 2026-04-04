import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'https://localhost:7100/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
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
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      try {
        const response = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {
          token: localStorage.getItem('token'),
          refreshToken: refreshToken,
        });

        const { accessToken, newRefreshToken } = response.data.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        useAuthStore.getState().login(
          useAuthStore.getState().user,
          accessToken,
          newRefreshToken
        );

        isRefreshing = false;
        onRefreshed(accessToken);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(axiosClient(originalRequest));
      });
    });
  }
);

export default axiosClient;