import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, HomeOutlined, CameraOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

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
  const { token, user, login } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [sc, setSc] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password form state
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    const f = () => setSc(window.scrollY > 50);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    document.title = 'Hồ Sơ Cá Nhân - Asteria Resort';
    fetchProfile();
  }, []);

  // 1. Lấy profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/UserProfile/my-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data.data || res.data;
      setFullName(d.fullName || '');
      setEmail(d.email || '');
      setPhone(d.phone || '');
      setAddress(d.address || '');
      setAvatarUrl(d.avatarUrl || '');
    } catch {
      message.error('Không thể tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cập nhật thông tin
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { message.warning('Vui lòng nhập họ và tên!'); return; }
    setSavingInfo(true);
    try {
      await axios.put(`${API}/api/UserProfile/update-profile`, { fullName, phone, address }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // 3. Đổi mật khẩu
  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (!oldPwd) { message.warning('Vui lòng nhập mật khẩu hiện tại!'); return; }
    if (newPwd.length < 6) { message.warning('Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
    if (newPwd !== confirmPwd) { message.warning('Mật khẩu xác nhận không khớp!'); return; }
    setSavingPwd(true);
    try {
      await axios.put(`${API}/api/UserProfile/change-password`, { oldPassword: oldPwd, newPassword: newPwd }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đổi mật khẩu thành công!');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      message.error(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác!');
    } finally {
      setSavingPwd(false);
    }
  };

  // 4. Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API}/api/UserProfile/upload-avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
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

  // Initials cho avatar
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
        {/* Decorative pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#b8956a" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        {/* Gold orb glow left */}
        <div style={{ position: 'absolute', top: -60, left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Gold orb glow right */}
        <div style={{ position: 'absolute', bottom: -80, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.6) 70%, rgba(13,13,13,1) 100%)' }} />
        {/* Content */}
        <div style={{ position: 'absolute', bottom: 40, left: 'clamp(24px,6vw,120px)' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 10 }}>Tài Khoản Của Tôi</span>
          <h1 style={{ ...SF, fontSize: 'clamp(28px,4vw,44px)', color: 'white', margin: 0, fontWeight: 400 }}>Hồ Sơ Cá Nhân</h1>
        </div>
      </div>


      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(24px,5vw,60px) 80px' }}>

        {/* ── AVATAR CARD ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(184,149,106,0.12), rgba(184,149,106,0.04))',
          border: '1px solid rgba(184,149,106,0.2)', borderRadius: 8,
          padding: '32px 40px', marginBottom: 32, marginTop: -32,
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Avatar */}
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
            {/* Upload trigger */}
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

          {/* Name & role */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ ...SF, fontSize: 26, color: 'white', margin: '0 0 6px', fontWeight: 400 }}>
              {loading ? '...' : (fullName || 'Khách hàng')}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>{email}</p>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: G, background: `${G}18`, padding: '3px 10px', borderRadius: 999 }}>
              {user?.roleName || 'Thành Viên'}
            </span>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 40 }}>
            {[['Hội Viên', 'Standard'], ['Điểm Tích Lũy', '0'], ['Lượt Ở', '0']].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ ...SF, fontSize: 22, color: G, fontWeight: 500 }}>{v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2 COLUMNS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          {/* ── CỘT TRÁI: THÔNG TIN CÁ NHÂN ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '36px 36px 40px', backdropFilter: 'blur(10px)',
          }}>
            <SectionTitle label="Thông Tin Cá Nhân" sub="Hồ sơ" />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: G }}>
                <div style={{ width: 32, height: 32, border: `2px solid ${G}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ fontSize: 12, opacity: 0.7 }}>Đang tải...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateInfo}>
                <Field label="Họ và Tên" icon={UserOutlined} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nhập họ và tên..." required />
                <Field label="Email (Tài khoản đăng nhập)" icon={MailOutlined} value={email} disabled placeholder="Email" />
                <Field label="Số điện thoại" icon={PhoneOutlined} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại..." />

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                    <HomeOutlined style={{ marginRight: 6 }} />Địa chỉ
                  </label>
                  <textarea
                    value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ..."
                    rows={3}
                    style={{
                      width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
                      color: 'white', fontSize: 14, outline: 'none', resize: 'vertical',
                      fontFamily: "'Inter', sans-serif", transition: 'border-color 200ms',
                    }}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>

                <button type="submit" disabled={savingInfo} style={{
                  width: '100%', padding: '14px', background: G, border: 'none',
                  color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase', cursor: savingInfo ? 'not-allowed' : 'pointer',
                  borderRadius: 2, opacity: savingInfo ? 0.7 : 1, transition: 'all 200ms',
                }}
                  onMouseEnter={e => { if (!savingInfo) e.currentTarget.style.background = '#a07d5a'; }}
                  onMouseLeave={e => e.currentTarget.style.background = G}>
                  {savingInfo ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </form>
            )}
          </div>

          {/* ── CỘT PHẢI: BẢO MẬT ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '36px 36px 40px', backdropFilter: 'blur(10px)',
          }}>
            <SectionTitle label="Bảo Mật Tài Khoản" sub="Đổi mật khẩu" />

            <form onSubmit={handleChangePwd}>
              <Field label="Mật khẩu hiện tại" icon={LockOutlined} type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="Nhập mật khẩu hiện tại" required />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

              <Field label="Mật khẩu mới" icon={LockOutlined} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Tối thiểu 6 ký tự" required />
              <Field label="Xác nhận mật khẩu mới" icon={LockOutlined} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Nhập lại mật khẩu mới" required />

              {/* Password strength hint */}
              {newPwd && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(184,149,106,0.08)', border: '1px solid rgba(184,149,106,0.15)', borderRadius: 4 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: newPwd.length >= i * 3 ? (newPwd.length >= 10 ? '#22c55e' : G) : 'rgba(255,255,255,0.1)',
                        transition: 'background 300ms'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {newPwd.length < 6 ? 'Quá ngắn' : newPwd.length < 10 ? 'Trung bình' : 'Mạnh'} • {newPwd.length} ký tự
                  </span>
                </div>
              )}

              {confirmPwd && newPwd !== confirmPwd && (
                <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, fontSize: 12, color: '#ef4444' }}>
                  ⚠ Mật khẩu xác nhận không khớp
                </div>
              )}

              <button type="submit" disabled={savingPwd} style={{
                width: '100%', padding: '14px',
                background: 'transparent', border: `1px solid ${G}`,
                color: G, fontSize: 11, fontWeight: 700, letterSpacing: '2px',
                textTransform: 'uppercase', cursor: savingPwd ? 'not-allowed' : 'pointer',
                borderRadius: 2, opacity: savingPwd ? 0.7 : 1, transition: 'all 200ms',
              }}
                onMouseEnter={e => { if (!savingPwd) { e.currentTarget.style.background = G; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G; }}>
                {savingPwd ? 'Đang xử lý...' : 'Xác Nhận Đổi Mật Khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}