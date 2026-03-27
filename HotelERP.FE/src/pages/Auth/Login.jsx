import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await authApi.login(values);
      console.log("📦 Dữ liệu Backend trả về:", response.data);

      // Trích xuất Token (Dựa trên cấu trúc Backend C# của bạn)
      const accessToken = response.data.data.accessToken; 
      
      if (!accessToken) {
        message.error('Không tìm thấy Token trong dữ liệu trả về!');
        return;
      }

      // Lưu token vào Store và LocalStorage
      loginStore({ email: values.email }, accessToken);
      
      message.success('Đăng nhập thành công!');
      navigate('/admin/users');
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
        </Form>
      </Card>
    </div>
  );
};

export default Login;