import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../../api/articleApi';

/* ─── Shared Navbar ───────────────────────────────────────── */
function LotteHeader({ activePage = '' }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: 'Trang Chủ',  href: '/' },
    { label: 'Giới Thiệu', href: '/#about' },
    { label: 'Phòng',      href: '/#rooms' },
    { label: 'Tin Tức',    href: '/news' },
    { label: 'Khám Phá',   href: '/attractions' },
    { label: 'Liên Hệ',   href: '/#contact' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled || mobileOpen ? '#111111' : 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
      transition: 'background 400ms ease',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 15, color: 'white' }}>A</div>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Asteria Resort</span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'none', alignItems: 'center', gap: 0 }} className="lg-nav">
          {navLinks.map(link => (
            <a key={link.label} href={link.href}
              style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: activePage === link.label ? '#b8956a' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none', padding: '0 18px', height: 64,
                display: 'flex', alignItems: 'center',
                borderBottom: activePage === link.label ? '2px solid #b8956a' : '2px solid transparent',
                transition: 'color 300ms, border-color 300ms',
              }}
              onMouseEnter={e => { if (activePage !== link.label) { e.target.style.color = '#b8956a'; }}}
              onMouseLeave={e => { if (activePage !== link.label) { e.target.style.color = 'rgba(255,255,255,0.8)'; }}}
            >{link.label}</a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/login" style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'white', background: 'linear-gradient(135deg, #c9a97a, #9a7b52)',
            padding: '9px 20px', borderRadius: 2, textDecoration: 'none',
            transition: 'opacity 200ms',
          }}>Đặt Phòng</a>
          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: 20, display: 'flex' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#111', padding: '16px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {navLinks.map(link => (
            <a key={link.label} href={link.href}
              style={{ display: 'block', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '12px 0', fontSize: 13, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`.lg-nav { display: none !important; } @media(min-width: 1024px) { .lg-nav { display: flex !important; } }`}</style>
    </header>
  );
}

/* ─── Shared Footer ────────────────────────────────────────── */
function LotteFooter() {
  return (
    <footer style={{ background: '#0a0a0a', color: '#71717a', paddingTop: 64, paddingBottom: 32, borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: 14, color: 'white' }}>A</div>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Asteria Resort</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#71717a', maxWidth: 320, marginBottom: 20 }}>
              Số 10, Huỳnh Văn Nghệ, phường Bửu Long, TP. Biên Hòa, tỉnh Đồng Nai
            </p>
            <p style={{ fontSize: 13, color: '#71717a' }}>📞 0987 244 924</p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>Liên Kết Nhanh</h4>
            {['Trang Chủ', 'Giới Thiệu', 'Phòng Nghỉ', 'Tin Tức', 'Liên Hệ'].map(item => (
              <div key={item} style={{ marginBottom: 12 }}>
                <a href="#" style={{ color: '#71717a', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }}
                  onMouseEnter={e => e.target.style.color = '#b8956a'}
                  onMouseLeave={e => e.target.style.color = '#71717a'}>
                  {item}
                </a>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>Đăng Ký Bản Tin</h4>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
              <input type="email" placeholder="Email của bạn" style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: 13, color: 'white' }} />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b8956a', fontSize: 16 }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#52525b' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Sơ đồ trang web'].map(t => (
              <a key={t} href="#" style={{ color: '#52525b', textDecoration: 'none' }}>{t}</a>
            ))}
          </div>
          <p>© 2026 ASTERIA RESORT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  NEWS PAGE                                                   */
