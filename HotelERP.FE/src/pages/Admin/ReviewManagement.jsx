import React, { useState, useEffect } from 'react';
// import axiosClient from '../../api/axiosClient';

// --- Inline SVGs (Lucide style) ---
const Check = () => <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const X = () => <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const User = () => <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // TODO: Call API lấy danh sách toàn bộ đánh giá cho Admin
      // const res = await axiosClient.get('/Review/admin-all');
      // setReviews(res.data || []);
      
      // Giả lập dữ liệu cho đến khi nối Backend
      setReviews([
        { id: 1, user: { fullName: 'Nguyễn Văn An' }, roomType: { name: 'Suite' }, rating: 5, highlight: 'Rất tuyệt', comment: 'Khách sạn đẹp.', status: 'PENDING', isApproved: false, createdAt: '2026-05-01T10:00:00' },
        { id: 2, user: { fullName: 'Trần Thị B' }, roomType: { name: 'Standard' }, rating: 4, highlight: '', comment: 'Phục vụ tốt.', status: 'APPROVED', isApproved: true, createdAt: '2026-05-02T14:30:00' }
      ]);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      // TODO: Call API Update trạng thái duyệt
      // await axiosClient.put(`/Review/${id}/approve`);
      
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED', isApproved: true } : r));
      alert('Đã duyệt đánh giá thành công!');
    } catch (error) {
      console.error('Approve failed', error);
      alert('Lỗi khi duyệt!');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Nhập lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled
    
    try {
      // TODO: Call API Update trạng thái từ chối (ẩn)
      // await axiosClient.put(`/Review/${id}/hide`, null, { headers: { 'X-Audit-Reason': encodeURIComponent(reason) } });
      
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'HIDDEN', isApproved: false } : r));
      alert('Đã từ chối/ẩn đánh giá!');
    } catch (error) {
      console.error('Reject failed', error);
      alert('Lỗi khi từ chối!');
    }
  };

  const filteredReviews = reviews.filter(r => r.status === activeTab);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đánh giá</h1>
          <p className="text-gray-500 text-sm mt-1">Duyệt và quản lý phản hồi từ khách hàng</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'PENDING' 
              ? 'border-[#b4976c] text-[#b4976c]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Chờ duyệt ({reviews.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'APPROVED' 
              ? 'border-[#b4976c] text-[#b4976c]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Đã duyệt ({reviews.filter(r => r.status === 'APPROVED').length})
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-4 whitespace-nowrap">Đánh giá</th>
                <th className="px-6 py-4 min-w-[250px]">Nội dung</th>
                <th className="px-6 py-4 whitespace-nowrap">Ngày gửi</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-500">Không có đánh giá nào trong mục này.</td></tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <User />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{review.user?.fullName || 'Khách ẩn danh'}</div>
                          {review.roomType && <div className="text-xs text-gray-500 mt-0.5">Phòng {review.roomType.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[#b4976c]">
                        <span className="font-medium">{review.rating}</span>
                        <span>★</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-2">
                        {review.highlight && <span className="font-medium text-gray-800 mr-2">[{review.highlight}]</span>}
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {activeTab === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(review.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md transition-colors font-medium text-xs"
                          >
                            <Check /> Duyệt
                          </button>
                          <button 
                            onClick={() => handleReject(review.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md transition-colors font-medium text-xs"
                          >
                            <X /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check /> Đã duyệt
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}