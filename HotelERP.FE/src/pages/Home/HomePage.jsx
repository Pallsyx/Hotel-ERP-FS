import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Dropdown, Avatar, Space, ConfigProvider, theme, Badge, List, Button, Popover } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import AttractionMap from '../../components/Map/AttractionMap';
import articleApi from '../../api/articleApi';
import attractionApi from '../../api/attractionApi';
import axiosClient from '../../api/axiosClient';
import RoomSearchWidget from '../../components/RoomSearch/RoomSearchWidget';
import MainFooter from '../../components/Layout/MainFooter';

const SLIDES = [
  { id: 1, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2000', title: "Không gian nghỉ dưỡng đẳng cấp,\nhòa mình cùng thiên nhiên." },
  { id: 2, img: 'https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=2000', title: "Đặc quyền hội viên thượng lưu,\ntận hưởng kỳ nghỉ trọn vẹn." },
  { id: 3, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000', title: "Khám phá tinh hoa ẩm thực,\nđánh thức mọi giác quan." },
  { id: 4, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000', title: "Thư giãn tuyệt đối tại Spa,\nthanh lọc tâm hồn và cơ thể." },
];
const G = '#b8956a', D = '#111111';
const SF = { fontFamily: "'Playfair Display',serif" };

/* ═══════════════════════════════════════════════════════════ */
/*  HELPERS                                                     */
/* ═══════════════════════════════════════════════════════════ */
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dfvdvkssv/image/upload/hotel_placeholders';

const getPlaceholderImage = (item) => {
  if (item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('https'))) return item.imageUrl;
  
  const name = (item.name || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  if (name.includes('biển') || name.includes('beach') || name.includes('vịnh')) 
    return `${CLOUDINARY_BASE}/beach_placeholder.jpg`;
  if (name.includes('chợ') || name.includes('market') || name.includes('trung tâm')) 
    return `${CLOUDINARY_BASE}/market_placeholder.jpg`;
  if (name.includes('bảo tàng') || name.includes('museum') || name.includes('triển lãm') || name.includes('di tích')) 
    return `${CLOUDINARY_BASE}/museum_placeholder.jpg`;
  if (name.includes('phố') || name.includes('street') || name.includes('quảng trường')) 
    return `${CLOUDINARY_BASE}/street_placeholder.jpg`;
  if (name.includes('chùa') || name.includes('pagoda') || name.includes('đền') || name.includes('nhà thờ') || name.includes('tháp')) 
    return `${CLOUDINARY_BASE}/pagoda_placeholder.jpg`;
  if (name.includes('vui chơi') || name.includes('park') || name.includes('công viên') || type.includes('giải trí')) 
    return `${CLOUDINARY_BASE}/park_placeholder.jpg`;
  if (name.includes('nhà hàng') || name.includes('ăn uống') || name.includes('food') || name.includes('quán')) 
    return `${CLOUDINARY_BASE}/food_placeholder.jpg`;
  if (name.includes('thác') || name.includes('nước') || name.includes('suối')) 
    return `${CLOUDINARY_BASE}/waterfall_placeholder.jpg`;
  if (name.includes('núi') || name.includes('rừng') || name.includes('đèo')) 
    return `${CLOUDINARY_BASE}/mountain_placeholder.jpg`;
  if (name.includes('golf') || name.includes('sân')) 
    return `${CLOUDINARY_BASE}/golf_placeholder.jpg`;
  if (name.includes('làng') || name.includes('truyền thống') || name.includes('nghề')) 
    return `${CLOUDINARY_BASE}/village_placeholder.jpg`;
  if (name.includes('hoàng hôn') || name.includes('sunset') || name.includes('ngắm')) 
    return `${CLOUDINARY_BASE}/sunset_placeholder.jpg`;
  
  return 'https://res.cloudinary.com/dfvdvkssv/image/upload/v1778288591/hotel_placeholders/market_placeholder.jpg';
};

const MembershipSection = ({ nav }) => {
  const tiers = [
    { name: 'Khách Mới', points: 0, discount: 0, color: '#a1a1aa', icon: '🌱' },
    { name: 'Đồng', points: 500, discount: 2, color: '#cd7f32', icon: '🥉' },
    { name: 'Bạc', points: 1000, discount: 5, color: '#c0c0c0', icon: '🥈' },
    { name: 'Vàng', points: 3000, discount: 8, color: '#ffd700', icon: '🥇' },
    { name: 'Bạch Kim', points: 5000, discount: 10, color: '#e5e4e2', icon: '💎' },
    { name: 'Kim Cương', points: 10000, discount: 15, color: '#b9f2ff', icon: '✨' },
    { name: 'Elite', points: 20000, discount: 20, color: '#ff8c00', icon: '🌟' },
    { name: 'VIP', points: 50000, discount: 25, color: '#ff4500', icon: '👑' },
    { name: 'VVIP', points: 100000, discount: 30, color: '#9400d3', icon: '🔥' },
    { name: 'Signature', points: 200000, discount: 35, color: '#b8956a', icon: '⚜️' },
  ];

  return (
    <section id="member" style={{ background: '#0a0a0a', padding: '120px 24px', color: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
           <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.4em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>Đặc Quyền Hội Viên</span>
           <h2 style={{ ...SF, fontSize: 'clamp(36px,5vw,56px)', color: 'white', marginBottom: 28, fontWeight: 400 }}>Hội Viên Asteria Rewards</h2>
           <p style={{ maxWidth: 700, margin: '0 auto', color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8, fontWeight: 300 }}>
             Tham gia chương trình khách hàng thân thiết để tận hưởng thế giới đặc quyền. <br/>
             Giảm giá trực tiếp khi đặt phòng, tích lũy điểm và trải nghiệm những dịch vụ cá nhân hóa đỉnh cao.
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {tiers.map((t, idx) => (
            <div key={idx} style={{ 
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: 4, 
              padding: '40px 24px', 
              textAlign: 'center',
              transition: 'all 400ms cubic-bezier(0.25, 1, 0.5, 1)',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = G;
              e.currentTarget.style.background = 'rgba(184,149,106,0.08)';
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.querySelector('.glow').style.opacity = '0.5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.querySelector('.glow').style.opacity = '0';
            }}>
              <div className="glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${t.color}33 0%, transparent 70%)`, opacity: 0, transition: 'opacity 400ms' }} />
              <div style={{ fontSize: 36, marginBottom: 20, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>{t.icon}</div>
              <h3 style={{ color: t.color, fontSize: 20, marginBottom: 12, fontWeight: 500, letterSpacing: '0.5px' }}>{t.name}</h3>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                {t.discount}% <span style={{fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.4)', verticalAlign: 'middle', marginLeft: 4}}>ƯU ĐÃI</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Từ {t.points.toLocaleString()} điểm</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 100, background: 'rgba(255,255,255,0.02)', borderRadius: 2, padding: '64px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 64, alignItems: 'center' }}>
              <div>
                <h4 style={{ color: G, fontSize: 24, marginBottom: 32, ...SF, fontWeight: 400, letterSpacing: '1px' }}>Quyền lợi hạng thẻ</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                   {[
                     { t: 'Đặt phòng ưu đãi', d: 'Giảm giá trực tiếp từ 2% - 35% tùy theo hạng thành viên hiện tại.' },
                     { t: 'Tích lũy linh hoạt', d: 'Nhận 1 điểm cho mỗi 10,000đ chi tiêu tại resort.' },
                     { t: 'Quà tặng sinh nhật', d: 'Voucher nghỉ dưỡng đặc biệt gửi tặng vào tháng sinh nhật.' },
                     { t: 'Ưu tiên dịch vụ', d: 'Check-in sớm, Check-out muộn và nâng hạng phòng miễn phí.' },
                     { t: 'Secret Deals', d: 'Truy cập các gói ưu đãi bí mật không công khai trên Website.' },
                     { t: 'Đội ngũ hỗ trợ 24/7', d: 'Đường dây nóng dành riêng cho hội viên cao cấp.' }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', gap: 16 }}>
                       <span style={{ color: G, fontSize: 18 }}>✦</span>
                       <div>
                         <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.t}</div>
                         <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5 }}>{item.d}</div>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 64 }}>
                <div style={{ width: 60, height: 60, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24 }}>✨</div>
                <h5 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Gia nhập ngay hôm nay</h5>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Đăng ký tài khoản để bắt đầu hành trình tích lũy và tận hưởng ưu đãi.</p>
                <button onClick={() => nav('/register')} style={{ background: 'white', color: 'black', border: 'none', padding: '18px 48px', borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 300ms', letterSpacing: '2px', textTransform: 'uppercase' }} onMouseEnter={e => { e.target.style.background = G; e.target.style.color = 'white'; }} onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = 'black'; }}>Đăng ký hội viên</button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

import MainHeader from '../../components/Layout/MainHeader';

export default function HomePage() {
  const nav = useNavigate();
  const { user, isAuthenticated, logout, login, token, refreshToken, permissions } = useAuthStore();
  const isAdmin = isAuthenticated && (user?.roleName === 'Admin' || user?.role?.name === 'Admin' || user?.role === 'Admin' || user?.roleId === 1);

  // Tự động fetch profile lấy Avatar nếu user thiếu (do login payload chưa đủ)
  useEffect(() => {
    if (isAuthenticated && !user?.membershipTier) {
      axiosClient.get('/UserProfile/my-profile')
        .then(res => {
          const d = res.data?.data || res.data;
          if (d) {
            login({ 
              ...user, 
              avatarUrl: d.avatarUrl || user?.avatarUrl, 
              fullName: d.fullName || user?.fullName,
              membershipTier: d.membershipTier,
              membershipDiscount: d.membershipDiscount,
              loyaltyPoints: d.loyaltyPoints
            }, token, refreshToken, permissions);
          }
        })
        .catch(err => console.log('Could not fetch profile:', err));
    }
  }, [isAuthenticated, token]);

  const [articles, setArticles] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [cur, setCur] = useState(0);
  const [play, setPlay] = useState(true);
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

  useEffect(() => { let t; if (play) t = setInterval(() => setCur(p => (p + 1) % SLIDES.length), 5000); return () => clearInterval(t); }, [play, cur]);
  useEffect(() => {
    articleApi.search().then(r => setArticles((r.data || []).slice(0, 6))).catch(() => { });
    attractionApi.getAll().then(r => setAttractions((r.data || []).filter(a => a.status !== 'INACTIVE').slice(0, 10))).catch(() => { });
  }, []);
  useEffect(() => {
    document.title = 'Asteria Resort - Không gian nghỉ dưỡng đẳng cấp';
    // Handle anchor scroll if exists
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [window.location.hash]);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <MainHeader transparent={true} />

      {/* HERO */}
      <section
        id="hero-sec"
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
                  Asteria Resort — nơi hội tụ tinh hoa ẩm thực, spa thư giãn và những trải nghiệm độc đáo dành riêng cho những vị khách tinh tế nhất.
                </p>

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
      <section id="attractions-sec" style={{ background: 'white', padding: '80px 24px' }}>
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
                <button onClick={() => nav('/attractions')} style={{ background: '#18181b', color: 'white', border: 'none', borderRadius: 999, padding: '8px 20px', fontSize: 13, cursor: 'pointer', transition: 'opacity 200ms' }} onMouseEnter={e => e.target.style.opacity = '0.8'} onMouseLeave={e => e.target.style.opacity = '1'}>Nổi bật</button>
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
                    <img 
                      src={getPlaceholderImage(a)} 
                      alt={a.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms ease' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://res.cloudinary.com/dfvdvkssv/image/upload/v1778288591/hotel_placeholders/market_placeholder.jpg';
                      }}
                    />
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
      <section id="news-sec" style={{ background: '#fafafa', padding: '80px 24px' }}>
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

      {/* MEMBERSHIP */}
      <div id="member">
        <MembershipSection nav={nav} />
      </div>

      {/* FOOTER */}
      <MainFooter />


    </div>
  );
}
