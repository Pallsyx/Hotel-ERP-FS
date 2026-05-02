import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
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
      const { accessToken, refreshToken } = response.data.data || response.data;

      if (!accessToken) {
        message.error('Không tìm thấy Token trong dữ liệu trả về!');
        return;
      }

      const decodedToken = parseJwt(accessToken);
      let userPermissions = decodedToken.permission || [];
      if (typeof userPermissions === 'string') {
        userPermissions = [userPermissions];
      }

      const rawRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        || decodedToken.role
        || "Admin";
      const resolvedRole = Array.isArray(rawRole) ? rawRole[0] : rawRole;

      const fullName =
        decodedToken["unique_name"]
        || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
        || decodedToken.name
        || decodedToken.fullName
        || null;

      const email =
        decodedToken["email"]
        || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
        || null;

      const userData = {
        fullName: fullName,
        email: email,
        roleName: resolvedRole,
      };

      loginStore(userData, accessToken, refreshToken, userPermissions);
      message.success('Đăng nhập thành công!');

      if (userData.roleName === 'Guest' || userPermissions.includes('Guest')) {
        navigate('/');
      } else {
        navigate('/admin/dashboard');
      }

    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#262b3f] font-serif overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=2000&auto=format&fit=crop')",
          filter: 'brightness(0.4) contrast(1.1)',
        }}
      ></div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 md:top-12 md:left-12 z-50 flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white transition-colors bg-white/5 backdrop-blur-sm">
          <HomeOutlined className="text-lg group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-serif tracking-[0.2em] text-[10px] uppercase font-bold hidden md:block">Trang chủ</span>
      </Link>

      {/* Login Card with Glassmorphism */}
      <div className="z-10 w-full max-w-md mx-4 p-10 bg-[#262b3f]/60 backdrop-blur-xl rounded-3xl shadow-[0_15px_40px_0_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden">
        
        {/* Subtle Gold Glow Effect inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b4976c] rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#b4976c] rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-white text-4xl font-serif tracking-[0.3em] uppercase mb-4 drop-shadow-md">Asteria</h1>
          <div className="h-[1px] w-16 bg-[#b4976c] mx-auto mb-4"></div>
          <p className="text-[#b4976c] text-[10px] tracking-[0.2em] uppercase font-bold">Đăng nhập hệ thống</p>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical" className="relative z-10">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
            className="mb-6"
          >
            <Input
              prefix={<UserOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />}
              placeholder="Email của bạn"
              size="large"
              className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all font-sans"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
            className="mb-4"
          >
            <Input.Password
              prefix={<LockOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />}
              placeholder="Mật khẩu"
              size="large"
              className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all font-sans"
            />
          </Form.Item>

          <div className="flex justify-end mb-8">
            <Link to="/forgot-password" className="text-[11px] font-serif text-gray-300 hover:text-[#b4976c] tracking-widest transition-colors">QUÊN MẬT KHẨU?</Link>
          </div>

          <Form.Item className="mb-8">
            <Button
              htmlType="submit"
              className="w-full h-[50px] !bg-[#b4976c] hover:!bg-[#c9a97b] border-none !text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(180,151,108,0.4)] hover:shadow-[0_6px_20px_rgba(180,151,108,0.6)] flex items-center justify-center font-serif"
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-400 text-[11px] tracking-widest uppercase font-serif">
              Chưa có tài khoản?
            </span>
            <Link to="/register" className="ml-2 !text-[#b4976c] hover:!text-white text-[11px] tracking-widest uppercase font-bold transition-colors border-b border-[#b4976c] hover:border-white pb-1">
              ĐĂNG KÝ
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;