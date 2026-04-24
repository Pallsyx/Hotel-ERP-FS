import React from 'react';
import './HomePage.css';

export default function HomePage() {
    return (
        <div className="homepage-wrapper">

            {/* ==================== 1. HEADER & HERO SECTION ==================== */}
            <section className="hero-section">
                {/* Background Image */}
                <div className="hero-bg">
                    <div className="hero-overlay"></div>
                </div>

                {/* Navbar */}
                <header className="header-navbar">
                    <div className="logo-text">Asteria</div>
                    <nav className="nav-links">
                        <a href="#" className="nav-item">Trang Chủ</a>
                        <a href="#about" className="nav-item">Giới Thiệu</a>
                        <a href="#rooms" className="nav-item">Phòng</a>
                        <a href="#services" className="nav-item">Trang</a>
                        <a href="#contact" className="nav-item">Liên Hệ</a>
                    </nav>
                    <button className="btn-book-now">
                        Đặt Phòng Ngay
                    </button>
                </header>

                {/* Hero Title */}
                <div className="hero-title-container">
                    <h1 className="hero-title">
                        Không gian nghỉ dưỡng đẳng cấp,<br />hoà mình cùng thiên nhiên.
                    </h1>
                </div>

                {/* BOOKING BAR */}
                <div className="booking-bar-wrapper">
                    <div className="booking-bar-inner">
                        <div className="booking-grid">
                            {/* Check in / Check out */}
                            <div className="booking-col-span-2">
                                <div className="booking-label-group">
                                    <span>Check in *</span>
                                    <span>Check out *</span>
                                </div>
                                <div className="booking-input-group">
                                    <input type="text" placeholder="Ngày đến" className="booking-input" />
                                    <span className="booking-input-separator">→</span>
                                    <input type="text" placeholder="Ngày đi" className="booking-input-right" />
                                </div>
                            </div>

                            {/* Adults */}
                            <div className="booking-col">
                                <span className="booking-label">Người lớn *</span>
                                <select className="booking-select">
                                    <option>Chọn số lượng</option>
                                    <option>1 Người</option>
                                    <option>2 Người</option>
                                </select>
                            </div>

                            {/* Rooms */}
                            <div className="booking-col">
                                <span className="booking-label">Phòng *</span>
                                <select className="booking-select">
                                    <option>Chọn số lượng</option>
                                    <option>1 Phòng</option>
                                    <option>2 Phòng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button className="btn-create-booking">
                        Tạo Đơn Đặt Phòng
                    </button>
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
                                <span className="hotline-number">024 2242 0777</span>
                            </div>
                        </div>

                        {/* Image Right */}
                        <div className="room-image-col">
                            <img
                                src="https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=1000&auto=format&fit=crop"
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

            {/* ==================== 6. NEWS & WEDDING PACKAGE ==================== */}
            <section className="news-wedding-section">

                {/* Tin tức */}
                <div className="news-wrapper">
                    <p className="section-subtitle-white">Thông cáo báo chí</p>
                    <h2 className="news-title">Tin Tức Mới Nhất Từ Resort</h2>

                    <div className="news-grid">
                        <div className="news-card">
                            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400" className="news-card-img" alt="News" />
                            <div className="news-card-content">
                                <h3 className="news-card-title">Khai trương khu Spa phong cách Nhật Bản mới.</h3>
                                <p className="news-card-date">Ngày 3 Tháng 4, 2026</p>
                            </div>
                        </div>
                        <div className="news-card">
                            <img src="https://images.unsplash.com/photo-1542314831-c6a4d4586f37?q=80&w=400" className="news-card-img" alt="News" />
                            <div className="news-card-content">
                                <h3 className="news-card-title">Nhận giải thưởng khu nghỉ dưỡng thân thiện gia đình.</h3>
                                <p className="news-card-date">Ngày 15 Tháng 4, 2026</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tiệc Cưới */}
                <div className="wedding-section">
                    <div className="wedding-bg-layer"></div>

                    <div className="wedding-wrapper">
                        <p className="section-subtitle-white">Tiệc Cưới</p>
                        <h2 className="wedding-title">Các Gói Tổ Chức Tiệc Cưới Tại Resort</h2>

                        <div className="wedding-grid">
                            {['SILVER', 'GOLD', 'PLATINUM'].map((pkg, idx) => (
                                <div key={idx} className="wedding-pkg-card">
                                    <h3 className="wedding-pkg-name">{pkg}</h3>
                                    <p className="wedding-pkg-price">{50 + idx * 30} USD/khách</p>
                                    <ul className="wedding-pkg-features">
                                        <li>✓ Trang trí không gian lễ cưới cao cấp</li>
                                        <li>✓ Bữa tối thực đơn 5 món chọn lọc</li>
                                        <li>✓ Tặng phòng tân hôn hạng Suite</li>
                                    </ul>
                                    <button className="wedding-pkg-btn">Xem Chi Tiết →</button>
                                </div>
                            ))}
                        </div>
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
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.790518386828!2d106.79093836373703!3d10.948386121980646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d9e03d40cb93%3A0xe5560b4de0c92ec9!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBM4bqhYyBI4buTbmc!5e0!3m2!1svi!2s!4v1714000000000!5m2!1svi!2s"
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
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

        </div>
    );
}