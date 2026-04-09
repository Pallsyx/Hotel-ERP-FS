import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    return axiosClient.post('/Auth/login', data);
  },
  register: (data) => {
    return axiosClient.post('/Auth/register', data);
  },
  
  // ==========================================
  // 2 HÀM MỚI CHO TÍNH NĂNG QUÊN MẬT KHẨU
  // ==========================================
  
  // Gửi email lấy mã OTP
  forgotPassword: (data) => {
    return axiosClient.post('/Auth/forgot-password', data);
  },
  
  // Gửi OTP và Mật khẩu mới để đặt lại
  resetPasswordWithOtp: (data) => {
    return axiosClient.post('/Auth/reset-password-otp', data);
  }
};

export default authApi;