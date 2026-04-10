import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const { Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập Email, 2: Nhập OTP & Pass mới
  const [emailToReset, setEmailToReset] = useState('');
  const [loading, setLoading] = useState(false);

  // BƯỚC 1: GỬI YÊU CẦU LẤY OTP
  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email });
      setEmailToReset(values.email);
      message.success('Mã OTP đã được gửi đến email của bạn!');
      setStep(2); // Chuyển sang form nhập OTP
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: ĐỔI MẬT KHẨU VỚI OTP
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await authApi.resetPasswordWithOtp({
        email: emailToReset,
        otpCode: values.otpCode,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title={step === 1 ? "QUÊN MẬT KHẨU" : "ĐẶT LẠI MẬT KHẨU"} style={{ width: 400, textAlign: 'center' }}>
        
        {/* ===================== BƯỚC 1: FORM NHẬP EMAIL ===================== */}
        {step === 1 && (
          <Form name="forgot_form" onFinish={handleSendOtp} layout="vertical">
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
              Nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã OTP gồm 6 chữ số để khôi phục tài khoản.
            </Text>
            
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập Email của bạn" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Gửi mã xác nhận
              </Button>
            </Form.Item>
            
            <Link to="/login"><ArrowLeftOutlined /> Quay lại đăng nhập</Link>
          </Form>
        )}

        {/* ===================== BƯỚC 2: FORM NHẬP OTP & PASS MỚI ===================== */}
        {step === 2 && (
          <Form name="reset_form" onFinish={handleResetPassword} layout="vertical">
            <Text type="success" style={{ display: 'block', marginBottom: 20 }}>
              Mã OTP đã được gửi đến: <b>{emailToReset}</b> (Có hiệu lực 5 phút)
            </Text>

            <Form.Item name="otpCode" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
              <Input prefix={<KeyOutlined />} placeholder="Nhập mã OTP 6 số" size="large" maxLength={6} />
            </Form.Item>

            <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item 
              name="confirmPassword" 
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Xác nhận đổi mật khẩu
              </Button>
            </Form.Item>
            
            <a onClick={() => setStep(1)}><ArrowLeftOutlined /> Nhập lại Email khác</a>
          </Form>
        )}

      </Card> 
    </div>
  );
};

export default ForgotPassword;