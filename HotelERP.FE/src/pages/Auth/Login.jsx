import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

// 👉 HÀM MỚI: Dùng để giải mã Token lấy thông tin mà không cần thư viện ngoài
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Login = () => {
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await authApi.login(values);
      console.log("📦 Dữ liệu Backend trả về:", response.data);

      // 1. Lấy Token từ Backend trả về
      const { accessToken, refreshToken } = response.data.data || response.data;

      if (!accessToken) {
        message.error('Không tìm thấy Token trong dữ liệu trả về!');
        return;
      }

      // 2. GIẢI MÃ TOKEN ĐỂ MOI QUYỀN HẠN VÀ THÔNG TIN USER RA
      const decodedToken = parseJwt(accessToken);
      console.log("🔓 Token sau khi giải mã:", decodedToken);

      // Trích xuất mảng quyền (C# lưu trong claim tên là "permission")
      let userPermissions = decodedToken.permission || [];
      // Nếu user chỉ có đúng 1 quyền, JWT sẽ trả về dạng chuỗi thay vì mảng -> Ép nó thành mảng
      if (typeof userPermissions === 'string') {
        userPermissions = [userPermissions]; 
      }

      // Trích xuất tên và role (Tùy theo cấu hình ClaimTypes của C#)
      const userData = {
        fullName: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decodedToken.name || "Admin",
        roleName: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken.role || "Admin"
      };

      // 3. Đẩy vào Store
      loginStore(userData, accessToken, refreshToken, userPermissions);
      
      message.success('Đăng nhập thành công!');

      // 4. PHÂN LUỒNG ROUTING THEO ROLE
      if (userData.roleName === 'User' || userPermissions.includes('User')) {
        navigate('/'); // Khách hàng bình thường về trang chủ
      } else {
        navigate('/admin/dashboard'); // Admin/Lễ tân vào Dashboard Admin
      }
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#262b3f]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="z-10 w-full max-w-md p-8 bg-[#32384d]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-[#b4976c] text-3xl font-serif tracking-widest uppercase mb-2">Asteria</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Đăng nhập hệ thống</p>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical">
          <Form.Item 
            name="email" 
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-[#b4976c]" />} 
              placeholder="Email" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-[#b4976c]" />} 
              placeholder="Mật khẩu" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 bg-[#b4976c] hover:bg-[#8e7654] border-none text-white font-bold tracking-wider rounded-lg transition-colors mt-2"
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>

          <div className="flex justify-between items-center text-sm mt-4">
            <Link to="/forgot-password" className="text-gray-400 hover:text-[#b4976c] transition-colors">Quên mật khẩu?</Link>
            <span className="text-gray-400">
              Chưa có tài khoản? <Link to="/register" className="text-[#b4976c] hover:text-[#8e7654] font-bold ml-1 transition-colors">Đăng ký</Link>
            </span>
          </div>
        </Form>
      </div> 
    </div>
  );
};

export default Login;