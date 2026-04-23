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
      navigate('/admin/room-types');
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="ĐĂNG NHẬP HOTEL ERP" style={{ width: 400, textAlign: 'center' }}>
        <Form name="login_form" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} size="large">
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <Link to="/forgot-password" style={{ color: '#1890ff' }}>Quên mật khẩu?</Link>
            <span>
              Chưa có tài khoản? <Link to="/register" style={{ fontWeight: 'bold' }}>Đăng ký</Link>
            </span>
          </div>

        </Form>
      </Card> 
    </div>
  );
};

export default Login;