import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Select, Input, Tag, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import attractionApi from '../../api/attractionApi';
import MainHeader from '../../components/Layout/MainHeader';

const { Option } = Select;

const GOLD = '#b8956a';
const DARK = '#111111';

const containerStyle = { width: '100%', height: '100%', borderRadius: 4 };
const hotelLocation  = { lat: 10.948386, lng: 106.790938 };
const mapOptions     = { disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false };

import MainFooter from '../../components/Layout/MainFooter';

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

export default function AttractionsPage() {
  const navigate = useNavigate();
  const [attractions,        setAttractions]        = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [searchTerm,         setSearchTerm]         = useState('');
  const [selectedCategory,   setSelectedCategory]   = useState('All');
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance,           setDistance]           = useState('');
  const [duration,           setDuration]           = useState('');
  const [travelMode,         setTravelMode]         = useState('DRIVING');
  const [authError,          setAuthError]          = useState(false);

  const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Lắng nghe lỗi xác thực Google Maps (API key sai/hết hạn)
  useEffect(() => {
    const prev = window.gm_authFailure;
    window.gm_authFailure = () => {
      console.error('[AttractionMap] Google Maps auth failure — kiểm tra API key và billing.');
      setAuthError(true);
      if (prev) prev();
    };
    return () => { window.gm_authFailure = prev; };
  }, []);

  // Dùng iframe fallback nếu không có key hoặc key bị lỗi
  const useMapFallback = authError || !!loadError || !hasApiKey;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Khám phá Điểm đến - Asteria Resort';
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const res = await attractionApi.getAll();
      setAttractions(res.data.filter(a => a.status !== 'INACTIVE'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const calculateRoute = async (dest) => {
    // ✅ Guard: không gọi Google Maps nếu đang dùng fallback (iframe) hoặc chưa load xong
    if (!dest?.latitude || !dest?.longitude) return;
    if (useMapFallback || !isLoaded) return;
    try {
      // eslint-disable-next-line no-undef
      const svc = new google.maps.DirectionsService();
      // eslint-disable-next-line no-undef
      const results = await svc.route({
        origin: hotelLocation,
        destination: { lat: Number(dest.latitude), lng: Number(dest.longitude) },
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode[travelMode],
      });
      if (results?.routes?.[0]?.legs?.[0]) {
        setDirectionsResponse(results);
        setDistance(results.routes[0].legs[0].distance.text);
        setDuration(results.routes[0].legs[0].duration.text);
      }
    } catch (err) { console.error('[calculateRoute]', err); }
  };

  const handleCardClick = (item) => {
    setSelectedAttraction(item);
    calculateRoute(item);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  useEffect(() => { if (selectedAttraction) calculateRoute(selectedAttraction); }, [travelMode]);

  const categories = ['All', ...new Set(attractions.map(a => a.type).filter(Boolean))];
  const filtered   = attractions.filter(i => {
    const matchName = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat  = selectedCategory === 'All' || i.type === selectedCategory;
    return matchName && matchCat;
  });

  // ✅ Reset trạng thái chọn khi category thay đổi để tránh state bị lỗi
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedAttraction(null);
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <MainHeader />

      {/* Hero */}
      <div style={{ position: 'relative', height: 360, background: DARK, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://images.unsplash.com/photo-1596436889106-be35e843f6a6?q=80&w=2000&auto=format&fit=crop"
          alt="Attractions" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,0.85), rgba(17,17,17,0.4))' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', marginTop: 124 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>ĐIỂM ĐẾN LÂN CẬN</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>Khám Phá Xung Quanh</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, maxWidth: 540, margin: '0 auto' }}>
            Asteria Resort là điểm xuất phát tuyệt vời để khám phá những kỳ quan và nét văn hóa độc đáo của địa phương.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="attr-grid">
          <style>{`@media(max-width:768px){ .attr-grid { grid-template-columns: 1fr !important; } }`}</style>

          {/* LEFT — Search & List */}
          <div style={{ background: 'white', borderRadius: 4, padding: 24, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#18181b', marginBottom: 20 }}>Tìm kiếm điểm đến</h2>

            {/* Search input */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', zIndex: 1 }} />
              <input type="text" placeholder="Nhập tên địa điểm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  style={{ padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: selectedCategory === cat ? DARK : 'transparent', color: selectedCategory === cat ? 'white' : '#71717a', borderColor: selectedCategory === cat ? DARK : '#e5e7eb', transition: 'all 200ms' }}>
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#71717a', padding: '40px 0', fontSize: 13 }}>Không tìm thấy địa điểm phù hợp.</p>
              ) : filtered.map(item => (
                <div key={item.id} onClick={() => handleCardClick(item)}
                  style={{ display: 'flex', gap: 14, padding: 12, borderRadius: 4, cursor: 'pointer', border: `1px solid ${selectedAttraction?.id === item.id ? GOLD : '#f0f0f0'}`, background: selectedAttraction?.id === item.id ? '#fdf8f3' : 'white', transition: 'all 200ms' }}>
                  <div style={{ width: 88, height: 88, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#f0f0f0' }}>
                    <img 
                      src={getPlaceholderImage(item)} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1596436889106-be35e843f6a6?q=80&w=400';
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#18181b', lineHeight: 1.3, margin: 0 }}>{item.name}</h3>
                      {item.type && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD, background: '#fdf3e7', padding: '2px 8px', borderRadius: 2, flexShrink: 0 }}>{item.type}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                    {item.distanceKm && <p style={{ fontSize: 11, color: GOLD, marginTop: 6, margin: 0 }}><EnvironmentOutlined /> Cách resort {item.distanceKm} km</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Map */}
          <div style={{ background: 'white', borderRadius: 4, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'sticky', top: 80, height: 'calc(100vh - 120px)', minHeight: 600 }}>
            {/* Map header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#18181b', margin: 0 }}>
                  {selectedAttraction ? `Đường đi: ${selectedAttraction.name}` : 'Bản đồ Khám phá'}
                </h3>
                {selectedAttraction && distance && duration && (
                  <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>
                    Khoảng cách: <strong style={{ color: '#18181b' }}>{distance}</strong> • Thời gian: <strong style={{ color: '#18181b' }}>{duration}</strong>
                  </p>
                )}
              </div>

            </div>

            {/* Map */}
            <div style={{ flex: 1, position: 'relative' }}>
              {useMapFallback ? (
                // Fallback: OpenStreetMap Iframe with dynamic marker
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedAttraction ? Number(selectedAttraction.longitude) : hotelLocation.lng) - 0.005}%2C${(selectedAttraction ? Number(selectedAttraction.latitude) : hotelLocation.lat) - 0.005}%2C${(selectedAttraction ? Number(selectedAttraction.longitude) : hotelLocation.lng) + 0.005}%2C${(selectedAttraction ? Number(selectedAttraction.latitude) : hotelLocation.lat) + 0.005}&layer=mapnik&marker=${selectedAttraction ? Number(selectedAttraction.latitude) : hotelLocation.lat}%2C${selectedAttraction ? Number(selectedAttraction.longitude) : hotelLocation.lng}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : isLoaded ? (
                <GoogleMap mapContainerStyle={containerStyle} center={selectedAttraction ? { lat: Number(selectedAttraction.latitude), lng: Number(selectedAttraction.longitude) } : hotelLocation} zoom={13} options={mapOptions}>
                  <Marker position={hotelLocation} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} title="Asteria Resort" />
                  {!directionsResponse && attractions.map(item => (
                    <Marker key={item.id} position={{ lat: Number(item.latitude), lng: Number(item.longitude) }} onClick={() => handleCardClick(item)} animation={selectedAttraction?.id === item.id ? 1 : 0} />
                  ))}
                  {directionsResponse && (
                    <DirectionsRenderer directions={directionsResponse} options={{ suppressMarkers: false, polylineOptions: { strokeColor: GOLD, strokeWeight: 5, strokeOpacity: 0.8 } }} />
                  )}
                </GoogleMap>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>
              )}
            </div>

            {/* Book CTA */}
            {selectedAttraction && (
              <div style={{ padding: '18px 24px', background: DARK, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: GOLD, margin: '0 0 4px' }}>Sẵn sàng cho chuyến đi?</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Đặt phòng tại Asteria để bắt đầu hành trình khám phá {selectedAttraction.name}.</p>
                </div>
                <button onClick={() => navigate('/')}
                  style={{ padding: '10px 22px', background: `linear-gradient(135deg, #c9a97a, #9a7b52)`, color: 'white', border: 'none', borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  ĐẶT PHÒNG NGAY →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MainFooter />
    </div>
  );
}
