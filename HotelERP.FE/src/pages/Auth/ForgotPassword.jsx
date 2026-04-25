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
          <p className="text-gray-400 text-sm tracking-widest uppercase">{step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}</p>
        </div>
        
        {/* ===================== BƯỚC 1: FORM NHẬP EMAIL ===================== */}
        {step === 1 && (
          <Form name="forgot_form" onFinish={handleSendOtp} layout="vertical">
            <p className="text-gray-300 text-sm mb-6 text-center">
              Nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã OTP gồm 6 chữ số để khôi phục tài khoản.
            </p>
            
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-[#b4976c]" />} 
                placeholder="Nhập Email của bạn" 
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
                GỬI MÃ XÁC NHẬN
              </Button>
            </Form.Item>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-[#b4976c] hover:text-[#8e7654] font-bold transition-colors">
                <ArrowLeftOutlined className="mr-2" /> Quay lại đăng nhập
              </Link>
            </div>
          </Form>
        )}

        {/* ===================== BƯỚC 2: FORM NHẬP OTP & PASS MỚI ===================== */}
        {step === 2 && (
          <Form name="reset_form" onFinish={handleResetPassword} layout="vertical">
            <p className="text-[#b4976c] text-sm mb-6 text-center bg-[#b4976c]/10 p-3 rounded-lg border border-[#b4976c]/20">
              Mã OTP đã được gửi đến: <br/><b className="text-white">{emailToReset}</b><br/>(Có hiệu lực 5 phút)
            </p>

            <Form.Item name="otpCode" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
              <Input 
                prefix={<KeyOutlined className="text-[#b4976c]" />} 
                placeholder="Nhập mã OTP 6 số" 
                size="large" 
                maxLength={6} 
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
                style={{ colorScheme: 'dark' }}
              />
            </Form.Item>

            <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
              <Input.Password 
                prefix={<LockOutlined className="text-[#b4976c]" />} 
                placeholder="Mật khẩu mới" 
                size="large" 
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 hover:border-[#b4976c] focus:border-[#b4976c]"
                style={{ colorScheme: 'dark' }}
              />
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
              <Input.Password 
                prefix={<LockOutlined className="text-[#b4976c]" />} 
                placeholder="Xác nhận mật khẩu mới" 
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
                XÁC NHẬN ĐỔI MẬT KHẨU
              </Button>
            </Form.Item>
            
            <div className="text-center mt-4">
              <a onClick={() => setStep(1)} className="text-gray-400 hover:text-white cursor-pointer transition-colors">
                <ArrowLeftOutlined className="mr-2" /> Nhập lại Email khác
              </a>
            </div>
          </Form>
        )}

      </div> 
    </div>
  );
};

export default ForgotPassword;