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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="ĐĂNG KÝ TÀI KHOẢN" style={{ width: 400, textAlign: 'center' }}>
        <Form name="register_form" onFinish={onFinish} layout="vertical">
          
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Họ và Tên" size="large" />
          </Form.Item>

          <Form.Item 
            name="email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
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
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} size="large" loading={loading}>
              Đăng ký ngay
            </Button>
          </Form.Item>
          
          <Text>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></Text>
        </Form>
      </Card> 
    </div>
  );
};

export default Register;