/* ═══════════════════════════════════════════════════════════ */
export default function NewsPage() {
  const [articles,         setArticles]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories,       setCategories]       = useState([]);
  const [selectedArticle,  setSelectedArticle]  = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticles('', '');
  }, []);

  const fetchArticles = (keyword, category) => {
    setLoading(true);
    articleApi.search(keyword, category).then(res => {
      setArticles(res.data || []);
      if (categories.length === 0 && res.data) {
        const unique = [...new Set(res.data.map(i => i.categoryName).filter(Boolean))];
        setCategories(unique);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleSearch = (e) => { e.preventDefault(); fetchArticles(searchTerm, selectedCategory); };
  const handleCategoryChange = (cat) => { setSelectedCategory(cat); fetchArticles(searchTerm, cat); };

  // SEO
  useEffect(() => {
    if (selectedArticle) {
      const orig = document.title;
      document.title = selectedArticle.metaTitle || selectedArticle.title || 'Tin Tức - Asteria Resort';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = selectedArticle.metaDescription || selectedArticle.summary || '';
      return () => { document.title = orig; };
    } else { document.title = 'Tin Tức - Asteria Resort'; }
  }, [selectedArticle]);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <LotteHeader activePage="Tin Tức" />

      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 420, background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000&auto=format&fit=crop"
          alt="News" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,0.9), rgba(17,17,17,0.4))' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', marginTop: 64 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8956a', marginBottom: 16 }}>CẨM NANG & TIN TỨC</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>Khám Phá Trải Nghiệm<br />Hoàn Mỹ Tại Asteria</h1>
          <div style={{ width: 48, height: 1, background: '#b8956a', margin: '0 auto' }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 0', position: 'sticky', top: 64, zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 420 }}>
            <input type="text" placeholder="Tìm kiếm bài viết..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '9px 16px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', background: '#fafafa' }}
              onFocus={e => e.target.style.borderColor = '#b8956a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <button type="submit" style={{ padding: '9px 20px', background: '#111', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Tìm</button>
          </form>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['', ...categories].map((cat, i) => (
              <button key={i} onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                  background: selectedCategory === cat ? '#111' : 'transparent',
                  color: selectedCategory === cat ? 'white' : '#71717a',
                  borderColor: selectedCategory === cat ? '#111' : '#e5e7eb',
                  transition: 'all 200ms',
                }}>
                {cat || 'Tất cả'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#b8956a', fontSize: 14 }}>Đang tải bài viết...</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a', fontSize: 14 }}>Không tìm thấy bài viết nào phù hợp.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
            {articles.map(item => {
              const dateStr = new Date(item.publishedAt || new Date()).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div key={item.id} onClick={() => setSelectedArticle(item)}
                  style={{ background: 'white', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 300ms, box-shadow 300ms', border: '1px solid #f0f0f0' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
                  <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                    <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600'}
                      alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    {item.categoryName && (
                      <span style={{ position: 'absolute', top: 14, left: 14, background: '#b8956a', color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2 }}>
                        {item.categoryName}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '20px 24px 24px' }}>
                    <p style={{ fontSize: 11, color: '#b8956a', marginBottom: 8, letterSpacing: '0.1em' }}>{dateStr}</p>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#18181b', marginBottom: 10, lineHeight: 1.4 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary || 'Khám phá ngay bài viết nổi bật với những thông tin thú vị nhất dành cho bạn.'}
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#b8956a' }}>Đọc tiếp →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Modal */}
      <div className={`article-modal-overlay ${selectedArticle ? 'show' : ''}`} onClick={() => setSelectedArticle(null)}>
        <div className="article-modal-container" onClick={e => e.stopPropagation()}>
          <button className="article-modal-close" onClick={() => setSelectedArticle(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {selectedArticle && (
            <>
              <img src={selectedArticle.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200'} alt={selectedArticle.title} className="article-modal-header-img" />
              <div className="article-modal-body">
                <h2 className="article-modal-title">{selectedArticle.title}</h2>
                <div className="article-modal-meta">
                  <span>Đăng ngày: {new Date(selectedArticle.publishedAt || new Date()).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {selectedArticle.categoryName && <><span>•</span><span style={{ color: '#b8956a', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 11, fontWeight: 700 }}>{selectedArticle.categoryName}</span></>}
                </div>
                <div className="article-modal-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p>Nội dung bài viết đang được cập nhật...</p>' }} />
              </div>
            </>
          )}
        </div>
      </div>

      <LotteFooter />
    </div>
  );
}
