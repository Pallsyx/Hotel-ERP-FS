import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import MainLayout from './layouts/MainLayout';
import UserManagement from './pages/Users/UserManagement';
import RoleManagement from './pages/Users/RoleManagement';
import { useAuthStore } from './store/authStore';

// Hàm bảo vệ: Kiểm tra xem trong bộ nhớ có cất Token không
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Khu vực bọc trong ProtectedRoute: Bắt buộc phải đăng nhập */}
        <Route path="/admin" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin/users" replace />} />
        <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;