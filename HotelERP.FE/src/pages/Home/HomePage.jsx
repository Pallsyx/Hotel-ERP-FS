import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import AttractionMap from '../../components/Map/AttractionMap';
import articleApi from '../../api/articleApi';

export default function HomePage() {
    const navigate = useNavigate();
    // Lấy ngày hiện tại (real time) theo chuẩn yyyy-mm-dd để gắn vào input date
    const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' trả về format YYYY-MM-DD tương thích với input type="date"
    // ---------------------------------------------------------
    // Lấy danh sách bài viết từ CMS để hiển thị ra trang chủ
    // ---------------------------------------------------------
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        // Gọi API lấy bài viết
        setLoadingArticles(true);
        articleApi.search().then((res) => {
            // Giới hạn hiển thị 6 bài mới nhất ở trang chủ
            setArticles(res.data ? res.data.slice(0, 6) : []);
        }).catch(err => {
            console.error("Lỗi khi tải bài viết:", err);
        }).finally(() => {
            setLoadingArticles(false);
        });
    }, []);

    // ==========================================
    // SEO Cập nhật Meta Title và Meta Description
    // ==========================================
    useEffect(() => {
        if (selectedArticle) {
            // Lưu lại title gốc để lát sau trả về
            const originalTitle = document.title;
            
            // Cập nhật thẻ Title
            document.title = selectedArticle.metaTitle || selectedArticle.title || 'Asteria Resort';
            
            // Cập nhật hoặc tạo mới thẻ Meta Description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = selectedArticle.metaDescription || selectedArticle.summary || '';

            return () => {
                // Khôi phục title và description khi đóng modal
                document.title = originalTitle;
            };
        } else {
            document.title = 'Asteria Resort - Không gian nghỉ dưỡng đẳng cấp';
        }
    }, [selectedArticle]);

    // ---------------------------------------------------------
    // Hero Slider State
    // ---------------------------------------------------------
    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2000&auto=format&fit=crop",
            title: "Không gian nghỉ dưỡng đẳng cấp,\nhoà mình cùng thiên nhiên."
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=2000&auto=format&fit=crop",
            title: "Đặc quyền hội viên thượng lưu,\ntận hưởng kỳ nghỉ trọn vẹn."
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop",
            title: "Khám phá tinh hoa ẩm thực,\nđánh thức mọi giác quan."
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
            title: "Thư giãn tuyệt đối tại Spa,\nthanh lọc tâm hồn và cơ thể."
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => nextSlide(), 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="homepage-wrapper">

            {/* ==================== 1. HEADER & HERO SECTION ==================== */}
            <section className="hero-section group">
                {/* Background Images */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`hero-bg ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    ></div>
                ))}
                <div className="hero-overlay"></div>

                {/* Navbar */}
                <header className="header-navbar">
                    <div className="logo-text">Asteria</div>
                    <nav className="nav-links">
                        <a href="#" className="nav-item">Trang Chủ</a>
                        <a href="#about" className="nav-item">Giới Thiệu</a>
                        <a href="#rooms" className="nav-item">Phòng</a>
                        <a href="/news" className="nav-item">Tin Tức</a>
                        <a href="#contact" className="nav-item">Liên Hệ</a>
                    </nav>
                    <div className="navbar-auth-group">
                        <button
                            id="btn-login"
                            className="btn-login-outline"
                            onClick={() => navigate('/login')}
                        >
                            Đăng Nhập
                        </button>
                        <button
                            id="btn-register"
                            className="btn-register-filled"
                            onClick={() => navigate('/register')}
                        >
                            Đăng Ký
                        </button>
                    </div>
                </header>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20 z-10 opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-all border border-white/20 z-10 opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Hero Title */}
                <div className="hero-title-container px-20">
                    <h1 className="hero-title whitespace-pre-line transition-all duration-700 transform translate-y-0 opacity-100" key={currentSlide}>
                        {slides[currentSlide].title}
                    </h1>
                </div>

            </section>

            {/* ==================== 2. ROOM & ESCAPE SECTION ==================== */}
            <section className="room-section">
                <div className="room-section-inner">

                    <div className="room-content-wrapper">
                        {/* Text Content */}
                        <div className="room-text-col">
                            <p className="section-subtitle-dark">Phòng nghỉ</p>
                            <h2 className="section-title-dark">
                                Tìm kiếm không gian<br />hoàn hảo cho kỳ nghỉ.
                            </h2>
                            <p className="section-desc-light">
                                Tận hưởng sự yên bình tuyệt đối trong không gian sang trọng được thiết kế tinh tế. Từ ban công riêng tư, quý khách có thể chiêm ngưỡng trọn vẹn vẻ đẹp của bình minh trên đại dương.
                            </p>
                            <div className="hotline-wrapper">
                                <span className="hotline-label">Hotline Đặt Phòng</span>
                                <span className="hotline-number">0363332841</span>
                            </div>
                        </div>

                        {/* Image Right */}
                        <div className="room-image-col">
                            <img
                                src="https://dulichkhampha24.com/wp-content/uploads/2020/08/khach-san-fivitel-hoi-an-2.jpg"
                                alt="Family in Hotel"
                                className="room-main-image"
                            />
                        </div>
                    </div>

                    {/* Room Cards Horizontal Scroll */}
                    <div className="room-cards-scroll">
                        {[
                            "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600",
                            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600",
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600",
                            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600"
                        ].map((img, idx) => (
                            <div key={idx} className="room-card">
                                <img src={img} alt="Room Type" className="room-card-image" />
                                <div className="room-card-overlay"></div>
                                <p className="room-card-title">The Cottage</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== 3. RESORT EXPERIENCE ==================== */}
            <section className="experience-section">
                {/* Nền xanh Navy bên phải */}
                <div className="experience-bg-right"></div>

                <div className="experience-wrapper">

                    <div className="experience-text-box">
                        <p className="section-subtitle-white">Khu Nghỉ Dưỡng</p>
                        <h2 className="section-title-white">
                            Trải Nghiệm Kỳ Nghỉ Thiên Đường Độc Bản
                        </h2>
                        <p className="section-desc-light">
                            Khám phá vẻ đẹp ngoạn mục của thiên nhiên hoang sơ kết hợp cùng dịch vụ chăm sóc cá nhân hóa, mang đến cho bạn những khoảnh khắc vô giá bên người thân yêu.
                        </p>

                        {/* Video Placeholder Box */}
                        <div className="video-placeholder">
                            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800" className="video-cover" alt="Video cover" />
                            <div className="video-play-btn">
                                <div className="video-play-icon"></div>
                            </div>
                        </div>

                        <div className="experience-booking">
                            <span className="experience-booking-label">Bộ Phận Đặt Phòng</span>
                            <span className="experience-booking-number">024 2242 0777</span>
                        </div>
                    </div>

                    <div className="experience-image-wrapper">
                        <img
                            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop"
                            alt="Resort Pool"
                            className="experience-image"
                        />
                    </div>
                </div>
            </section>

            {/* ==================== 4. RESTAURANT SECTION ==================== */}
            <section className="restaurant-section">
                <div className="restaurant-wrapper">

                    {/* Cột trái: Ảnh đè lên khối vàng */}
                    <div className="restaurant-image-col">
                        <div className="restaurant-bg-block">
                            <div className="restaurant-hours-box">
                                <p className="restaurant-hours-title">Mở cửa hàng ngày</p>
                                <p className="restaurant-hours-time">09:00 AM - 23:00 PM</p>
                                <button className="btn-detail">Xem Chi Tiết</button>
                            </div>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800"
                            alt="Restaurant"
                            className="restaurant-main-image"
                        />
                    </div>

                    {/* Cột phải: Text & Accordion */}
                    <div className="restaurant-text-col">
                        <p className="section-subtitle-gold">Nhà Hàng</p>
                        <h2 className="restaurant-title">
                            Không Gian Ẩm Thực<br />Lãng Mạn Nhất
                        </h2>
                        <p className="section-desc-light">
                            Đánh thức vị giác của bạn với thực đơn đa dạng được chuẩn bị bởi các đầu bếp sao Michelin, trong không gian sang trọng nhìn ra đại dương bao la.
                        </p>

                        <div className="accordion-container">
                            {['Gói Bữa Tối Lãng Mạn', 'Tiệc Sinh Nhật Kỷ Niệm', 'Buffet Sáng Cao Cấp', 'Bữa Trưa Doanh Nhân'].map((item, idx) => (
                                <div key={idx} className="accordion-item">
                                    <span className="accordion-title">{item}</span>
                                    <span className="text-gray-500">+</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 5. ACTIVITIES & SERVICES GRID ==================== */}
            <section className="activities-section">
                <div className="activities-wrapper">

                    <div className="activities-header-col">
                        <p className="section-subtitle-white">Hoạt Động</p>
                        <h2 className="activities-title">Các Hoạt Động<br />& Tiện Ích</h2>
                        <button className="btn-read-more">
                            Xem Thêm
                        </button>
                    </div>

                    <div className="activities-grid">
                        {[
                            { title: "Trung Tâm Thể Hình", icon: "🏋️" },
                            { title: "Ẩm Thực Đặc Sắc", icon: "🍽️" },
                            { title: "Hồ Bơi Vô Cực", icon: "🏊" },
                            { title: "Wifi Tốc Độ Cao", icon: "📶" },
                            { title: "Nhà Hàng Cao Cấp", icon: "🍷" },
                            { title: "Spa Thư Giãn", icon: "💆" }
                        ].map((item, idx) => (
                            <div key={idx} className="activity-card">
                                <div className="activity-icon">{item.icon}</div>
                                <h3 className="activity-title">{item.title}</h3>
                                <p className="activity-desc">
                                    Được trang bị các tiện nghi hiện đại bậc nhất, mang đến cho quý khách trải nghiệm nâng tầm đẳng cấp trong suốt kỳ nghỉ dưỡng.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== 5.5 ATTRACTIONS ==================== */}
            <section className="bg-[#262b3f] py-16 px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[#b4976c] tracking-[0.2em] uppercase text-[10px] font-bold mb-4">Khám Phá</p>
                        <h2 className="text-4xl font-serif text-white leading-snug">Các Điểm Đến Lân Cận</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Bửu Long */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800" alt="Khu du lịch Bửu Long" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Khu du lịch Bửu Long</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Được ví như "Vịnh Hạ Long thu nhỏ", nổi bật với hồ nước trong xanh và những cụm núi đá hùng vĩ tuyệt đẹp.
                                </p>
                            </div>
                        </div>

                        {/* Trấn Biên */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800" alt="Văn miếu Trấn Biên" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Văn miếu Trấn Biên</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Biểu tượng văn hóa lâu đời của Đồng Nai. Kiến trúc cổ kính tôn vinh truyền thống hiếu học của người Việt.
                                </p>
                            </div>
                        </div>

                        {/* Biên Hùng */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800" alt="Công viên Biên Hùng" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Công viên Biên Hùng</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Lá phổi xanh giữa lòng thành phố. Điểm hẹn lý tưởng để tản bộ, ngắm hồ và tham gia vui chơi giải trí.
                                </p>
                            </div>
                        </div>

                        {/* Amazing Bay */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800" alt="Vịnh Kỳ Diệu" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Vịnh Kỳ Diệu</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Siêu công viên nước Amazing Bay với những trò chơi đẳng cấp quốc tế, đánh bay cái nóng mùa hè oi bức.
                                </p>
                            </div>
                        </div>

                        {/* Chùa Ông */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=800" alt="Thất Phủ Cổ Miếu" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Thất Phủ Cổ Miếu</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Ngôi chùa linh thiêng mang đậm kiến trúc, dấu ấn lịch sử và văn hóa tín ngưỡng độc đáo tại Đồng Nai.
                                </p>
                            </div>
                        </div>

                        {/* Giang Điền */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 cursor-pointer group flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800" alt="Thác Giang Điền" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center items-center">
                                <h3 className="text-xl font-serif text-[#262b3f] mb-4 text-center leading-snug">Thác Giang Điền</h3>
                                <p className="text-gray-600 text-sm leading-relaxed text-center">
                                    Khu du lịch sinh thái nổi tiếng với cảnh quan thiên nhiên hoang sơ, dòng thác hiền hòa và đa dạng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 6. NEWS & WEDDING PACKAGE ==================== */}
            <section className="news-wedding-section">

                {/* Tin tức */}
                <div className="news-wrapper">
                    <p className="section-subtitle-white">Thông cáo báo chí</p>
                    <h2 className="news-title">Tin Tức Mới Nhất Từ Resort</h2>

                    <div className="news-grid">
                        {loadingArticles ? (
                            <div style={{ color: '#fff', fontSize: '14px', fontStyle: 'italic' }}>Đang tải bài viết mới nhất...</div>
                        ) : articles.length > 0 ? (
                            articles.map(item => {
                                const dateStr = new Date(item.publishedAt || new Date()).toLocaleDateString('vi-VN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                });
                                return (
                                    <div 
                                        className="news-card" 
                                        key={item.id}
                                        onClick={() => setSelectedArticle(item)}
                                    >
                                        <img src={item.thumbnailUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400"} className="news-card-img" alt={item.title} style={{ objectFit: 'cover' }} />
                                        <div className="news-card-content">
                                            <h3 className="news-card-title">{item.title}</h3>
                                            <p className="news-card-date">Ngày {dateStr}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ color: '#fff', fontSize: '14px', fontStyle: 'italic' }}>Chưa có bài viết nào được xuất bản.</div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <button 
                            className="btn-discover"
                            onClick={() => window.location.href = '/news'}
                            style={{ padding: '1rem 3rem' }}
                        >
                            Xem Tất Cả Tin Tức
                        </button>
                    </div>
                </div>
            </section>

            {/* ==================== 7. FOOTER ==================== */}
            <footer className="footer-section">
                <div className="footer-top-grid">

                    <div className="footer-col-main">
                        <div className="footer-logo">Asteria</div>
                        <p className="footer-address">
                            Số 10, Huỳnh Văn Nghệ, phường Bửu Long,<br />TP. Biên Hòa, tỉnh Đồng Nai
                        </p>
                        <p className="footer-phone">
                            <span className="footer-phone-icon">📞</span> 0987244924
                        </p>
                        <div className="footer-map-wrapper">
                            <AttractionMap isFooter={true} />
                        </div>
                        <p className="footer-newsletter-title">Đăng Ký Bản Tin</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Nhập email của bạn..." className="newsletter-input" />
                            <button className="newsletter-btn">
                                Gửi Đăng Ký
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Liên Kết Nhanh</h4>
                        <ul className="footer-links-list">
                            <li><a href="#" className="footer-link">Trang Chủ</a></li>
                            <li><a href="#" className="footer-link">Giới Thiệu</a></li>
                            <li><a href="#" className="footer-link">Phòng Nghỉ</a></li>
                            <li><a href="#" className="footer-link">Tin Tức</a></li>
                            <li><a href="#" className="footer-link">Liên Hệ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Chính Sách</h4>
                        <ul className="footer-links-list mb-10">
                            <li><a href="#" className="footer-link">Điều Khoản</a></li>
                            <li><a href="#" className="footer-link">Quy Định Chung</a></li>
                        </ul>
                        <h4 className="footer-col-title">Bài Viết</h4>
                        <ul className="footer-links-list">
                            <li><a href="#" className="footer-link">Blog Du Lịch</a></li>
                            <li><a href="#" className="footer-link">Khuyến Mãi</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Thư Viện Ảnh</h4>
                        <div className="gallery-grid">
                            <img src="https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=200" className="gallery-img" alt="Gallery" />
                            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=200" className="gallery-img" alt="Gallery" />
                            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200" className="gallery-img" alt="Gallery" />
                            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200" className="gallery-img" alt="Gallery" />
                            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=200" className="gallery-img" alt="Gallery" />
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=200" className="gallery-img" alt="Gallery" />
                        </div>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>Copyright 2026. All Right Reserved by Asteria.</p>
                </div>
            </footer>

            {/* ==================== ARTICLE MODAL ==================== */}
            <div className={`article-modal-overlay ${selectedArticle ? 'show' : ''}`} onClick={() => setSelectedArticle(null)}>
                <div className="article-modal-container" onClick={e => e.stopPropagation()}>
                    {/* Nút đóng */}
                    <button className="article-modal-close" onClick={() => setSelectedArticle(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {selectedArticle && (
                        <>
                            {/* Ảnh bìa bài viết */}
                            <img 
                                src={selectedArticle.thumbnailUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200"} 
                                alt={selectedArticle.title} 
                                className="article-modal-header-img"
                            />
                            
                            {/* Nội dung bài viết */}
                            <div className="article-modal-body">
                                <h2 className="article-modal-title">{selectedArticle.title}</h2>
                                <div className="article-modal-meta">
                                    <span>
                                        Đăng ngày: {new Date(selectedArticle.publishedAt || new Date()).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {selectedArticle.category && (
                                        <>
                                            <span>•</span>
                                            <span className="text-[#b4976c] uppercase tracking-widest text-xs font-bold">{selectedArticle.category}</span>
                                        </>
                                    )}
                                </div>
                                <div 
                                    className="article-modal-content"
                                    dangerouslySetInnerHTML={{ __html: selectedArticle.content || "<p>Nội dung bài viết đang được cập nhật...</p>" }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}