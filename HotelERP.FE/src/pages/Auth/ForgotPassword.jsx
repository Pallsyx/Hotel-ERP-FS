import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const { Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailToReset, setEmailToReset] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email });
      setEmailToReset(values.email);
      message.success('Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center relative bg-[#262b3f] font-serif overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 fixed"
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

      {/* Forgot Password Card with Glassmorphism */}
      <div className="z-10 w-full max-w-md mx-4 p-10 bg-[#262b3f]/60 backdrop-blur-xl rounded-3xl shadow-[0_15px_40px_0_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden mt-12 md:mt-0">
        
        {/* Subtle Gold Glow Effect inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b4976c] rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#b4976c] rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-white text-4xl font-serif tracking-[0.3em] uppercase mb-4 drop-shadow-md">Asteria</h1>
          <div className="h-[1px] w-16 bg-[#b4976c] mx-auto mb-4"></div>
          <p className="text-[#b4976c] text-[10px] tracking-[0.2em] uppercase font-bold">{step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}</p>
        </div>
        
        {/* ===================== BƯỚC 1: FORM NHẬP EMAIL ===================== */}
        {step === 1 && (
          <Form name="forgot_form" onFinish={handleSendOtp} layout="vertical" className="relative z-10">
            <p className="text-gray-300 text-xs tracking-widest leading-relaxed mb-8 text-center font-serif">
              Nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã OTP gồm 6 chữ số để khôi phục tài khoản.
            </p>
            
            <Form.Item 
              name="email" 
              rules={[
                { required: true, message: 'Vui lòng nhập Email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
              className="mb-8"
            >
              <Input 
                prefix={<MailOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />} 
                placeholder="Email của bạn" 
                size="large" 
                className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all font-sans"
              />
            </Form.Item>

            <Form.Item className="mb-8">
              <Button 
                htmlType="submit" 
                loading={loading}
                className="w-full h-[50px] !bg-[#b4976c] hover:!bg-[#c9a97b] border-none !text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(180,151,108,0.4)] hover:shadow-[0_6px_20px_rgba(180,151,108,0.6)] flex items-center justify-center font-serif"
              >
                GỬI MÃ XÁC NHẬN
              </Button>
            </Form.Item>
            
            <div className="text-center">
              <Link to="/login" className="text-gray-400 hover:text-[#b4976c] text-[11px] tracking-widest uppercase font-serif transition-colors group flex items-center justify-center gap-2">
                <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" /> <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </Form>
        )}

        {/* ===================== BƯỚC 2: FORM NHẬP OTP & PASS MỚI ===================== */}
        {step === 2 && (
          <Form name="reset_form" onFinish={handleResetPassword} layout="vertical" className="relative z-10">
            <div className="mb-8 text-center bg-white/5 py-4 px-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-serif">Mã OTP đã gửi đến</p>
              <p className="text-[#b4976c] font-bold tracking-wider mb-2">{emailToReset}</p>
              <p className="text-gray-500 text-[10px] italic tracking-widest font-serif">(Có hiệu lực 5 phút)</p>
            </div>

            <Form.Item name="otpCode" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]} className="mb-6">
              <Input 
                prefix={<KeyOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />} 
                placeholder="Nhập mã OTP 6 số" 
                size="large" 
                maxLength={6} 
                className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all text-center tracking-[0.5em] font-mono text-lg"
              />
            </Form.Item>

            <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu mới!' }]} className="mb-6">
              <Input.Password 
                prefix={<LockOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />} 
                placeholder="Mật khẩu mới" 
                size="large" 
                className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all font-sans"
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
              className="mb-8"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-[#b4976c] opacity-80 mr-3 text-lg" />} 
                placeholder="Xác nhận mật khẩu mới" 
                size="large" 
                className="h-[50px] bg-white/5 border border-white/20 text-white placeholder-gray-400 hover:border-[#b4976c]/50 focus:border-[#b4976c] rounded-lg focus:bg-white/10 transition-all font-sans"
              />
            </Form.Item>

            <Form.Item className="mb-8">
              <Button 
                htmlType="submit" 
                loading={loading}
                className="w-full h-[50px] !bg-[#b4976c] hover:!bg-[#c9a97b] border-none !text-white text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(180,151,108,0.4)] hover:shadow-[0_6px_20px_rgba(180,151,108,0.6)] flex items-center justify-center font-serif"
              >
                XÁC NHẬN ĐỔI MẬT KHẨU
              </Button>
            </Form.Item>
            
            <div className="text-center">
              <a onClick={() => setStep(1)} className="text-gray-400 hover:text-[#b4976c] text-[11px] tracking-widest uppercase font-serif cursor-pointer transition-colors group flex items-center justify-center gap-2">
                <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" /> <span>Nhập lại Email khác</span>
              </a>
            </div>
          </Form>
        )}
      </div> 
    </div>
  );
};

export default ForgotPassword;