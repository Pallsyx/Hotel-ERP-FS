import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import AttractionMap from '../../components/Map/AttractionMap';
import articleApi from '../../api/articleApi';
import attractionApi from '../../api/attractionApi';
import RoomSearchWidget from '../../components/RoomSearch/RoomSearchWidget';

const SLIDES = [
  { id: 1, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2000', title: "Không gian nghỉ dưỡng đẳng cấp,\nhòa mình cùng thiên nhiên." },
  { id: 2, img: 'https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=2000', title: "Đặc quyền hội viên thượng lưu,\ntận hưởng kỳ nghỉ trọn vẹn." },
  { id: 3, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000', title: "Khám phá tinh hoa ẩm thực,\nđánh thức mọi giác quan." },
  { id: 4, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000', title: "Thư giãn tuyệt đối tại Spa,\nthanh lọc tâm hồn và cơ thể." },
];
const G = '#b8956a', D = '#111111';
const SF = { fontFamily: "'Playfair Display',serif" };

export default function HomePage() {
  const nav = useNavigate();
  const today = new Date().toLocaleDateString('en-CA');
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = isAuthenticated && (user?.roleName === 'Admin' || user?.role?.name === 'Admin' || user?.role === 'Admin' || user?.roleId === 1);
  const isStaff = isAuthenticated && !isAdmin;

  // Dropdown menu items khi đã đăng nhập
  const userMenuItems = [
    { key: 'profile', label: 'Trang cá nhân', icon: <UserOutlined />, onClick: () => nav('/profile') },
    ...(isAdmin ? [{ key: 'admin', label: 'Quản trị hệ thống', icon: <DashboardOutlined />, onClick: () => nav('/admin') }] : []),
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: () => { logout(); nav('/'); } },
  ];

  const [articles, setArticles] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [sel, setSel] = useState(null); // giữ cho bookOpen modal
  const [cur, setCur] = useState(0);
  const [play, setPlay] = useState(true);
  const [sc, setSc] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDragStart = (e) => {
    setDragStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    setPlay(false);
  };
  const handleDragMove = (e) => {
    if (dragStartX === null) return;
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    setDragOffset(currentX - dragStartX);
  };
  const handleDragEnd = () => {
    if (dragStartX === null) return;
    if (dragOffset > 50) setCur(p => (p - 1 + SLIDES.length) % SLIDES.length);
    else if (dragOffset < -50) setCur(p => (p + 1) % SLIDES.length);
    setDragStartX(null);
    setDragOffset(0);
    setPlay(true);
  };

  useEffect(() => { const f = () => setSc(window.scrollY > 50); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { let t; if (play) t = setInterval(() => setCur(p => (p + 1) % SLIDES.length), 5000); return () => clearInterval(t); }, [play, cur]);
  useEffect(() => {
    articleApi.search().then(r => setArticles((r.data || []).slice(0, 6))).catch(() => { });
    attractionApi.getAll().then(r => setAttractions((r.data || []).filter(a => a.status !== 'INACTIVE').slice(0, 10))).catch(() => { });
  }, []);
  useEffect(() => {
    document.title = 'Asteria Resort - Không gian nghỉ dưỡng đẳng cấp';
  }, []);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      {/* HEADER */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: sc ? D : 'linear-gradient(to bottom,rgba(0,0,0,.8),transparent)', transition: 'background 400ms', boxShadow: sc ? '0 2px 20px rgba(0,0,0,.5)' : 'none' }}>
        <div>
          {/* Top Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: sc ? 0 : 64, opacity: sc ? 0 : 1, overflow: 'hidden', borderBottom: sc ? 'none' : '1px solid rgba(255,255,255,0.1)', padding: '0 clamp(24px,5vw,80px)', transition: 'height 300ms ease, opacity 300ms ease, border-bottom 300ms ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => nav('/')}>
              <div style={{ width: 32, height: 32, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SF, fontSize: 14, color: 'white' }}>A</div>
              <span style={{ color: 'white', fontSize: 15, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>Asteria Resort</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
              {/* Quick links */}
              <div style={{ display: 'flex', gap: 20 }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Yêu cầu đặt chỗ</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Tìm khách sạn</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Hội Viên Rewards</a>
              </div>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)' }} />
              {/* Notification */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, transition: 'background 200ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ color: G, fontSize: 13 }}>🔔</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>Thông báo</span>
              </span>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)' }} />
              {/* Auth — ngoài cùng bên phải */}
              {isAuthenticated ? (
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '5px 12px 5px 6px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    transition: 'all 200ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = G; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
                    <Avatar
                      size={26}
                      icon={<UserOutlined />}
                      style={{ background: `linear-gradient(135deg, ${G}, #9a7b52)`, fontSize: 12, flexShrink: 0 }}
                    />
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName || user?.username || user?.email || 'Tài khoản'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>▼</span>
                  </div>
                </Dropdown>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <a href="/login" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 11, transition: 'color 200ms', letterSpacing: '0.5px' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>Đăng nhập</a>
                  <a href="/register" style={{ color: 'white', textDecoration: 'none', fontSize: 11, background: G, padding: '5px 14px', borderRadius: 999, letterSpacing: '0.5px', transition: 'opacity 200ms' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Đăng ký</a>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', alignItems: 'center', height: 60, position: 'relative', padding: '0 clamp(40px,8vw,160px)' }}>
            <div style={{ position: 'absolute', left: 'clamp(40px,8vw,160px)', opacity: sc ? 1 : 0, pointerEvents: sc ? 'auto' : 'none', transition: 'opacity 300ms ease', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => nav('/')}>
              <div style={{ width: 24, height: 24, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SF, fontSize: 11, color: 'white' }}>A</div>
            </div>
            <nav style={{ display: 'flex', gap: 48, width: '100%', justifyContent: 'center', transition: 'justify-content 300ms ease' }}>
              {[['THƯƠNG HIỆU', '/'], ['ƯU ĐÃI ĐẶC BIỆT', '/#offers'], ['ĂN UỐNG', '/#dining'], ['TRẢI NGHIỆM', '/attractions'], ['THÀNH VIÊN', '/#member'], ['TIN TỨC', '/news']].map(([l, h], idx) => (
                <a key={l} href={h} style={{ fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', color: idx === 0 ? 'white' : 'rgba(255,255,255,.7)', textDecoration: 'none', height: 60, display: 'flex', alignItems: 'center', borderBottom: idx === 0 ? `2px solid ${G}` : '2px solid transparent', transition: 'color 300ms, border-color 300ms' }}
                  onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.borderBottomColor = G; }} onMouseLeave={e => { e.target.style.color = idx === 0 ? 'white' : 'rgba(255,255,255,.7)'; e.target.style.borderBottomColor = idx === 0 ? G : 'transparent'; }}>{l}</a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{ position: 'relative', height: '100vh', background: '#000', overflow: 'hidden', cursor: dragStartX !== null ? 'grabbing' : 'grab' }}
        onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', height: '100%', width: `${SLIDES.length * 100}%`, transform: `translateX(calc(-${cur * (100 / SLIDES.length)}% + ${dragOffset}px))`, transition: dragStartX === null ? 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none', willChange: 'transform' }}>
          {SLIDES.map((s, i) => (
            <div key={s.id} style={{ width: `${100 / SLIDES.length}%`, height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(0,0,0,.85) 0%,rgba(0,0,0,.4) 50%,rgba(0,0,0,.1) 100%)', zIndex: 1 }} />
              <img src={s.img} alt="slide" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: i === cur ? 'scale(1.05)' : 'scale(1)', transition: 'transform 10s ease-out', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', zIndex: 2, top: '50%', left: 'clamp(40px,8vw,160px)', transform: 'translateY(-50%)', color: 'white', maxWidth: 700 }}>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(48px,6vw,84px)', fontWeight: 700, letterSpacing: '-1px', whiteSpace: 'pre-line', lineHeight: 1.1, marginBottom: 32 }}>
                  {`NGHỈ DƯỠNG\nĐẲNG CẤP THẾ GIỚI`}
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,.8)', lineHeight: 1.8, marginBottom: 48, maxWidth: 520 }}>
                  Lotte Hotels & Resorts — nơi hội tụ tinh hoa ẩm thực, spa thư giãn và những trải nghiệm độc đáo dành riêng cho những vị khách tinh tế nhất.
                </p>
                <button onClick={(e) => { e.stopPropagation(); nav('/attractions'); }} style={{ fontSize: 14, fontWeight: 600, color: 'white', background: 'none', border: 'none', borderBottom: '1px solid white', paddingBottom: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 200ms' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                  Xem chi tiết <span style={{ fontSize: 16 }}>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Controls */}
        <div style={{ position: 'absolute', bottom: 64, left: 'clamp(40px,8vw,160px)', zIndex: 30, display: 'flex', alignItems: 'center', gap: 32, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'white', width: `${((cur + 1) / SLIDES.length) * 100}%`, transition: 'width 400ms ease' }} />
            </div>
            <span style={{ fontSize: 12, letterSpacing: '2px', opacity: .7, fontFamily: "'Inter',sans-serif" }}>{cur + 1} / {SLIDES.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => setCur(p => (p - 1 + SLIDES.length) % SLIDES.length)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 12, padding: 8 }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.7)'}>‹</button>
            <button onClick={() => setPlay(!play)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 10, display: 'flex', gap: 2, padding: 8 }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}>
              {play ? <><span>❚</span><span>❚</span></> : <span>▶</span>}
            </button>
            <button onClick={() => setCur(p => (p + 1) % SLIDES.length)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 12, padding: 8 }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.7)'}>›</button>
          </div>
        </div>
      </section>


      {/* INTRO + ROOM CARDS */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 48 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>Phòng Nghỉ</span>
              <h2 style={{ ...SF, fontSize: 'clamp(28px,4vw,44px)', color: '#18181b', marginBottom: 20, lineHeight: 1.2 }}>Tìm kiếm không gian hoàn hảo cho kỳ nghỉ.</h2>
              <div style={{ width: 48, height: 1, background: G, marginBottom: 24 }} />
              <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.9, marginBottom: 28 }}>Tận hưởng sự yên bình tuyệt đối trong không gian sang trọng được thiết kế tinh tế. Từ ban công riêng tư, quý khách có thể chiêm ngưỡng trọn vẹn vẻ đẹp của bình minh.</p>
              <div><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#71717a', display: 'block', marginBottom: 4 }}>Hotline Đặt Phòng</span><span style={{ fontSize: 22, ...SF, color: G }}>0363 332 841</span></div>
            </div>
            <div><img src="https://dulichkhampha24.com/wp-content/uploads/2020/08/khach-san-fivitel-hoi-an-2.jpg" alt="Hotel" style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2 }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600'].map((img, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0, width: 220, height: 300, overflow: 'hidden', cursor: 'pointer', borderRadius: 2 }}>
                <img src={img} alt="room" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms' }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.6),transparent)' }} />
                <p style={{ position: 'absolute', bottom: 16, left: 16, color: 'white', ...SF, fontSize: 15, margin: 0 }}>The Cottage</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATTRACTIONS (Destinations style) */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h2 style={{ ...SF, fontSize: 'clamp(32px,4vw,44px)', color: '#18181b', margin: 0, fontWeight: 400 }}>Destinations</h2>
              <div style={{ width: 1, height: 24, background: '#d4d4d8' }} />
              <span style={{ fontSize: 16, color: '#3f3f46', fontWeight: 500 }}>Điểm đến</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: '#18181b', color: 'white', border: 'none', borderRadius: 999, padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}>Nổi bật</button>
                <button style={{ background: 'white', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: 999, padding: '8px 20px', fontSize: 13, cursor: 'pointer', transition: 'background 200ms' }} onMouseEnter={e => e.target.style.background = '#f4f4f5'} onMouseLeave={e => e.target.style.background = 'white'}>Tất cả</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => document.getElementById('dest-slider').scrollBy({ left: -350, behavior: 'smooth' })} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e4e4e7', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#18181b', transition: 'background 200ms' }} onMouseEnter={e => e.target.style.background = '#f4f4f5'} onMouseLeave={e => e.target.style.background = 'white'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => document.getElementById('dest-slider').scrollBy({ left: 350, behavior: 'smooth' })} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e4e4e7', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#18181b', transition: 'background 200ms' }} onMouseEnter={e => e.target.style.background = '#f4f4f5'} onMouseLeave={e => e.target.style.background = 'white'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 1, background: '#e4e4e7', marginBottom: 40 }} />

          {/* Slider */}
          <div id="dest-slider" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollBehavior: 'smooth', paddingBottom: 24, scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`#dest-slider::-webkit-scrollbar { display: none; }`}</style>
            {attractions.length === 0 ? <p style={{ width: '100%', textAlign: 'center', color: '#71717a', fontSize: 14 }}>Đang tải...</p> : (attractions.length < 4 ? [...attractions, ...attractions, ...attractions] : attractions).map((a, i) => (
              <div key={a.id + '-' + i} style={{ position: 'relative', flexShrink: 0, width: 320, height: 480, overflow: 'hidden', cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => {
                  e.currentTarget.querySelector('img').style.transform = 'scale(1.08)';
                  e.currentTarget.querySelector('.overlay-bg').style.background = 'rgba(0,0,0,0.6)';
                  e.currentTarget.querySelector('.hover-content').style.opacity = '1';
                  e.currentTarget.querySelector('.hover-content').style.transform = 'translateY(0)';
                  e.currentTarget.querySelector('.default-title').style.opacity = '0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                  e.currentTarget.querySelector('.overlay-bg').style.background = 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)';
                  e.currentTarget.querySelector('.hover-content').style.opacity = '0';
                  e.currentTarget.querySelector('.hover-content').style.transform = 'translateY(20px)';
                  e.currentTarget.querySelector('.default-title').style.opacity = '1';
                }}
                onClick={() => nav('/attractions')}
              >
                <img src={a.imageUrl || 'https://images.unsplash.com/photo-1597435877854-c2cbfa9cc2c2?w=600'} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms ease' }} />
                <div className="overlay-bg" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)', transition: 'background 400ms ease' }} />

                {/* Default Title (bottom) */}
                <div className="default-title" style={{ position: 'absolute', bottom: 32, left: 24, right: 24, transition: 'opacity 400ms ease' }}>
                  <h3 style={{ color: 'white', fontSize: 20, fontWeight: 600, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{a.name}</h3>
                </div>

                {/* Hover Content */}
                <div className="hover-content" style={{ position: 'absolute', inset: 0, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0, transform: 'translateY(20px)', transition: 'all 400ms ease' }}>
                  <h3 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>{a.name}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'background 200ms, border-color 200ms' }}
                      onMouseEnter={e => { e.target.style.background = 'white'; e.target.style.color = '#18181b'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'white'; }}>
                      Xem chi tiết
                    </button>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'background 200ms, border-color 200ms' }}
                      onMouseEnter={e => { e.target.style.background = 'white'; e.target.style.color = '#18181b'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'white'; }}>
                      Bản đồ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section style={{ background: '#fafafa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>Thông Cáo Báo Chí</span>
              <h2 style={{ ...SF, fontSize: 'clamp(28px,4vw,44px)', color: '#18181b', margin: 0, fontWeight: 400 }}>Tin Tức Mới Nhất Từ Resort</h2>
            </div>
            <button onClick={() => nav('/news')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', paddingBottom: 8 }}
              onMouseEnter={e => e.target.style.color = G} onMouseLeave={e => e.target.style.color = '#71717a'}>Xem tất cả</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(350px,1fr))', gap: 32 }}>
            {articles.length === 0 ? <p style={{ color: '#71717a', fontSize: 14, fontStyle: 'italic' }}>Đang tải bài viết...</p> : articles.map(item => (
              <div key={item.id} onClick={() => nav(`/news/${item.slug}`)} style={{ background: 'white', cursor: 'pointer', border: '1px solid #eaeaea', transition: 'box-shadow 300ms' }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,.08)';
                  e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                }}>
                <div style={{ height: 240, overflow: 'hidden' }}>
                  <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms ease' }} />
                </div>
                <div style={{ padding: '24px 24px 32px' }}>
                  {item.categoryName && (
                    <span style={{ fontSize: 9, color: G, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 8 }}>{item.categoryName}</span>
                  )}
                  <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10, fontWeight: 500 }}>{new Date(item.publishedAt || new Date()).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <h3 style={{ ...SF, fontSize: 20, color: '#18181b', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: 500 }}>{item.title}</h3>
                  <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: G, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Đọc thêm →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111111', color: 'rgba(255,255,255,0.7)', padding: '80px 24px 40px', fontFamily: "'Times New Roman', Times, serif", borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', color: 'white', letterSpacing: '1px', margin: 0 }}>ASTERIA RESORT</h2>
            <div style={{ display: 'flex', gap: 24 }}>
            </div>
          </div>

          {/* Links Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 64, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 64 }}>
            <div>
              <h4 style={{ color: 'white', fontSize: 15, letterSpacing: '1px', marginBottom: 24, textTransform: 'uppercase' }}>ĐIỂM ĐẾN</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Về Asteria', 'Thương hiệu Asteria', 'Liên hệ chi nhánh', 'Ý kiến khách hàng'].map(t => (
                  <a key={t} href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>{t}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: 15, letterSpacing: '1px', marginBottom: 24, textTransform: 'uppercase' }}>CÔNG TY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Tập đoàn Asteria', 'Giới thiệu', 'Tuyển dụng', 'Phát triển', 'Học viện dịch vụ'].map(t => (
                  <a key={t} href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>{t}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: 15, letterSpacing: '1px', marginBottom: 24, textTransform: 'uppercase' }}>HOTLINE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Hotline</a>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: 15, letterSpacing: '1px', marginBottom: 24, textTransform: 'uppercase' }}>ĐIỀU KHOẢN & CHÍNH SÁCH</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Điều khoản khách sạn', 'Điều khoản dịch vụ'].map(t => (
                  <a key={t} href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>{t}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: 15, letterSpacing: '1px', marginBottom: 24, textTransform: 'uppercase' }}>LIÊN HỆ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.8 }}>
                <span>Số 10, Huỳnh Văn Nghệ, phường Bửu Long, TP. Biên Hòa, tỉnh Đồng Nai</span>
                <div style={{ marginTop: 8, borderRadius: 4, overflow: 'hidden', height: 150 }}><AttractionMap isFooter={true} /></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODAL OVERLAY ── */}
      {bookOpen && (
        <div
          onClick={() => setBookOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998,
            animation: 'backdropIn 200ms ease',
          }}
        >
          <style>{`
            @keyframes backdropIn{from{opacity:0}to{opacity:1}}
            @keyframes modalIn{from{opacity:0;transform:scale(0.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
            @media(max-width:480px){.book-modal-inner{width:100vw!important;max-height:100dvh!important;border-radius:16px 16px 0 0!important;align-self:flex-end!important;}}
          `}</style>
          <div
            className="book-modal-inner"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(400px,94vw)',
              maxHeight: '90dvh',
              overflowY: 'auto',
              borderRadius: 10,
              animation: 'modalIn 250ms cubic-bezier(0.34,1.4,0.64,1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            }}
          >
            <RoomSearchWidget onClose={() => setBookOpen(false)} />
          </div>
        </div>
      )}

      {/* ── FAB TRIGGER BUTTON ── */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
        <button
          onClick={() => setBookOpen(!bookOpen)}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            background: bookOpen ? '#3f3f46' : 'linear-gradient(135deg,#c9a97a,#9a7b52)',
            color: 'white',
            boxShadow: bookOpen ? 'none' : '0 8px 32px rgba(184,149,106,0.45)',
            transform: 'scale(1)',
            transition: 'transform 200ms ease, background 300ms ease, box-shadow 300ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
          {bookOpen
            ? <span style={{ fontSize: 22, lineHeight: 1 }}>✕</span>
            : (<>
              <span style={{ fontSize: 20, lineHeight: 1 }}>📅</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Sách</span>
            </>)
          }
        </button>
      </div>
    </div>
  );
}
