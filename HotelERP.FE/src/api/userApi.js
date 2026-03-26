import axiosClient from './axiosClient';

const userApi = {
  // Lấy danh sách tất cả người dùng
  getAll: () => {
    return axiosClient.get('/UserManagement');
  },
  
  // Thêm mới người dùng
  create: (data) => {
    return axiosClient.post('/UserManagement', data);
  },
  
  // Cập nhật thông tin (Tên, SĐT, Trạng thái)
  update: (id, data) => {
    return axiosClient.put(`/UserManagement/${id}`, data);
  },
  
  // Xóa/Khóa tài khoản
  delete: (id) => {
    return axiosClient.delete(`/UserManagement/${id}`);
  },

  // Đổi quyền (Role)
  changeRole: (id, newRoleId) => {
    return axiosClient.put(`/UserManagement/${id}/change-role`, newRoleId, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export default userApi;