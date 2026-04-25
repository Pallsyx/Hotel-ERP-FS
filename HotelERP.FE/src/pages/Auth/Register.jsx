import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const { Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API Đăng ký (Bạn nhớ thêm hàm register vào authApi nhé)
      await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });

      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login'); // Chuyển về trang đăng nhập
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
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

      <div className="z-10 w-full max-w-md p-8 bg-[#32384d]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 my-8">
        <div className="text-center mb-8">
          <h1 className="text-[#b4976c] text-3xl font-serif tracking-widest uppercase mb-2">Asteria</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Đăng ký tài khoản</p>
        </div>

        <Form name="register_form" onFinish={onFinish} layout="vertical">
          
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
            <Input 
              prefix={<UserOutlined className="text-[#b4976c]" />} 
              placeholder="Họ và Tên" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item 
            name="email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-[#b4976c]" />} 
              placeholder="Email" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password 
              prefix={<LockOutlined className="text-[#b4976c]" />} 
              placeholder="Mật khẩu" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item 
            name="confirmPassword" 
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-[#b4976c]" />} 
              placeholder="Xác nhận mật khẩu" 
              size="large" 
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
              style={{ colorScheme: 'dark' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-12 bg-[#b4976c] hover:bg-[#8e7654] border-none text-white font-bold tracking-wider rounded-lg transition-colors mt-2"
            >
              ĐĂNG KÝ NGAY
            </Button>
          </Form.Item>
          
          <div className="text-center text-sm mt-4">
            <span className="text-gray-400">Đã có tài khoản? </span>
            <Link to="/login" className="text-[#b4976c] hover:text-[#8e7654] font-bold transition-colors">Đăng nhập tại đây</Link>
          </div>
        </Form>
      </div> 
    </div>
  );
};

export default Register;