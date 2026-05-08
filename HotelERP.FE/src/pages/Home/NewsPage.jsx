import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../../api/articleApi';

const GOLD = '#b8956a';
const DARK = '#111111';
const SF = { fontFamily: "'Playfair Display', serif" };

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900&auto=format&fit=crop';

/* ─── Shared Header ───────────────────────────────────────────── */
export function LotteHeader({ activePage = '' }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? DARK : 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
      transition: 'background 400ms, box-shadow 400ms',
      height: 64, display: 'flex', alignItems: 'center',
      padding: '0 clamp(20px,5vw,80px)', justifyContent: 'space-between',
    }}>
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ width: 30, height: 30, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SF, fontSize: 14, color: 'white' }}>A</div>
        <span style={{ color: 'white', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Asteria Resort</span>
      </div>
      <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[['Trang Chủ', '/'], ['Điểm Đến', '/attractions'], ['Tin Tức', '/news']].map(([label, href]) => (
          <a key={label} href={href} style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase',
            color: href === '/news' ? GOLD : 'rgba(255,255,255,0.8)', textDecoration: 'none',
            padding: '4px 14px', borderRadius: 2,
            borderBottom: href === '/news' ? `2px solid ${GOLD}` : '2px solid transparent',
          }}>{label}</a>
        ))}
        <a href="/" style={{
          marginLeft: 8, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'white', background: `linear-gradient(135deg, ${GOLD}, #9a7b52)`,
          padding: '9px 18px', borderRadius: 2, textDecoration: 'none',
        }}>Đặt Phòng</a>
      </nav>
    </header>
  );
}

