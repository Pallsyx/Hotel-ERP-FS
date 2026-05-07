import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import ReviewModal from './ReviewModal';

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất Cả');
  const [selectedRoomType, setSelectedRoomType] = useState('Tất cả');
  const [isFading, setIsFading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosClient.get('/Review/visible');
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveFilter(filter);
      setIsFading(false);
    }, 300);
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const roomTypes = ['Tất cả', ...new Set(reviews.map(r => r.roomType?.name).filter(Boolean))];

  const filteredReviews = reviews.filter(r => {
    if (selectedRoomType !== 'Tất cả' && r.roomType?.name !== selectedRoomType) return false;
    
    if (activeFilter === 'Tất Cả') return true;
    if (activeFilter === '5 Sao') return r.rating === 5;
    if (activeFilter === '4 Sao') return r.rating === 4;
    if (activeFilter === '3 Sao') return r.rating === 3;
    if (activeFilter === '2 Sao') return r.rating === 2;
    if (activeFilter === '1 Sao') return r.rating === 1;
    if (activeFilter === 'Có Hình Ảnh') return r.imageUrl && r.imageUrl.trim() !== '';
    if (activeFilter === 'Có Bình Luận') return r.comment && r.comment.trim() !== '';
    return true;
  });

  const getFilterCount = (filterName) => {
    const baseFilter = reviews.filter(r => selectedRoomType === 'Tất cả' || r.roomType?.name === selectedRoomType);
    if (filterName === 'Tất Cả') return baseFilter.length;
    if (filterName === '5 Sao') return baseFilter.filter(r => r.rating === 5).length;
    if (filterName === '4 Sao') return baseFilter.filter(r => r.rating === 4).length;
    if (filterName === '3 Sao') return baseFilter.filter(r => r.rating === 3).length;
    if (filterName === '2 Sao') return baseFilter.filter(r => r.rating === 2).length;
    if (filterName === '1 Sao') return baseFilter.filter(r => r.rating === 1).length;
    if (filterName === 'Có Hình Ảnh') return baseFilter.filter(r => r.imageUrl && r.imageUrl.trim() !== '').length;
    if (filterName === 'Có Bình Luận') return baseFilter.filter(r => r.comment && r.comment.trim() !== '').length;
    return 0;
  };

  const filters = [
    'Tất Cả', '5 Sao', '4 Sao', '3 Sao', '2 Sao', '1 Sao', 'Có Bình Luận', 'Có Hình Ảnh'
  ];

  const parseImages = (imgStr) => {
    if (!imgStr) return [];
    return imgStr.split(',').map(s => s.trim()).filter(s => s);
  };

  if (loading) return null;

  return (
    <section style={{ backgroundColor: '#f9f9f9', padding: '60px 24px', fontFamily: "'Inter', sans-serif", minHeight: '80vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, color: '#18181b', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ĐÁNH GIÁ TỪ KHÁCH HÀNG
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#18181b', color: 'white', border: 'none', padding: '10px 24px', fontSize: 14, fontWeight: 500, borderRadius: 4, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.target.style.backgroundColor = '#3f3f46'}
            onMouseLeave={e => e.target.style.backgroundColor = '#18181b'}
          >
            Viết đánh giá của bạn
          </button>
        </div>
        
        {/* Overview Box */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e4e4e7', 
          borderRadius: 8, 
          padding: '32px 40px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 60,
          marginBottom: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          flexWrap: 'wrap'
        }}>
          
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', color: '#b8956a' }}>
              <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{avgRating}</span>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#71717a', marginLeft: 4 }}>/ 5</span>
            </div>
            <div style={{ fontSize: 20, marginTop: 8, color: '#b8956a' }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ marginRight: 4 }}>{star <= Math.round(avgRating) ? '★' : '☆'}</span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 12 }}>
              {reviews.length} Bài đánh giá
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, flex: 1, alignItems: 'center' }}>
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => handleFilterChange(f)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeFilter === f ? '#fdf8f3' : '#fff',
                  border: `1px solid ${activeFilter === f ? '#b8956a' : '#e4e4e7'}`,
                  color: activeFilter === f ? '#b8956a' : '#71717a',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeFilter === f ? 600 : 400,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {f === 'Có Bình Luận' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>}
                {f === 'Có Hình Ảnh' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
                {f} ({getFilterCount(f)})
              </button>
            ))}

            <div style={{ position: 'relative' }}>
              <select 
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                style={{
                  padding: '8px 32px 8px 32px',
                  appearance: 'none',
                  backgroundColor: '#fff',
                  border: '1px solid #e4e4e7',
                  color: '#71717a',
                  borderRadius: 999,
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {roomTypes.map(rt => <option key={rt} value={rt}>Loại phòng ({rt})</option>)}
              </select>
              <svg style={{ position: 'absolute', left: 12, top: 10, pointerEvents: 'none', color: '#71717a' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <svg style={{ position: 'absolute', right: 12, top: 10, pointerEvents: 'none', color: '#71717a' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ 
          opacity: isFading ? 0 : 1, 
          transition: 'opacity 300ms ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          {filteredReviews.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e4e4e7' }}>Chưa có đánh giá nào.</div>
          ) : (
            filteredReviews.map((review) => {
              const images = parseImages(review.imageUrl);
              const fullName = review.user?.fullName || review.user?.username || 'Khách';
              const initial = fullName.charAt(0).toUpperCase();
              
              return (
                <div key={review.id} style={{ 
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 32,
                  border: '1px solid #e4e4e7',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  gap: 24
                }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: 20, fontWeight: 600 }}>
                      {initial}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#18181b' }}>
                        {fullName}
                      </div>
                      <div style={{ fontSize: 13, color: '#a1a1aa' }}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <div style={{ color: '#b8956a', fontSize: 14, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ marginRight: 2 }}>{star <= review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      {review.roomType?.name && (
                        <span style={{ backgroundColor: '#f4f4f5', color: '#52525b', padding: '4px 12px', borderRadius: 4, fontSize: 12 }}>
                          Phòng {review.roomType.name}
                        </span>
                      )}
                      {review.serviceQuality && (
                        <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: 4, fontSize: 12 }}>
                          Dịch vụ: {review.serviceQuality}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 15, color: '#3f3f46', lineHeight: 1.6, marginBottom: 16 }}>
                      {review.comment}
                    </div>

                    {review.highlight && (
                      <div style={{ fontSize: 14, color: '#3f3f46', marginBottom: 16 }}>
                        <strong>Điểm nổi bật:</strong> {review.highlight}
                      </div>
                    )}

                    {images.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {images.slice(0, 5).map((img, i) => (
                          <div key={i} style={{ width: 80, height: 80, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                            <img src={img} alt="review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 0 && img.includes('video') && (
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 28, height: 28, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid white', marginLeft: 3 }}></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
