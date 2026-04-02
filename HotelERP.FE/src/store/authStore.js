import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  permissions: [],
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),

  // Hàm login nhận đủ 4 tham số từ Login.jsx truyền sang [cite: 172]
  login: (userData, token, refreshToken, userPermissions = []) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({ 
      user: userData, 
      token, 
      refreshToken, 
      permissions: userPermissions, 
      isAuthenticated: true 
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null, permissions: [], isAuthenticated: false });
  },
}));