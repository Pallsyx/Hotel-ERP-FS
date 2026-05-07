import axiosClient from './axiosClient';

// Base URL: api/Review
const reviewApi = {
  // ── GUEST / PUBLIC ──────────────────────────────

  // GET /api/Review/visible — Lấy đánh giá đã duyệt (hiển thị cho khách)
  getVisible: () => {
    return axiosClient.get('/Review/visible');
  },

  // POST /api/Review — Khách gửi đánh giá mới (chờ duyệt)
  create: (data) => {
    // data: { userId?, roomTypeId, rating, comment?, imageUrl?, imagePublicId? }
    return axiosClient.post('/Review', data);
  },

  // POST /api/Review/upload-image — Upload ảnh đánh giá lên Cloudinary
  uploadImage: (formData) => {
    return axiosClient.post('/Review/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ── ADMIN ───────────────────────────────────────

  // GET /api/Review/admin-all — Lấy tất cả đánh giá (kể cả pending/hidden)
  getAllForAdmin: () => {
    return axiosClient.get('/Review/admin-all');
  },

  // PUT /api/Review/{id}/approve — Admin duyệt đánh giá
  approve: (id) => {
    return axiosClient.put(`/Review/${id}/approve`);
  },

  // PUT /api/Review/{id}/hide — Admin ẩn đánh giá (kèm lý do audit)
  hide: (id, reason = '') => {
    return axiosClient.put(
      `/Review/${id}/hide`,
      {},
      { headers: { 'X-Audit-Reason': encodeURIComponent(reason) } }
    );
  },

  // DELETE /api/Review/{id} — Xóa vĩnh viễn đánh giá
  delete: (id) => {
    return axiosClient.delete(`/Review/${id}`);
  },
};

export default reviewApi;
