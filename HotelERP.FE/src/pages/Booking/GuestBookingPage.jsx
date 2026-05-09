import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Divider, Space, Tag } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, TagOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
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

// Custom Premium Input Style - Cập nhật cho Dark Mode
const premiumInputStyle = {
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '12px 16px',
  fontSize: '15px',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#ffffff', // Chữ trắng
  boxShadow: 'none',
};

const premiumInputHoverStyle = `
  .premium-input:focus, .premium-input:hover {
    border-color: ${GOLD} !important;
    background: rgba(184, 149, 106, 0.05) !important;
    box-shadow: 0 0 0 2px rgba(184, 149, 106, 0.1) !important;
  }
  .premium-input::placeholder {
    color: rgba(255, 255, 255, 0.3) !important;
  }
`;

export default function GuestBookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fallback if no state
  if (!state) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', color: 'white' }}>
        <p>Không có thông tin phòng. Vui lòng quay lại tìm kiếm.</p>
        <Button onClick={() => navigate('/booking/search')}>Quay lại tìm kiếm</Button>
      </div>
    );
  }

  const { user, isAuthenticated } = useAuthStore();

  const {
    roomTypeId, roomName, basePrice,
    checkIn, checkOut, adults, children, rooms, nights,
    selectedRoomId = null, selectedRoomNumber = null, selectedFloor = null,
    cartItems = null,
  } = state;

  const resolvedCart = cartItems ?? (roomTypeId ? [{
    roomTypeId, roomName, basePrice,
    roomId: selectedRoomId, roomNumber: selectedRoomNumber, floor: selectedFloor,
  }] : []);

  const subtotal = resolvedCart.reduce((s, c) => s + (c.basePrice ?? 0) * (nights ?? 1), 0);
  
  // NEW: Membership Discount
  const memDiscountPercent = user?.membershipDiscount ?? 0;
  const memDiscountAmount = Math.round(subtotal * (memDiscountPercent / 100));
  
  const totalPrice = subtotal - memDiscountAmount - discountAmount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã voucher');
      return;
    }
    setValidatingVoucher(true);
    try {
      const res = await bookingApi.validateVoucher(voucherCode.trim(), subtotal);
      const resData = res?.data ?? res;
      if (resData?.success) {
        const voucher = resData.data;
        setAppliedVoucher(voucher);
        
        let discount = 0;
        if (voucher.discountType === 'PERCENT') {
          discount = subtotal * (voucher.discountValue / 100);
        } else {
          discount = voucher.discountValue;
        }
        
        if (discount > subtotal) discount = subtotal;
        setDiscountAmount(discount);
        message.success('Áp dụng mã giảm giá thành công!');
      } else {
        // Dịch lỗi từ Backend sang tiếng Việt
        const errorMsg = resData?.message || '';
        let displayMsg = 'Mã voucher không hợp lệ.';
        
        if (errorMsg === 'VOUCHER_NOT_FOUND') displayMsg = 'Mã giảm giá không tồn tại.';
        else if (errorMsg === 'VOUCHER_NOT_STARTED') displayMsg = 'Mã giảm giá này chưa đến thời gian sử dụng.';
        else if (errorMsg === 'VOUCHER_EXPIRED') displayMsg = 'Mã giảm giá này đã hết hạn.';
        else if (errorMsg === 'VOUCHER_USAGE_LIMIT_EXCEEDED') displayMsg = 'Mã giảm giá này đã hết lượt sử dụng.';
        else if (errorMsg === 'MIN_BOOKING_NOT_MET') displayMsg = 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.';
        
        message.error(displayMsg);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Không thể kiểm tra mã voucher lúc này.';
      message.error(errMsg);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCode('');
    message.info('Đã gỡ mã giảm giá.');
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        GuestName:  values.fullName,
        GuestPhone: values.phone,
        GuestEmail: values.email || '',
        Notes:      values.notes || '',
        VoucherCode: appliedVoucher ? appliedVoucher.code : null,
        Items: resolvedCart.map(item => ({
          RoomTypeId:  item.roomTypeId,
          Quantity:    1,
          CheckInDate:  checkIn,
          CheckOutDate: checkOut,
          RoomIds: item.roomId ? [item.roomId] : [],
        }))
      };

      const res = await bookingApi.createMultiBooking(payload);
      const resData = res?.data ?? res;
      if (resData?.success || resData?.bookingId) {
        const code = resData.bookingCode || (resData.bookingId ? `BK-${resData.bookingId.toString().padStart(6, '0')}` : 'Thành công');
        setSuccessCode(code);
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
      <div style={{ background: '#0d0d0d', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        <Header />
        <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 600, margin: '0 auto', paddingInline: 24 }}>
          <div style={{ background: '#1a1a1a', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.2)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#16a34a', marginBottom: 24 }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'white', margin: '0 0 16px' }}>Đặt Phòng Thành Công!</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Cảm ơn bạn đã lựa chọn Asteria Resort. Thông tin đặt phòng của bạn đã được ghi nhận. 
              Mã đặt phòng của bạn là lời cam kết của chúng tôi cho một kỳ nghỉ tuyệt vời.
            </p>
            <div style={{ background: 'rgba(184,149,106,0.1)', padding: 20, borderRadius: 8, marginBottom: 32, border: '1px dashed #b8956a' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mã đặt phòng của quý khách</p>
              <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: GOLD }}>#{successCode}</p>
            </div>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/')}
              style={{ background: GOLD, borderColor: GOLD, color: 'white', width: '100%', height: 48, fontWeight: 600, letterSpacing: '1px' }}
            >
              VỀ TRANG CHỦ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white' }}>
      <style>{premiumInputHoverStyle}</style>
      <Header />

      <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 1000, margin: '0 auto', paddingInline: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', margin: '0 0 32px' }}>
          Hoàn tất đặt phòng
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
          
          {/* CỘT TRÁI: Form điền thông tin */}
          <div style={{ background: '#1a1a1a', padding: 32, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', width: 24, height: 24, background: GOLD, color: 'white', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>1</span>
              Thông tin liên hệ
            </h2>
            
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinish} 
              requiredMark="optional"
              initialValues={{
                fullName: user?.fullName || '',
                phone: user?.phone || '',
                email: user?.email || ''
              }}
            >
              <Form.Item 
                name="fullName" 
                label={<span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Họ và tên khách lưu trú</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input className="premium-input" size="large" placeholder="Ví dụ: Nguyễn Văn Asteria" style={premiumInputStyle} />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Form.Item 
                  name="phone" 
                  label={<span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Số điện thoại</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input className="premium-input" size="large" placeholder="090 123 4567" style={premiumInputStyle} />
                </Form.Item>

                <Form.Item 
                  name="email" 
                  label={<span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Email <small style={{fontWeight: 400, color: 'rgba(255,255,255,0.45)'}}>(Tùy chọn)</small></span>}
                  rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input className="premium-input" size="large" placeholder="guest@example.com" style={premiumInputStyle} />
                </Form.Item>
              </div>

              <Divider style={{ margin: '32px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', width: 24, height: 24, background: GOLD, color: 'white', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>2</span>
                Yêu cầu bổ sung
              </h2>

              <Form.Item name="notes" label={<span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Ghi chú đặc biệt <small style={{fontWeight: 400, color: 'rgba(255,255,255,0.45)'}}>(Tùy chọn)</small></span>}>
                <Input.TextArea className="premium-input" rows={4} placeholder="Ví dụ: Tôi muốn yêu cầu phòng yên tĩnh hoặc quà tặng bất ngờ cho kỷ niệm ngày cưới..." style={{...premiumInputStyle, padding: '14px'}} />
              </Form.Item>
            </Form>
          </div>

          {/* CỘT PHẢI: Tóm tắt Đơn đặt phòng */}
          <div>
            <div style={{ background: '#1a1a1a', padding: 32, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'sticky', top: 90 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'white', margin: '0 0 24px' }}>
                Chi tiết đặt phòng
              </h2>

              {/* Room details */}
              <div style={{ marginBottom: 24 }}>
                {resolvedCart.length > 1 ? (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 12 }}>{resolvedCart.length} phòng đã chọn</div>
                    {resolvedCart.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8, fontSize: 14 }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'white' }}>P.{item.roomNumber}</span>
                          {item.floor && <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 6 }}>Tầng {item.floor}</span>}
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{item.roomName}</div>
                        </div>
                        <span style={{ color: GOLD, fontWeight: 600 }}>{formatVND(item.basePrice)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 17, fontWeight: 600, color: 'white', marginBottom: 6 }}>{resolvedCart[0]?.roomName}</div>
                    {resolvedCart[0]?.roomNumber && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)', borderRadius: 6, padding: '6px 14px', marginBottom: 16, fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
                        <CheckCircleOutlined /> <span>Phòng {resolvedCart[0].roomNumber} · Tầng {resolvedCart[0].floor}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 6 }}><span>Nhận phòng:</span><span style={{ fontWeight: 500, color: 'white' }}>{formatDateVI(checkIn)} (14:00)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 6 }}><span>Trả phòng:</span><span style={{ fontWeight: 500, color: 'white' }}>{formatDateVI(checkOut)} (12:00)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}><span>Khách:</span><span style={{ color: 'white' }}>{adults} Người lớn{children > 0 ? `, ${children} Trẻ em` : ''}</span></div>
              </div>

              <Divider style={{ margin: '24px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* VOUCHER SECTION */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'white', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TagOutlined style={{color: GOLD}} /> Mã giảm giá (Voucher)
                </p>
                {!appliedVoucher ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input 
                      placeholder="Nhập mã ưu đãi..." 
                      value={voucherCode}
                      onChange={e => setVoucherCode(e.target.value)}
                      style={{ ...premiumInputStyle, height: 44, padding: '0 16px' }}
                      className="premium-input"
                    />
                    <Button 
                      onClick={handleApplyVoucher} 
                      loading={validatingVoucher}
                      style={{ height: 44, borderColor: GOLD, color: GOLD, background: 'transparent', fontWeight: 600 }}
                    >
                      ÁP DỤNG
                    </Button>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.2)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color="success" style={{margin: 0, fontWeight: 600}}>{appliedVoucher.code}</Tag>
                      <span style={{ fontSize: 13, color: '#4ade80', marginLeft: 8 }}>Đã áp dụng ưu đãi</span>
                    </div>
                    <Button type="text" danger icon={<CloseCircleOutlined />} onClick={removeVoucher} />
                  </div>
                )}
              </div>

              {/* Price summary */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>
                  <span>Giá tạm tính ({rooms} phòng × {nights} đêm)</span>
                  <span style={{fontWeight: 500, color: 'white'}}>{formatVND(subtotal)}</span>
                </div>
                {memDiscountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: GOLD, fontSize: 14, marginBottom: 12 }}>
                    <span>Ưu đãi hội viên ({user.membershipTier})</span>
                    <span style={{fontWeight: 600}}>- {formatVND(memDiscountAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontSize: 14, marginBottom: 12 }}>
                    <span>Voucher giảm giá</span>
                    <span style={{fontWeight: 600}}>- {formatVND(discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>
                  <span>Phí dịch vụ & Thuế (VAT)</span>
                  <span>Đã bao gồm</span>
                </div>
                <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Tổng thanh toán</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: GOLD }}>
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(184,149,106,0.05)', border: `1px solid rgba(184,149,106,0.2)`, borderRadius: 8, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12 }}>
                <InfoCircleOutlined style={{ color: GOLD, fontSize: 18, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  <strong style={{ color: GOLD }}>Thanh toán tại Resort:</strong> Quý khách sẽ thanh toán trực tiếp khi nhận phòng. Asteria Resort không yêu cầu trả trước hay thẻ tín dụng cho đặt phòng này.
                </span>
              </div>

              <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
                style={{ 
                  background: GOLD, borderColor: GOLD, width: '100%', height: 54, color: 'white',
                  fontSize: 14, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(184,149,106,0.3)'
                }}
              >
                XÁC NHẬN ĐẶT PHÒNG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