/* ─── Featured Card (large hero card) ───────────────────────── */
export function FeaturedCard({ article, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative', height: 480, boxShadow: hov ? '0 20px 60px rgba(0,0,0,0.25)' : '0 4px 16px rgba(0,0,0,0.1)', transition: 'box-shadow 300ms' }}
    >
      <img
        src={article.thumbnailUrl || FALLBACK}
        alt={article.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 600ms ease' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 32px 36px' }}>
        {article.categoryName && (
          <span style={{ display: 'inline-block', background: GOLD, color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2, marginBottom: 14 }}>
            {article.categoryName}
          </span>
        )}
        <h2 style={{ ...SF, fontSize: 'clamp(22px,2.8vw,34px)', color: 'white', margin: '0 0 12px', fontWeight: 400, lineHeight: 1.3, maxWidth: 600 }}>{article.title}</h2>
        {article.summary && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 16px', maxWidth: 560, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <span>{formatDate(article.publishedAt)}</span>
          <span style={{ color: GOLD, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10 }}>Đọc ngay →</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Standard Article Card ──────────────────────────────────── */
function ArticleCard({ article, onClick, variant = 'default' }) {
  const [hov, setHov] = useState(false);

  if (variant === 'horizontal') {
    return (
      <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ cursor: 'pointer', display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #f0f0f0', transition: 'opacity 200ms', opacity: hov ? 0.85 : 1 }}>
        <div style={{ width: 120, height: 80, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          <img src={article.thumbnailUrl || FALLBACK} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 400ms' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {article.categoryName && <span style={{ fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{article.categoryName}</span>}
          <h4 style={{ ...SF, fontSize: 15, color: '#111', margin: '4px 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h4>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer', background: 'white', borderRadius: 8, overflow: 'hidden', border: `1px solid ${hov ? GOLD : '#e5e7eb'}`, boxShadow: hov ? '0 12px 40px rgba(184,149,106,0.15)' : '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 280ms ease' }}>
      <div style={{ height: 220, overflow: 'hidden' }}>
        <img src={article.thumbnailUrl || FALLBACK} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 500ms ease' }} />
      </div>
      <div style={{ padding: '20px 22px 24px' }}>
        {article.categoryName && (
          <span style={{ fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{article.categoryName}</span>
        )}
        <h3 style={{ ...SF, fontSize: 18, color: '#111', margin: '8px 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h3>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.summary || 'Khám phá những trải nghiệm tuyệt vời tại Asteria Resort...'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(article.publishedAt)}</span>
          <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Đọc tiếp →</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  NEWS PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function NewsPage() {
  const [articles, setArticles]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories]           = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Tin Tức & Cẩm Nang - Asteria Resort';
    fetchArticles('', '');
  }, []);

  const fetchArticles = (keyword, category) => {
    setLoading(true);
    articleApi.search(keyword, category)
      .then(res => {
        const data = res.data || [];
        setArticles(data);
        if (!keyword && !category) {
          const unique = [...new Set(data.map(i => i.categoryName).filter(Boolean))];
          setCategories(unique);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => { e.preventDefault(); fetchArticles(searchTerm, selectedCategory); };
  const handleCategory = (cat) => { setSelectedCategory(cat); fetchArticles(searchTerm, cat); };

  const featured = articles[0] || null;
  const rest = articles.slice(1);
  const sidebarTop = rest.slice(0, 3);
  const gridArticles = rest.slice(3);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <LotteHeader />

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 400, background: DARK, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000&auto=format&fit=crop"
          alt="News Hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,0.95), rgba(17,17,17,0.4))' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', marginTop: 64 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>CẨM NANG & TIN TỨC</p>
          <h1 style={{ ...SF, fontSize: 'clamp(32px,5vw,56px)', color: 'white', lineHeight: 1.2, margin: '0 0 16px', fontWeight: 400 }}>
            Khám Phá Trải Nghiệm<br />Hoàn Mỹ Tại Asteria
          </h1>
          <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Những câu chuyện, bí quyết nghỉ dưỡng và cập nhật mới nhất từ Asteria Resort
          </p>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 64, zIndex: 30, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['', ...categories].map((cat, i) => (
              <button key={i} onClick={() => handleCategory(cat)}
                style={{
                  padding: '7px 18px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid', transition: 'all 200ms',
                  background: selectedCategory === cat ? DARK : 'transparent',
                  color: selectedCategory === cat ? 'white' : '#6b7280',
                  borderColor: selectedCategory === cat ? DARK : '#e5e7eb',
                }}>{cat || 'Tất cả'}</button>
            ))}
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 16px', fontSize: 13, border: 'none', outline: 'none', width: 240, background: '#fafafa' }}
            />
            <button type="submit" style={{ padding: '8px 16px', background: DARK, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '1px' }}>
              TÌM
            </button>
          </form>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 80px' }}>
        {loading ? (
          /* Loading skeleton */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 8, overflow: 'hidden', animation: 'pulse 1.5s infinite' }}>
                <div style={{ height: 200, background: '#f0f0f0' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, width: '40%' }} />
                  <div style={{ height: 18, background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 18, background: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
            <h3 style={{ ...SF, fontSize: 24, color: '#111', marginBottom: 8 }}>Không tìm thấy bài viết</h3>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Thử thay đổi từ khóa hoặc chọn chuyên mục khác.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); fetchArticles('', ''); }}
              style={{ padding: '11px 28px', background: DARK, color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <>
            {/* ── FEATURED + SIDEBAR layout ── */}
            {featured && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, marginBottom: 56 }}>
                {/* Featured big card */}
                <FeaturedCard article={featured} onClick={() => navigate(`/news/${featured.slug}`)} />

                {/* Sidebar: top 3 latest */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD }}>MỚI NHẤT</span>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  </div>
                  {sidebarTop.map(a => (
                    <ArticleCard key={a.id} article={a} onClick={() => navigate(`/news/${a.slug}`)} variant="horizontal" />
                  ))}
                  {sidebarTop.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                      Chưa có bài viết khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION DIVIDER ── */}
            {gridArticles.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, whiteSpace: 'nowrap' }}>
                    {selectedCategory ? selectedCategory.toUpperCase() : 'TẤT CẢ BÀI VIẾT'}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{articles.length} bài viết</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
                  {gridArticles.map(a => (
                    <ArticleCard key={a.id} article={a} onClick={() => navigate(`/news/${a.slug}`)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── NEWSLETTER STRIP ── */}
      <div style={{ background: DARK, padding: '56px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>KHÔNG BỎ LỠ</p>
          <h2 style={{ ...SF, fontSize: 32, color: 'white', margin: '0 0 12px', fontWeight: 400 }}>Đăng Ký Nhận Bản Tin</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
            Nhận ngay các ưu đãi độc quyền và tin tức mới nhất từ Asteria Resort.
          </p>
          <div style={{ display: 'flex', borderRadius: 3, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
            <input type="email" placeholder="Nhập địa chỉ email của bạn..." style={{
              flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.08)', border: 'none',
              outline: 'none', color: 'white', fontSize: 13,
            }} />
            <button style={{ padding: '14px 22px', background: GOLD, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Đăng Ký
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
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
              {[
                { label: 'Trang Chủ', href: '/' },
                { label: 'Giới Thiệu', href: '#' },
                { label: 'Phòng Nghỉ', href: '#' },
                { label: 'Tin Tức', href: '/news' },
                { label: 'Ý kiến khách hàng', href: '/reviews' },
                { label: 'Liên Hệ', href: '#' }
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <a href={item.href} style={{ color: '#71717a', fontSize: 13, textDecoration: 'none', transition: 'color 200ms' }}
                    onMouseEnter={e => e.target.style.color = GOLD}
                    onMouseLeave={e => e.target.style.color = '#71717a'}>
                    {item.label}
                  </a>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>Đăng Ký Bản Tin</h4>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
                <input type="email" placeholder="Email của bạn" style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: 13, color: 'white' }} />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, fontSize: 16 }}>→</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </div>
  );
}
