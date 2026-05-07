import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GOLD = '#b8956a';
const DARK = '#111111';

/* ── helpers ── */
function formatVND(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}
function formatDateVI(str) {
  const d = new Date(str);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

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

/* ── Room Type Card ── */
function RoomCard({ room, nights, onBook }) {
  const [hovered, setHovered] = useState(false);
  const totalPrice = room.basePrice * nights;
  const fallbackImg = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 6, overflow: 'hidden',
        border: `1px solid ${hovered ? GOLD : '#e5e7eb'}`,
        boxShadow: hovered ? '0 12px 36px rgba(184,149,106,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 280ms ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ height: 200, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img
          src={room.imageUrl || fallbackImg}
          alt={room.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        />
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#16a34a', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 2, letterSpacing: '.1em' }}>
          {room.availableCount} phòng trống
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#18181b', margin: '0 0 6px' }}>{room.name}</h3>

        {/* Quick specs */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
          {room.sizeSqm && <span style={specStyle}>📐 {room.sizeSqm} m²</span>}
          {room.bedType  && <span style={specStyle}>🛏 {room.bedType}</span>}
          <span style={specStyle}>👥 {room.capacityAdults} người lớn{room.capacityChildren > 0 ? `, ${room.capacityChildren} trẻ em` : ''}</span>
        </div>

        {room.description && (
          <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {room.amenities.slice(0, 5).map(a => (
              <span key={a} style={{ fontSize: 10, color: '#71717a', border: '1px solid #e5e7eb', borderRadius: 2, padding: '2px 8px' }}>{a}</span>
            ))}
            {room.amenities.length > 5 && <span style={{ fontSize: 10, color: GOLD }}>+{room.amenities.length - 5} khác</span>}
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: '#a1a1aa', margin: 0, letterSpacing: '.1em', textTransform: 'uppercase' }}>Giá / đêm</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: '2px 0 0', fontFamily: "'Playfair Display', serif" }}>{formatVND(room.basePrice)}</p>
            {nights > 1 && <p style={{ fontSize: 11, color: '#71717a', margin: '2px 0 0' }}>Tổng {nights} đêm: {formatVND(totalPrice)}</p>}
          </div>
          <button
            onClick={() => onBook(room)}
            style={{
              padding: '11px 22px', background: DARK, color: 'white',
              border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 700,
              letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'background 200ms', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = GOLD}
            onMouseLeave={e => e.currentTarget.style.background = DARK}
          >
            Đặt ngay →
          </button>
        </div>
      </div>
    </div>
  );
}

const specStyle = { fontSize: 12, color: '#52525b', display: 'flex', alignItems: 'center', gap: 4 };

/* ═════════════════════════════════════════════
   SEARCH RESULTS PAGE
═════════════════════════════════════════════ */
export default function SearchResultsPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // state comes from RoomSearchWidget navigate('/rooms/search-results', { state: result })
  const searchParams   = state?.searchParams   ?? null;
  const availableRooms = state?.availableRooms ?? [];
  const nights         = searchParams?.nights  ?? 1;

  const handleBook = (room) => {
    // Navigate to booking flow with selected room + search params
    navigate('/booking/new', {
      state: {
        roomTypeId: room.id,          // Backend trả về "id" không phải "roomTypeId"
        roomName:   room.name,
        basePrice:  room.basePrice,
        availableCount: room.availableCount,
        ...searchParams,
      },
    });
  };

  return (
    <div style={{ background: '#f5f5f4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Header />

      {/* ── Hero bar ── */}
      <div style={{ background: DARK, paddingTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 24px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: GOLD, margin: '0 0 8px' }}>KẾT QUẢ TÌM KIẾM</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'white', margin: 0 }}>
            Phòng trống tại Asteria Resort
          </h1>
          {searchParams && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              <span>📅 {formatDateVI(searchParams.checkIn)} → {formatDateVI(searchParams.checkOut)} ({nights} đêm)</span>
              <span>👥 {searchParams.adults} người lớn{searchParams.children > 0 ? `, ${searchParams.children} trẻ em` : ''}</span>
              <span>🏨 {searchParams.rooms} phòng</span>
              <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.65)', padding: '4px 12px', borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>
        {!state ? (
          /* No search data — came directly to URL */
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 16, color: '#71717a' }}>Không có dữ liệu tìm kiếm. Vui lòng quay lại trang chủ và tìm kiếm lại.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '10px 24px', background: DARK, color: 'white', border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer' }}>
              Về Trang Chủ
            </button>
          </div>
        ) : availableRooms.length === 0 ? (
          /* Empty results */
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#18181b', marginBottom: 8 }}>Không có phòng phù hợp</h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24 }}>Rất tiếc, không còn phòng trống trong khoảng thời gian bạn chọn.<br />Hãy thử chọn ngày khác hoặc điều chỉnh số khách.</p>
            <button onClick={() => navigate(-1)} style={{ padding: '11px 28px', background: DARK, color: 'white', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Tìm Lại
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#71717a', marginBottom: 24 }}>
              Tìm thấy <strong style={{ color: '#18181b' }}>{availableRooms.length}</strong> loại phòng phù hợp
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {availableRooms.map(room => (
                <RoomCard key={room.roomTypeId} room={room} nights={nights} onBook={handleBook} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
