import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../../api/articleApi';
import './NewsPage.css';

export default function NewsPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchArticles('', '');
    }, []);

    const fetchArticles = (keyword, category) => {
        setLoading(true);
        articleApi.search(keyword, category).then(res => {
            setArticles(res.data || []);
            // Lọc ra danh sách chuyên mục duy nhất từ các bài viết nếu chưa có
            if (categories.length === 0 && res.data) {
                const uniqueCategories = [...new Set(res.data.map(item => item.categoryName).filter(Boolean))];
                setCategories(uniqueCategories);
            }
        }).catch(err => {
            console.error("Lỗi khi lấy bài viết:", err);
        }).finally(() => {
            setLoading(false);
        });
    };

    // Hàm gọi khi nhấn nút tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        fetchArticles(searchTerm, selectedCategory);
    };

    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setSelectedCategory(cat);
        fetchArticles(searchTerm, cat);
    };

    // ==========================================
    // SEO Cập nhật Meta Title và Meta Description
    // ==========================================
    useEffect(() => {
        if (selectedArticle) {
            // Lưu lại title gốc để lát sau trả về
            const originalTitle = document.title;
            
            // Cập nhật thẻ Title
            document.title = selectedArticle.metaTitle || selectedArticle.title || 'Tin Tức - Asteria Resort';
            
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
            document.title = 'Tin Tức - Asteria Resort';
        }
    }, [selectedArticle]);

    return (
        <div className="news-page-wrapper">
            {/* 1. Header (Navbar + Hero Banner) */}
            <section className="news-hero-section">
                <div className="news-hero-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000)' }}></div>
                <div className="hero-overlay"></div>
                
                <header className="header-navbar">
                    <div className="logo-text cursor-pointer" onClick={() => navigate('/')}>Asteria</div>
                    <nav className="nav-links">
                        <a onClick={() => navigate('/')} className="nav-item cursor-pointer">Trang Chủ</a>
                        <a onClick={() => navigate('/#about')} className="nav-item cursor-pointer">Giới Thiệu</a>
                        <a onClick={() => navigate('/#rooms')} className="nav-item cursor-pointer">Phòng</a>
                        <a className="nav-item active-nav">Tin Tức</a>
                        <a onClick={() => navigate('/#contact')} className="nav-item cursor-pointer">Liên Hệ</a>
                    </nav>
                    <button className="btn-book-now">Đặt Phòng Ngay</button>
                </header>
                
                <div className="hero-content">
                    <p className="hero-subtitle">Cẩm Nang & Tin Tức</p>
                    <h1 className="hero-title">Khám Phá Trải Nghiệm<br />Hoàn Mỹ Tại Asteria</h1>
                </div>
            </section>

            {/* 2. Main Content & Filters */}
            <section className="news-main-section">
                <div className="news-container">
                    <div className="filter-toolbar">
                        <form onSubmit={handleSearch} className="search-form">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm bài viết..." 
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="search-btn">Tìm</button>
                        </form>

                        <select 
                            className="category-filter"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">Tất cả chuyên mục</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="news-grid-full">
                        {loading ? (
                            <div className="loading-text" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b4976c', fontStyle: 'italic', padding: '50px 0' }}>Đang tải dữ liệu...</div>
                        ) : articles.length > 0 ? (
                            articles.map(item => {
                                const dateStr = new Date(item.publishedAt || new Date()).toLocaleDateString('vi-VN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                });
                                return (
                                    <div 
                                        className="news-card-full" 
                                        key={item.id}
                                        onClick={() => setSelectedArticle(item)}
                                    >
                                        <div className="news-card-img-wrapper">
                                            <img src={item.thumbnailUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600"} className="news-card-img" alt={item.title} />
                                            {item.categoryName && <span className="news-category-badge">{item.categoryName}</span>}
                                        </div>
                                        <div className="news-card-content">
                                            <p className="news-card-date">{dateStr}</p>
                                            <h3 className="news-card-title">{item.title}</h3>
                                            <p className="news-card-summary">{item.summary || "Khám phá ngay bài viết nổi bật với những thông tin thú vị nhất dành cho bạn."}</p>
                                            <span className="news-read-more">Đọc tiếp →</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-data-text" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b4976c', fontStyle: 'italic', padding: '50px 0' }}>Không tìm thấy bài viết nào phù hợp.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal Bài Viết (Copy style từ HomePage) */}
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
                                    {selectedArticle.categoryName && (
                                        <>
                                            <span>•</span>
                                            <span className="text-[#b4976c] uppercase tracking-widest text-xs font-bold">{selectedArticle.categoryName}</span>
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
