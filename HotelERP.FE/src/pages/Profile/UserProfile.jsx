import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Tabs } from 'antd';
import { 
  UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, HomeOutlined, 
  CameraOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined,
  TagOutlined, BellOutlined, HeartOutlined, LogoutOutlined, CalendarOutlined
} from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import userProfileApi from '../../api/userProfileApi';
import voucherApi from '../../api/voucherApi';
import MainFooter from '../../components/Layout/MainFooter';

const G = '#b8956a';
const SF = { fontFamily: "'Playfair Display', serif" };
const API = 'http://localhost:5080';

// ── Input component theo theme ───────────────────────────────
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled = false, required = false }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: required ? G : 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          {required && <span style={{ color: G, marginRight: 4 }}>*</span>}{label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 14, zIndex: 1 }} />}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: `13px 16px 13px ${Icon ? '40px' : '16px'}`,
            paddingRight: isPassword ? 44 : 16,
            background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 4, color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
            fontSize: 14, outline: 'none', transition: 'border-color 200ms',
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = G; }}
          onBlur={e => e.target.style.borderColor = disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)'}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
            {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section title ────────────────────────────────────────────
function SectionTitle({ label, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 8 }}>{sub}</span>
      <h2 style={{ ...SF, fontSize: 24, color: 'white', margin: 0, fontWeight: 400 }}>{label}</h2>
      <div style={{ width: 32, height: 1, background: G, marginTop: 12 }} />
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, login, logout } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [sc, setSc] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('profile'); 
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [vouchers, setVouchers] = useState([]);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Password form state
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    const f = () => setSc(window.scrollY > 50);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  const handleSyncPoints = async () => {
    try {
      const res = await userProfileApi.syncPoints();
      const data = res.data;
      if (data.success) {
        message.success(data.message);
        fetchProfile();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Lỗi khi đồng bộ điểm');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    document.title = 'Hồ Sơ Cá Nhân - Asteria Resort';
    if (!token) {
        navigate('/login');
        return;
    }
    fetchProfile();
    fetchMyBookings();
    fetchVouchers();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userProfileApi.getMyProfile();
      const d = res.data.data || res.data;
      setProfileData(d);
      setFullName(d.fullName || '');
      setEmail(d.email || '');
      setPhone(d.phone || '');
      setAddress(d.address || '');
      // Format date YYYY-MM-DD for input type="date"
      if (d.dateOfBirth) {
        setDateOfBirth(d.dateOfBirth.split('T')[0]);
      } else {
        setDateOfBirth('');
      }
      setAvatarUrl(d.avatarUrl || '');
      setLoyaltyPoints(d.loyaltyPoints || 0);
    } catch {
      message.error('Không thể tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await userProfileApi.getMyBookings();
      setMyBookings(res.data.data || []);
    } catch {
      message.error('Không thể tải lịch sử đặt phòng!');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const r = await voucherApi.getAll();
      // Filter for user-specific vouchers or just show all for now
      setVouchers(Array.isArray(r) ? r : (r?.data || []));
    } catch {
      console.error('Failed to fetch vouchers');
    }
  };

  const [redeemLoading, setRedeemLoading] = useState(false);
  const handleRedeemPoints = async (pts) => {
    setRedeemLoading(true);
    try {
      await userProfileApi.redeemPoints(pts);
      message.success('Quy đổi điểm thành công!');
      // Update local loyalty points
      if (user) {
        const newPoints = user.loyaltyPoints - pts;
        login({ ...user, loyaltyPoints: newPoints }, token, useAuthStore.getState().refreshToken, useAuthStore.getState().permissions);
      }
      fetchVouchers(); // Refresh voucher list
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi quy đổi điểm!');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { message.warning('Vui lòng nhập họ và tên!'); return; }
    setSavingInfo(true);
    try {
      await userProfileApi.updateProfile({ fullName, phone, address, dateOfBirth: dateOfBirth || null });
      message.success('Cập nhật thông tin thành công!');
      if (user) {
        login({ ...user, fullName }, token, useAuthStore.getState().refreshToken, useAuthStore.getState().permissions);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (!oldPwd) { message.warning('Vui lòng nhập mật khẩu hiện tại!'); return; }
    if (newPwd.length < 6) { message.warning('Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
    if (newPwd !== confirmPwd) { message.warning('Mật khẩu xác nhận không khớp!'); return; }
    setSavingPwd(true);
    try {
      await userProfileApi.changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      message.success('Đổi mật khẩu thành công!');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      message.error(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác!');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await userProfileApi.uploadAvatar(formData);
      const newUrl = res.data.avatarUrl;
      setAvatarUrl(newUrl);
      if (user) {
        login({ ...user, avatarUrl: newUrl }, token, useAuthStore.getState().refreshToken, useAuthStore.getState().permissions);
      }
      message.success('Cập nhật ảnh đại diện thành công!');
    } catch {
      message.error('Tải ảnh thất bại!');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success(`Đã sao chép mã: ${code}`);
    });
  };

  const initials = fullName ? fullName.trim().split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : '?';

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', fontFamily: "'Inter', sans-serif", color: 'white' }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.06) inset !important; -webkit-text-fill-color: white !important; }
        input[type=password]::-ms-reveal { display: none; }
        ::placeholder { color: rgba(255,255,255,0.25) !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: sc ? 'rgba(13,13,13,0.98)' : 'transparent',
        backdropFilter: sc ? 'blur(20px)' : 'none',
        borderBottom: sc ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 400ms', padding: '0 clamp(24px,5vw,80px)',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, border: `1px solid ${G}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SF, fontSize: 12, color: G }}>A</div>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>Asteria Resort</span>
        </div>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid rgba(255,255,255,0.15)`,
          color: 'rgba(255,255,255,0.7)', padding: '8px 20px', borderRadius: 2, cursor: 'pointer',
          fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'all 200ms'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = G; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
          <ArrowLeftOutlined style={{ fontSize: 11 }} /> Trang Chủ
        </button>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1209 30%, #2a1d0e 50%, #1a1209 70%, #0d0d0d 100%)',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#b8956a" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <div style={{ position: 'absolute', top: -60, left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.6) 70%, rgba(13,13,13,1) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 'clamp(24px,6vw,120px)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 10 }}>Tài Khoản Của Tôi</span>
          <h1 style={{ ...SF, fontSize: 'clamp(28px,4vw,44px)', color: 'white', margin: 0, fontWeight: 400 }}>Hồ Sơ Cá Nhân</h1>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(24px,5vw,60px) 80px' }}>

        {/* ── AVATAR CARD ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(184,149,106,0.12), rgba(184,149,106,0.04))',
          border: '1px solid rgba(184,149,106,0.2)', borderRadius: 8,
          padding: '32px 40px', marginBottom: 32, marginTop: -32,
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: `2px solid ${G}`, overflow: 'hidden',
              background: `linear-gradient(135deg, ${G}40, ${G}20)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ ...SF, fontSize: 32, color: G, fontWeight: 500 }}>{initials}</span>
              }
            </div>
            <label htmlFor="avatar-upload" style={{
              position: 'absolute', bottom: 0, right: 0, width: 32, height: 32,
              background: G, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', border: '2px solid #0d0d0d',
              transition: 'transform 200ms',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <CameraOutlined style={{ color: 'white', fontSize: 13 }} />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ ...SF, fontSize: 26, color: 'white', margin: '0 0 6px', fontWeight: 400 }}>
              {loading ? '...' : (fullName || 'Khách hàng')}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{email}</p>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: G, background: `${G}18`, padding: '3px 10px', borderRadius: 999 }}>
              {user?.roleName || 'Thành Viên'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 40 }}>
            {(() => {
              const p = loyaltyPoints || 0;
              let tName = 'CLASSIC', tColor = '#78716c';
              if (p >= 70000) { tName = 'PLATINUM'; tColor = 'white'; }
              else if (p >= 20000) { tName = 'GOLD'; tColor = '#d4af37'; }
              else if (p >= 1500) { tName = 'SILVER'; tColor = '#a1a1aa'; }
              
              return [['Hạng Thẻ', tName, tColor], ['Điểm Tích Lũy', p + 'P', G], ['Lượt Ở', myBookings.length.toString(), G]].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ ...SF, fontSize: 22, color: c, fontWeight: 500, letterSpacing: '1px' }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            { id: 'profile', label: 'Hồ Sơ & Bảo Mật' },
            { id: 'bookings', label: 'Lịch Sử Đặt Phòng' },
            { id: 'vouchers', label: 'Phiếu Giảm Giá' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: 'none', border: 'none', padding: '0 0 16px', cursor: 'pointer',
              color: activeTab === tab.id ? G : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              borderBottom: `2px solid ${activeTab === tab.id ? G : 'transparent'}`,
              transition: 'all 200ms',
            }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── NỘI DUNG ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '36px 36px 40px', backdropFilter: 'blur(10px)' }}>
              <SectionTitle label="Thông Tin Cá Nhân" sub="Hồ sơ" />
              <form onSubmit={handleUpdateInfo}>
                <Field label="Họ và Tên" icon={UserOutlined} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nhập họ và tên..." required />
                <Field label="Email" icon={MailOutlined} value={email} disabled />
                <Field label="Số điện thoại" icon={PhoneOutlined} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" />
                <Field 
                  label="Ngày sinh (Chỉ được đặt 1 lần)" 
                  icon={CalendarOutlined} 
                  type="date" 
                  value={dateOfBirth} 
                  onChange={e => setDateOfBirth(e.target.value)} 
                  disabled={!!(profileData && profileData.dateOfBirth)} 
                />
                <Field label="Địa chỉ" icon={HomeOutlined} value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ của bạn" />
                <button type="submit" disabled={savingInfo} style={{ width: '100%', padding: '14px', background: G, border: 'none', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>Lưu Thay Đổi</button>
              </form>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '36px 36px 40px', backdropFilter: 'blur(10px)' }}>
              <SectionTitle label="Bảo Mật" sub="Mật khẩu" />
              <form onSubmit={handleChangePwd}>
                <Field label="Mật khẩu hiện tại" icon={LockOutlined} type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required />
                <Field label="Mật khẩu mới" icon={LockOutlined} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
                <button type="submit" disabled={savingPwd} style={{ width: '100%', padding: '14px', background: 'transparent', border: `1px solid ${G}`, color: G, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>Đổi Mật Khẩu</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '36px', backdropFilter: 'blur(10px)' }}>
            <SectionTitle label="Lịch Sử Đặt Phòng" sub="Đơn hàng" />
            {loadingBookings ? <p>Đang tải...</p> : myBookings.length === 0 ? <p>Bạn chưa có đơn nào.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {myBookings.map(b => (
                  <div key={b.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 24, background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: G, fontWeight: 700, fontSize: 14, letterSpacing: '1px' }}>#{b.bookingCode}</span>
                        {/* Status Badges */}
                        {b.status === 'Pending' && <span style={{ color: '#eab308', background: 'rgba(234,179,8,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Chờ xử lý</span>}
                        {b.status === 'Confirmed' && <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Đã xác nhận</span>}
                        {b.status === 'Cancelled' && <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Đã hủy</span>}
                        {b.status === 'Checked_in' && <span style={{ color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Đã nhận phòng</span>}
                        {b.status === 'Completed' && <span style={{ color: '#64748b', background: 'rgba(100,116,139,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Hoàn tất</span>}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px' }}>Ngày đặt: {new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {b.details?.map((d, i) => (
                        <div key={i} style={{ paddingBottom: 12, borderBottom: i === b.details.length - 1 ? 'none' : '1px dashed rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{d.roomTypeName}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{d.lineTotal.toLocaleString()}₫</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CalendarOutlined style={{ fontSize: 11 }} />
                            <span>{new Date(d.checkInDate).toLocaleDateString('vi-VN')} – {new Date(d.checkOutDate).toLocaleDateString('vi-VN')}</span>
                            <span style={{ color: G, fontWeight: 600 }}>({d.nights} đêm)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng thanh toán</span>
                      <span style={{ color: G, fontSize: 20, fontWeight: 700, ...SF }}>{b.finalAmount?.toLocaleString()}₫</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '36px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
              <SectionTitle label="Phiếu Giảm Giá Của Tôi" sub="Ưu đãi & Đặc quyền" />
              <div style={{ 
                background: 'rgba(184,149,106,0.1)', border: '1px solid rgba(184,149,106,0.2)', 
                padding: '16px 24px', borderRadius: 12, textAlign: 'right', position: 'relative',
                minWidth: 200
              }}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Điểm tích lũy</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                  <button 
                    onClick={handleSyncPoints}
                    title="Cập nhật điểm"
                    style={{
                      background: 'none', border: 'none', color: G, cursor: 'pointer', padding: 4, display: 'flex',
                      transition: 'transform 300ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  </button>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white', ...SF }}>
                    {loyaltyPoints.toLocaleString()} <span style={{ fontSize: 14, color: G }}>P</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Redeem Section */}
            <div style={{ marginBottom: 48, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h4 style={{ ...SF, fontSize: 18, color: 'white', margin: '0 0 8px' }}>Quy đổi điểm thưởng</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Đổi điểm tích lũy lấy các gói voucher giảm giá trực tiếp vào hóa đơn.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { pts: 500, val: '50.000₫' },
                  { pts: 1000, val: '100.000₫' },
                  { pts: 2000, val: '220.000₫' },
                  { pts: 5000, val: '600.000₫' }
                ].map(opt => (
                  <button 
                    key={opt.pts}
                    disabled={redeemLoading || (user?.loyaltyPoints || 0) < opt.pts}
                    onClick={() => handleRedeemPoints(opt.pts)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      padding: '20px', borderRadius: 8, cursor: 'pointer', transition: 'all 300ms',
                      textAlign: 'center', position: 'relative', overflow: 'hidden',
                      opacity: (user?.loyaltyPoints || 0) < opt.pts ? 0.4 : 1,
                    }}
                    onMouseEnter={e => { if ((user?.loyaltyPoints || 0) >= opt.pts) { e.currentTarget.style.borderColor = G; e.currentTarget.style.background = 'rgba(184,149,106,0.05)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: G, marginBottom: 4 }}>{opt.val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{opt.pts} ĐIỂM</div>
                    {(user?.loyaltyPoints || 0) >= opt.pts && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: G, color: 'white', fontSize: 8, padding: '2px 6px', borderRadius: '0 0 0 8px', fontWeight: 700 }}>ĐỔI NGAY</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ ...SF, fontSize: 18, color: 'white', margin: '0 0 20px' }}>Ưu đãi hiện có</h4>
            {vouchers.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Bạn chưa có voucher nào khả dụng.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {vouchers.map(v => (
                  <div key={v.id} style={{ 
                    border: '1px solid rgba(184,149,106,0.3)', borderRadius: 12, padding: 0, 
                    background: 'linear-gradient(135deg, rgba(184,149,106,0.15), rgba(0,0,0,0.4))',
                    display: 'flex', overflow: 'hidden'
                  }}>
                    {/* Voucher Left Side (The "Value" part) */}
                    <div style={{ 
                      width: 100, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', color: 'white', position: 'relative'
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{v.discountType === 'PERCENT' ? v.discountValue + '%' : 'SALE'}</div>
                      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1px' }}>OFF</div>
                      {/* Dotted border line */}
                      <div style={{ position: 'absolute', right: -1, top: 0, bottom: 0, borderRight: '2px dotted rgba(0,0,0,0.2)' }} />
                    </div>
                    {/* Voucher Right Side */}
                    <div style={{ flex: 1, padding: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4, textTransform: 'uppercase' }}>{v.code}</div>
                      <div style={{ fontSize: 18, color: G, fontWeight: 700, marginBottom: 8 }}>
                        {v.discountType === 'FIXED_AMOUNT' ? v.discountValue?.toLocaleString() + '₫' : v.discountValue + '% GIẢM GIÁ'}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                        Hạn dùng: {v.validTo ? new Date(v.validTo).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                      </div>
                      <button 
                        onClick={() => handleCopyCode(v.code)} 
                        style={{ 
                          width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(184,149,106,0.4)', color: G, 
                          fontSize: 10, fontWeight: 700, letterSpacing: '1px',
                          cursor: 'pointer', borderRadius: 4, transition: 'all 200ms'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = G; }}
                      >
                        SAO CHÉP MÃ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}