import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Divider, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import bookingApi from '../../api/bookingApi';

const GOLD = '#b8956a';
const DARK = '#111111';

/* ── Simple shared header ── */
function Header() {
  const navigate = useNavigate();
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: DARK, boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 30, height: 30, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 14, color: 'white' }}>A</div>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Asteria Resort</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', padding: '7px 16px', borderRadius: 3, fontSize: 11, cursor: 'pointer', fontWeight: 600, letterSpacing: '1px', transition: 'all 200ms' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
          ← Quay lại
        </button>
      </div>
    </header>
  );
}

function formatVND(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function formatDateVI(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function GuestBookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState(null);

  // Fallback if no state
  if (!state) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <p>Không có thông tin phòng. Vui lòng quay lại tìm kiếm.</p>
        <Button onClick={() => navigate('/booking/search')}>Quay lại tìm kiếm</Button>
      </div>
    );
  }

  const {
    roomTypeId,
    roomName,
    basePrice,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    nights
  } = state;

  const totalPrice = basePrice * nights * rooms;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        GuestName: values.fullName,
        GuestPhone: values.phone,
        GuestEmail: values.email,
        Notes: values.notes || '',
        VoucherCode: values.voucherCode || null,
        Items: [
          {
            RoomTypeId: roomTypeId,
            Quantity: rooms,
            CheckInDate: checkIn,
            CheckOutDate: checkOut
          }
        ]
      };

      const res = await bookingApi.createMultiBooking(payload);
      // axiosClient trả về full axios response → cần đọc res.data
      const resData = res?.data ?? res;
      console.log('[GuestBooking] API response:', resData);
      if (resData?.success || resData?.bookingId) {
        setSuccessCode(resData.bookingId || 'Thành công');
      } else {
        message.error(resData?.message || 'Đặt phòng thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('[GuestBooking] Error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn đặt phòng!';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (successCode) {
    return (
      <div style={{ background: '#f5f5f4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        <Header />
        <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#16a34a', marginBottom: 24 }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#18181b', margin: '0 0 16px' }}>Đặt Phòng Thành Công!</h1>
            <p style={{ color: '#52525b', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Cảm ơn bạn đã lựa chọn Asteria Resort. Thông tin đặt phòng của bạn đã được ghi nhận. 
              Vui lòng giữ lại mã đặt phòng hoặc kiểm tra email (nếu có) để xem chi tiết.
            </p>
            <div style={{ background: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 32, border: '1px dashed #d9d9d9' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>Mã đặt phòng</p>
              <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: GOLD }}>#{successCode}</p>
            </div>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/')}
              style={{ background: DARK, borderColor: DARK, width: '100%', height: 48, fontWeight: 600, letterSpacing: '1px' }}
            >
              VỀ TRANG CHỦ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 1000, margin: '0 auto', paddingInline: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#18181b', margin: '0 0 32px' }}>
          Hoàn tất đặt phòng
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
          
          {/* CỘT TRÁI: Form điền thông tin */}
          <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181b', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', width: 24, height: 24, background: GOLD, color: 'white', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>1</span>
              Thông tin liên hệ
            </h2>
            
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
              <Form.Item 
                name="fullName" 
                label={<span style={{ fontWeight: 500, color: '#3f3f46' }}>Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" style={{ padding: '10px 14px' }} />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item 
                  name="phone" 
                  label={<span style={{ fontWeight: 500, color: '#3f3f46' }}>Số điện thoại</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input size="large" placeholder="090 123 4567" style={{ padding: '10px 14px' }} />
                </Form.Item>

                <Form.Item 
                  name="email" 
                  label={<span style={{ fontWeight: 500, color: '#3f3f46' }}>Email (Tùy chọn)</span>}
                  rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input size="large" placeholder="email@example.com" style={{ padding: '10px 14px' }} />
                </Form.Item>
              </div>

              <Divider style={{ margin: '24px 0' }} />

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181b', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', width: 24, height: 24, background: GOLD, color: 'white', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>2</span>
                Yêu cầu bổ sung
              </h2>

              <Form.Item name="notes" label={<span style={{ fontWeight: 500, color: '#3f3f46' }}>Ghi chú đặc biệt (Tùy chọn)</span>}>
                <Input.TextArea rows={4} placeholder="Ví dụ: Yêu cầu phòng tầng cao, dị ứng hoa..." style={{ padding: '10px 14px' }} />
              </Form.Item>
            </Form>
          </div>

          {/* CỘT PHẢI: Tóm tắt Đơn đặt phòng */}
          <div>
            <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'sticky', top: 90 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#18181b', margin: '0 0 24px' }}>
                Chi tiết đặt phòng
              </h2>

              {/* Room details */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#18181b', marginBottom: 8 }}>{roomName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: 14, marginBottom: 4 }}>
                  <span>Nhận phòng:</span>
                  <span style={{ fontWeight: 500 }}>{formatDateVI(checkIn)} (14:00)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: 14, marginBottom: 4 }}>
                  <span>Trả phòng:</span>
                  <span style={{ fontWeight: 500 }}>{formatDateVI(checkOut)} (12:00)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: 14 }}>
                  <span>Khách:</span>
                  <span>{adults} Người lớn{children > 0 ? `, ${children} Trẻ em` : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: 14, marginTop: 4 }}>
                  <span>Số lượng:</span>
                  <span>{rooms} Phòng × {nights} Đêm</span>
                </div>
              </div>

              <Divider style={{ margin: '20px 0' }} />

              {/* Price summary */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: 14, marginBottom: 12 }}>
                  <span>Giá gốc ({rooms} phòng × {nights} đêm)</span>
                  <span>{formatVND(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: 14, marginBottom: 12 }}>
                  <span>Thuế & Phí dịch vụ (Đã bao gồm)</span>
                  <span>0 đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#18181b' }}>Tổng thanh toán</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: GOLD }}>
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>

              <div style={{ background: '#fdf8f3', border: `1px solid rgba(184,149,106,0.3)`, borderRadius: 6, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12 }}>
                <InfoCircleOutlined style={{ color: GOLD, fontSize: 18, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
                  Bạn sẽ thanh toán trực tiếp tại quầy Lễ tân khi nhận phòng. Không yêu cầu thẻ tín dụng lúc này.
                </span>
              </div>

              <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
                style={{ 
                  background: DARK, borderColor: DARK, width: '100%', height: 50, 
                  fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase'
                }}
              >
                Xác nhận Đặt phòng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
