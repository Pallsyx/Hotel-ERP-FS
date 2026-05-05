import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import articleApi from '../../api/articleApi';

const G = '#b8956a';
const SF = { fontFamily: "'Playfair Display', serif" };

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sc, setSc] = useState(false);

  useEffect(() => {
    const f = () => setSc(window.scrollY > 50);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setNotFound(false);

    articleApi.getBySlug(slug)
      .then(res => {
        const data = res.data;
        setArticle(data);

        // SEO
        document.title = data.metaTitle || data.title || 'Asteria Resort';
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
        meta.content = data.metaDescription || data.summary || '';

        // Related articles
        articleApi.search('', data.categoryName || '').then(r => {
          setRelated((r.data || []).filter(a => a.slug !== slug).slice(0, 3));
        }).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => {
      document.title = 'Asteria Resort - Không gian nghỉ dưỡng đẳng cấp';
    };
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${G}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: '0.1em' }}>ĐANG TẢI BÀI VIẾT...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ ...SF, color: 'white', fontSize: 48, margin: 0 }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Không tìm thấy bài viết này.</p>
      <button onClick={() => navigate('/news')}
        style={{ background: G, color: 'white', border: 'none', padding: '12px 32px', borderRadius: 2, cursor: 'pointer', fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Quay lại Tin Tức
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: sc ? '#111' : 'linear-gradient(to bottom,rgba(0,0,0,.85),transparent)',
        transition: 'background 400ms', boxShadow: sc ? '0 2px 20px rgba(0,0,0,.5)' : 'none',
        padding: '0 clamp(24px,6vw,120px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, border: '1px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SF, fontSize: 13, color: 'white' }}>A</div>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>Asteria Resort</span>
        </div>
        <nav style={{ display: 'flex', gap: 32 }}>
          {[['Trang Chủ', '/'], ['Tin Tức', '/news'], ['Điểm Đến', '/attractions']].map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 11, fontWeight: 500, letterSpacing: '1.5px', color: 'rgba(255,255,255,.75)', textDecoration: 'none', transition: 'color 200ms' }}
              onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.75)'}>{l}</Link>
          ))}
        </nav>
      </header>

      {/* ── HERO / THUMBNAIL ── */}
      <div style={{ position: 'relative', height: 'clamp(320px,45vw,540px)', overflow: 'hidden' }}>
        <img
          src={article.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600'}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)' }} />

        {/* Breadcrumb */}
        <div style={{ position: 'absolute', top: 84, left: 'clamp(24px,6vw,120px)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 200ms' }}
            onMouseEnter={e => e.target.style.color = G} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Trang chủ</Link>
          <span>›</span>
          <Link to="/news" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 200ms' }}
            onMouseEnter={e => e.target.style.color = G} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>Tin Tức</Link>
          {article.categoryName && <>
            <span>›</span>
            <span style={{ color: G }}>{article.categoryName}</span>
          </>}
        </div>

        {/* Title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 clamp(24px,6vw,120px) 48px' }}>
          {article.categoryName && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 16 }}>
              {article.categoryName}
            </span>
          )}
          <h1 style={{ ...SF, fontSize: 'clamp(26px,4vw,52px)', color: 'white', margin: 0, fontWeight: 400, lineHeight: 1.25, maxWidth: 800 }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            <span>
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(24px,4vw,40px)' }}>

        {/* Summary */}
        {article.summary && (
          <p style={{
            fontSize: 'clamp(16px,1.8vw,20px)', lineHeight: 1.8, color: '#374151',
            borderLeft: `3px solid ${G}`, paddingLeft: 20, marginBottom: 40,
            fontStyle: 'italic', ...SF
          }}>
            {article.summary}
          </p>
        )}

        {/* Main content */}
        <div
          dangerouslySetInnerHTML={{ __html: article.content || '<p style="color:#9ca3af;font-style:italic">Nội dung bài viết đang được cập nhật...</p>' }}
          style={{ fontSize: 16, lineHeight: 1.9, color: '#1f2937' }}
          className="article-content-body"
        />

        {/* Tags */}
        {article.tags && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: 8 }}>Tags:</span>
            {article.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
              <span key={tag} style={{
                fontSize: 11, padding: '4px 12px', border: `1px solid ${G}33`,
                borderRadius: 999, color: G, background: `${G}10`,
                letterSpacing: '0.05em', cursor: 'default'
              }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Back button */}
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => navigate('/news')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'none', border: `1px solid ${G}`, color: G,
            padding: '12px 32px', borderRadius: 2, cursor: 'pointer',
            fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'all 200ms'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = G; }}>
            ← Quay lại Tin Tức
          </button>
        </div>
      </main>

      {/* ── RELATED ARTICLES ── */}
      {related.length > 0 && (
        <section style={{ background: '#111', padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,120px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: G, display: 'block', marginBottom: 12 }}>Cùng Chuyên Mục</span>
              <h2 style={{ ...SF, fontSize: 'clamp(22px,3vw,32px)', color: 'white', margin: 0, fontWeight: 400 }}>Bài Viết Liên Quan</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {related.map(item => (
                <Link key={item.id} to={`/news/${item.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 300ms, box-shadow 300ms', cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,.5)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600'}
                        alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    </div>
                    <div style={{ padding: '20px 20px 24px' }}>
                      {item.categoryName && (
                        <span style={{ fontSize: 9, color: G, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>{item.categoryName}</span>
                      )}
                      <h3 style={{ ...SF, fontSize: 17, color: 'white', lineHeight: 1.4, margin: '8px 0 0', fontWeight: 400, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ARTICLE CONTENT STYLES ── */}
      <style>{`
        .article-content-body h2 { font-family: 'Playfair Display', serif; font-size: clamp(20px, 2.5vw, 26px); color: #111; margin: 2em 0 0.75em; font-weight: 500; }
        .article-content-body h3 { font-family: 'Playfair Display', serif; font-size: clamp(17px, 2vw, 21px); color: #374151; margin: 1.5em 0 0.5em; }
        .article-content-body p  { margin: 0 0 1.4em; }
        .article-content-body img { max-width: 100%; border-radius: 4px; margin: 1.5em 0; }
        .article-content-body ul, .article-content-body ol { padding-left: 1.5em; margin: 0 0 1.4em; }
        .article-content-body li { margin-bottom: 0.5em; }
        .article-content-body blockquote { border-left: 3px solid ${G}; padding-left: 20px; margin: 2em 0; color: #6b7280; font-style: italic; }
        .article-content-body a { color: ${G}; }
      `}</style>
    </div>
  );
}
