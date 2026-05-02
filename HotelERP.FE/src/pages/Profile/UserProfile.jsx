import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Button, Upload, message, 
  Avatar, Row, Col, Divider, Typography 
} from 'antd';
import { 
  UserOutlined, UploadOutlined, LockOutlined, 
  PhoneOutlined, MailOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [formInfo] = Form.useForm();
  const [formPassword] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Lấy token và hàm cập nhật từ Zustand store
  const { token, user, login } = useAuthStore(); 

  // Gọi API lấy thông tin ngay khi vào trang
  useEffect(() => {
    fetchMyProfile();
  }, []);

  // 1. LẤY THÔNG TIN PROFILE (Khớp với [HttpGet("my-profile")])
  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://localhost:7100/api/UserProfile/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileData = res.data.data; // Vì BE trả về { success: true, data: profile }
      
      // Điền dữ liệu vào form bên trái
      formInfo.setFieldsValue({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      });
      setAvatarUrl(profileData.avatarUrl || '');
    } catch (error) {
      console.error(error);
      message.error('Không thể tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  // 2. CẬP NHẬT THÔNG TIN (Khớp với [HttpPut("update-profile")])
  const handleUpdateInfo = async (values) => {
    setSavingInfo(true);
    try {
      await axios.put('https://localhost:7100/api/UserProfile/update-profile', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Cập nhật thông tin cá nhân thành công!');
      
      // Update lại Zustand store để Header hiển thị tên mới ngay lập tức
      if (user) {
        login(
            { ...user, fullName: values.fullName }, 
            token, 
            useAuthStore.getState().refreshToken, 
            useAuthStore.getState().permissions
        );
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setSavingInfo(false);
    }
  };

  // 3. ĐỔI MẬT KHẨU (Khớp với [HttpPut("change-password")])
  const handleChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      await axios.put('https://localhost:7100/api/UserProfile/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      formPassword.resetFields(); // Xóa trắng form sau khi đổi xong
    } catch (error) {
      message.error(error.response?.data?.message || 'Mật khẩu cũ không chính xác!');
    } finally {
      setSavingPassword(false);
    }
  };

  // 4. UPLOAD ẢNH ĐẠI DIỆN (Khớp với [HttpPost("upload-avatar")])
  const handleAvatarUpload = (info) => {
    if (info.file.status === 'uploading') {
      // Đang up ảnh, có thể thêm hiệu ứng loading nếu muốn
      return;
    }
    if (info.file.status === 'done') {
      message.success('Cập nhật ảnh đại diện thành công!');
      // Backend của bạn đang trả về: { success: true, avatarUrl: "..." }
      const newAvatarUrl = info.file.response.avatarUrl;
      setAvatarUrl(newAvatarUrl);
      
      // Update store để Header hiển thị ảnh mới
      if (user) {
        login(
            { ...user, avatarUrl: newAvatarUrl }, 
            token, 
            useAuthStore.getState().refreshToken, 
            useAuthStore.getState().permissions
        );
      }
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại!');
    }
  };

  return (
    <div className="min-h-screen bg-[#262b3f] flex flex-col font-serif">
      <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center backdrop-blur-sm bg-[#262b3f]/80 fixed top-0 w-full z-10">
        <div className="text-2xl font-bold tracking-widest text-[#d4af37] cursor-pointer" onClick={() => navigate('/')}>
          ASTERIA
        </div>
        <button onClick={() => navigate('/')} className="text-[#b4976c] hover:text-[#d4af37] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider bg-transparent border-none cursor-pointer">
          <ArrowLeftOutlined /> Về trang chủ
        </button>
      </header>

      <div style={{ padding: '24px', background: 'transparent', minHeight: '80vh', marginTop: '80px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
        <style>
          {`
            .ant-form-item-label > label {
              color: rgba(255, 255, 255, 0.85) !important;
            }
            .ant-divider {
              border-color: rgba(255, 255, 255, 0.1) !important;
            }
            .ant-input, .ant-input-password {
              background: rgba(255, 255, 255, 0.05) !important;
              border-color: rgba(255, 255, 255, 0.2) !important;
              color: white !important;
            }
            .ant-input::placeholder {
              color: rgba(255, 255, 255, 0.3) !important;
            }
            .ant-input-affix-wrapper {
              background: rgba(255, 255, 255, 0.05) !important;
              border-color: rgba(255, 255, 255, 0.2) !important;
            }
            .ant-input-affix-wrapper > input.ant-input {
              background: transparent !important;
            }
            .ant-input-affix-wrapper .anticon {
              color: #b4976c !important;
            }
          `}
        </style>
        <Row gutter={[24, 24]}>
          
          {/* ==================================================== */}
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & AVATAR                 */}
          {/* ==================================================== */}
          <Col xs={24} md={14}>
            <Card loading={loading} title={<Title level={4} style={{ margin: 0, color: '#d4af37' }}>Hồ Sơ Cá Nhân</Title>} bordered={false} style={{ background: 'rgba(38,43,63,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
              
              {/* Vùng Avatar */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={110} 
                src={avatarUrl} 
                icon={!avatarUrl && <UserOutlined />} 
                style={{ marginBottom: 16, border: '3px solid #d4af37' }}
              />
              <br />
              <Upload 
                name="file" // QUAN TRỌNG: Phải trùng với tham số (IFormFile file) bên BE C#
                action="https://localhost:7100/api/UserProfile/upload-avatar" 
                headers={{ Authorization: `Bearer ${token}` }}
                showUploadList={false}
                onChange={handleAvatarUpload}
              >
                <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
              </Upload>
            </div>

            {/* Form Cập nhật thông tin */}
            <Form form={formInfo} layout="vertical" onFinish={handleUpdateInfo}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên..." size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email (Tài khoản đăng nhập)" name="email">
                    <Input prefix={<MailOutlined />} disabled size="large" style={{ backgroundColor: '#f5f5f5' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập SĐT..." size="large" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="address">
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ..." />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={savingInfo} size="large" style={{ backgroundColor: '#0f172a', color: '#d4af37', width: '100%' }}>
                Lưu Thay Đổi Thông Tin
              </Button>
            </Form>
          </Card>
        </Col>


        {/* ==================================================== */}
        {/* CỘT PHẢI: ĐỔI MẬT KHẨU                               */}
        {/* ==================================================== */}
        <Col xs={24} md={10}>
          <Card title={<Title level={4} style={{ margin: 0, color: '#d4af37' }}>Bảo Mật / Đổi Mật Khẩu</Title>} bordered={false} style={{ background: 'rgba(38,43,63,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
            <Form form={formPassword} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item 
                label="Mật khẩu hiện tại" 
                name="oldPassword" 
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" size="large" />
              </Form.Item>

              <Divider style={{ margin: '12px 0' }} />

              <Form.Item 
                label="Mật khẩu mới" 
                name="newPassword" 
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
              </Form.Item>

              <Form.Item 
                label="Xác nhận mật khẩu mới" 
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
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" size="large" />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={savingPassword} size="large" danger style={{ width: '100%', marginTop: 8 }}>
                Xác Nhận Đổi Mật Khẩu
              </Button>
            </Form>
          </Card>
        </Col>

      </Row>
      </div>
    </div>
  );
};

export default UserProfile;