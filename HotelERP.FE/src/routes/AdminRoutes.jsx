import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import RoomManagement from '../pages/Admin/RoomManagement';
import RoomTypeManagement from '../pages/RoomTypes/RoomTypeManagement';
import RoomInventory from '../pages/RoomInventory/RoomInventory';
import HousekeepingMobile from '../pages/Housekeeping/HousekeepingMobile';
import InventoryChecklist from '../pages/Housekeeping/InventoryChecklist';
import Login from '../pages/Auth/Login';
import MainLayout from '../layouts/MainLayout';
import { useAuthStore } from '../store/authStore';
import UserManagement from '../pages/Users/UserManagement';
import RoleManagement from '../pages/Users/RoleManagement';
import LossAndDamages from '../pages/LossAndDamages.jsx';
import UserProfile from '../pages/Profile/UserProfile';
import InvoiceManagement from '../pages/Invoices/InvoiceManagement';
import InvoiceDashboard from '../pages/Admin/Invoices/InvoiceDashboard';

const Placeholder = ({ title }) => (
  <div style={{ padding: 24, textAlign: 'center' }}>
    <h2 style={{ color: '#1890ff' }}>{title}</h2>
    <p>Giao diện đang được xây dựng...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/booking/search' element={<Placeholder title='Tìm kiếm & Chọn phòng trống' />} />
      <Route path='/booking/checkout' element={<Placeholder title='Thanh toán & Nhập Voucher' />} />

      <Route path='/admin' element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to='dashboard' replace />} />
        <Route path='dashboard' element={<Placeholder title='Dashboard Thống kê' />} />

        <Route path='users' element={<UserManagement />} />
        <Route path='roles' element={<RoleManagement />} />
        <Route path='audit-logs' element={<Placeholder title='Truy vết hệ thống (Audit Logs)' />} />
        <Route path='profile' element={<UserProfile />} />

        <Route path='room-types' element={<RoomTypeManagement />} />
        <Route path='rooms' element={<RoomManagement />} />
        <Route path='inventory' element={<RoomInventory />} />
        <Route path='housekeeping' element={<HousekeepingMobile />} />
        <Route path='damage-reports' element={<Placeholder title='Báo cáo Hư hỏng & Đền bù' />} />
        <Route path='loss-and-damages' element={<LossAndDamages />} />

        <Route path='article-categories' element={<Placeholder title='Danh mục Bài viết' />} />
        <Route path='posts' element={<Placeholder title='Quản lý Bài viết (Blog)' />} />
        <Route path='attractions' element={<Placeholder title='Địa điểm lân cận (Bản đồ)' />} />
        <Route path='reviews' element={<Placeholder title='Kiểm duyệt Đánh giá (Review)' />} />

        <Route path='reception-calendar' element={<Placeholder title='Lịch Lễ Tân (Gantt Chart)' />} />
        <Route path='bookings' element={<Placeholder title='Quản lý Đơn Đặt Phòng (Check-in/Out)' />} />
        <Route path='invoices' element={<InvoiceDashboard />} />
        <Route path='invoices/workbench' element={<InvoiceManagement />} />

        <Route path='housekeeping/room/:id' element={<InventoryChecklist />} />
      </Route>

      <Route path='*' element={<Placeholder title='404 - Trang không tồn tại' />} />
    </Routes>
  );
};

export default AdminRoutes;
