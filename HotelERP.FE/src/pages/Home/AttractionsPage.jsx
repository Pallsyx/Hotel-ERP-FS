import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Select, Input, Button, Card, Tag, Typography, Spin, Row, Col, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined, CarOutlined, RightOutlined } from '@ant-design/icons';
import attractionApi from '../../api/attractionApi';
import './HomePage.css'; // Reusing global header/footer styles from HomePage.css

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

// Hotel Asteria Location
const hotelLocation = {
  lat: 10.948386, 
  lng: 106.790938
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

export default function AttractionsPage() {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Maps State
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING'); // DRIVING, WALKING, TWO_WHEELER

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Khám phá Điểm đến - Asteria Resort';
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const response = await attractionApi.getAll();
      const activeAttractions = response.data.filter(a => a.status !== 'INACTIVE');
      setAttractions(activeAttractions);
    } catch (error) {
      console.error("Lỗi khi tải điểm đến:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async (destination) => {
    if (!destination || !destination.latitude || !destination.longitude) return;
    
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: hotelLocation,
        destination: { lat: destination.latitude, lng: destination.longitude },
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode[travelMode],
      });
      
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      console.error("Directions request failed due to", error);
    }
  };

  const handleCardClick = (attraction) => {
    setSelectedAttraction(attraction);
    calculateRoute(attraction);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Nếu đổi phương tiện di chuyển, tính lại đường đi
  useEffect(() => {
    if (selectedAttraction) {
      calculateRoute(selectedAttraction);
    }
  }, [travelMode]);

  // Lọc dữ liệu
  const filteredAttractions = attractions.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || item.type === selectedCategory;
    return matchName && matchCategory;
  });

  const categories = ['All', ...new Set(attractions.map(a => a.type).filter(Boolean))];

  return (
    <div className="home-container bg-gray-50 min-h-screen">
      {/* 1. TOP HEADER BARS */}
      <div className="top-bar">
          <div className="top-bar-left">
              <span>📍 Asteria Resort, 123 Đường Ven Biển, Nha Trang</span>
              <span>📞 +84 123 456 789</span>
          </div>
          <div className="top-bar-right">
              <a href="#">Về chúng tôi</a>
              <a href="#">Liên hệ</a>
              <span>Ngôn ngữ: Tiếng Việt 🇻🇳</span>
          </div>
      </div>

      <header className="main-header">
          <div className="logo-container cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="logo-text">ASTERIA</h1>
              <p className="logo-subtext">LUXURY RESORT & SPA</p>
          </div>
          <nav className="nav-menu">
              <a onClick={() => navigate('/')}>TRANG CHỦ</a>
              <a href="#">PHÒNG & SUITE</a>
              <a href="#">DỊCH VỤ</a>
              <a href="#">NHÀ HÀNG</a>
              <a href="#">SPA</a>
              <a onClick={() => navigate('/news')}>TIN TỨC</a>
              <a onClick={() => navigate('/attractions')} className="active">KHÁM PHÁ</a>
          </nav>
          <div className="header-actions">
              <button className="btn-book-now" onClick={() => navigate('/booking/search')}>
                  ĐẶT PHÒNG NGAY
              </button>
          </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-[#262b3f] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1596436889106-be35e843f6a6?q=80&w=2000" 
          alt="Khám phá điểm đến" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 shadow-sm">Khám Phá Điểm Đến Lân Cận</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto font-light">
            Asteria Resort không chỉ là nơi nghỉ dưỡng hoàn hảo mà còn là điểm xuất phát tuyệt vời để bạn khám phá những kỳ quan và nét văn hóa độc đáo của địa phương.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Row gutter={[32, 32]}>
          
          {/* Lưới Điểm Đến */}
          <Col xs={24} lg={12} xl={10}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 sticky top-6">
              <h2 className="text-2xl font-serif text-[#262b3f] mb-6">Tìm kiếm điểm đến</h2>
              
              <div className="flex flex-col gap-4 mb-6">
                <Input 
                  size="large" 
                  placeholder="Nhập tên địa điểm..." 
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg"
                />
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Tag.CheckableTag
                      key={cat}
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className={`text-sm px-4 py-1.5 rounded-full border ${selectedCategory === cat ? 'bg-[#b4976c] text-white border-[#b4976c]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#b4976c]'}`}
                    >
                      {cat === 'All' ? 'Tất cả' : cat}
                    </Tag.CheckableTag>
                  ))}
                </div>
              </div>

              {/* Danh sách cuộn */}
              <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '400px' }}>
                {loading ? (
                  <div className="flex justify-center items-center h-40"><Spin size="large" /></div>
                ) : filteredAttractions.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">Không tìm thấy địa điểm nào phù hợp.</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredAttractions.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${selectedAttraction?.id === item.id ? 'border-[#b4976c] bg-[#fdfbf7] shadow-md' : 'border-gray-100 hover:border-[#b4976c]/50 hover:bg-gray-50'}`}
                        onClick={() => handleCardClick(item)}
                      >
                        <img 
                          src={item.imageUrl || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-serif text-[#262b3f] leading-tight m-0">{item.name}</h3>
                            {item.type && <Tag color="gold" className="m-0 border-none">{item.type}</Tag>}
                          </div>
                          <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-gray-500 m-0 mt-1">
                            {item.description}
                          </Paragraph>
                          {item.distanceKm && (
                            <div className="text-xs text-[#b4976c] mt-2 font-medium flex items-center gap-1">
                              <EnvironmentOutlined /> Cách resort {item.distanceKm} km
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Bản đồ & Thông tin chỉ đường */}
          <Col xs={24} lg={12} xl={14}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6 h-[calc(100vh-100px)] min-h-[600px] flex flex-col">
              
              {/* Header của Bản đồ */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-lg font-medium text-[#262b3f] m-0">
                    {selectedAttraction ? `Đường đi đến: ${selectedAttraction.name}` : 'Bản đồ Khám phá'}
                  </h3>
                  {selectedAttraction && distance && duration && (
                    <p className="text-sm text-gray-500 m-0 mt-1">
                      Khoảng cách: <span className="font-semibold text-gray-800">{distance}</span> • Thời gian: <span className="font-semibold text-gray-800">{duration}</span>
                    </p>
                  )}
                </div>

                {selectedAttraction && (
                  <Select 
                    value={travelMode} 
                    onChange={setTravelMode}
                    style={{ width: 130 }}
                    options={[
                      { value: 'DRIVING', label: '🚗 Ô tô' },
                      { value: 'TWO_WHEELER', label: '🛵 Xe máy' },
                      { value: 'WALKING', label: '🚶 Đi bộ' },
                    ]}
                  />
                )}
              </div>

              {/* Khung Bản đồ */}
              <div className="flex-1 relative">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={selectedAttraction ? { lat: selectedAttraction.latitude, lng: selectedAttraction.longitude } : hotelLocation}
                    zoom={13}
                    options={mapOptions}
                  >
                    {/* Điểm xuất phát (Resort) */}
                    <Marker 
                      position={hotelLocation} 
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      }}
                      title="Asteria Resort"
                    />

                    {/* Các điểm đến (Nếu chưa chọn điểm nào để chỉ đường, hiển thị tất cả) */}
                    {!directionsResponse && attractions.map(item => (
                      <Marker
                        key={item.id}
                        position={{ lat: item.latitude, lng: item.longitude }}
                        onClick={() => handleCardClick(item)}
                        animation={selectedAttraction?.id === item.id ? 1 : 0} // BOUNCE
                      />
                    ))}

                    {/* Chỉ đường */}
                    {directionsResponse && (
                      <DirectionsRenderer 
                        directions={directionsResponse} 
                        options={{
                          suppressMarkers: false,
                          polylineOptions: {
                            strokeColor: "#b4976c",
                            strokeWeight: 5,
                            strokeOpacity: 0.8
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <Spin size="large" />
                  </div>
                )}
              </div>
              
              {/* Box Đặt phòng */}
              {selectedAttraction && (
                <div className="p-6 bg-[#262b3f] text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="text-xl font-serif mb-1 text-[#b4976c]">Sẵn sàng cho chuyến đi?</h4>
                    <p className="text-white/80 text-sm m-0">Đặt phòng tại Asteria Resort để bắt đầu hành trình khám phá {selectedAttraction.name}.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/booking/search')}
                    className="px-6 py-3 bg-[#b4976c] hover:bg-[#9c825a] text-white font-medium tracking-wide rounded-md transition-colors whitespace-nowrap flex items-center gap-2"
                  >
                    ĐẶT PHÒNG NGAY <RightOutlined className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </Col>

        </Row>
      </div>

      {/* FOOTER */}
      <footer className="footer-section">
          <div className="footer-content">
              <div className="footer-col">
                  <h3 className="footer-logo">ASTERIA</h3>
                  <p className="footer-desc">
                      Khu nghỉ dưỡng đẳng cấp 5 sao mang đến trải nghiệm lưu trú hoàn hảo với dịch vụ tận tâm và không gian sang trọng bậc nhất.
                  </p>
              </div>
              <div className="footer-col">
                  <h4>Liên Hệ</h4>
                  <p>📍 123 Đường Ven Biển, TP. Nha Trang</p>
                  <p>📞 +84 123 456 789</p>
                  <p>✉️ reservation@asteria.com</p>
              </div>
              <div className="footer-col">
                  <h4>Liên Kết</h4>
                  <p><a href="#">Về chúng tôi</a></p>
                  <p><a href="#">Tuyển dụng</a></p>
                  <p><a href="#">Điều khoản sử dụng</a></p>
                  <p><a href="#">Chính sách bảo mật</a></p>
              </div>
              <div className="footer-col">
                  <h4>Nhận Ưu Đãi</h4>
                  <p>Đăng ký email để nhận những thông báo khuyến mãi mới nhất.</p>
                  <div className="newsletter">
                      <input type="email" placeholder="Email của bạn..." />
                      <button>Gửi</button>
                  </div>
              </div>
          </div>
          <div className="footer-bottom">
              <p>&copy; 2026 Asteria Resort. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
