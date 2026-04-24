import axiosClient from './axiosClient';

const articleApi = {
  // Lấy danh sách bài viết (có tìm kiếm và lọc)
  search: (keyword = '', categoryName = '') => {
    return axiosClient.get('/Articles/search', {
      params: { keyword, categoryName }
    });
  },

  // Lấy chi tiết bài viết qua Slug
  getBySlug: (slug) => {
    return axiosClient.get(`/Articles/${slug}`);
  },

  // Lấy danh sách cho Admin (tất cả trạng thái)
  getAllForAdmin: (keyword = '', categoryName = '', status = 'ALL') => {
    return axiosClient.get('/Articles/admin', {
      params: { keyword, categoryName, status }
    });
  },

  // Tạo bài viết mới (Sử dụng FormData vì có upload ảnh)
  create: (formData) => {
    return axiosClient.post('/Articles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Cập nhật bài viết hiện tại
  update: (id, formData) => {
    return axiosClient.put(`/Articles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Xóa bài viết
  delete: (id) => {
    return axiosClient.delete(`/Articles/${id}`);
  }
};

export default articleApi;
