import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes.jsx';
import HomePage from './pages/Home/HomePage';

// 1. THÊM DÒNG NÀY: Import trang Login của bạn vào đây
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import NewsPage from './pages/Home/NewsPage';
import ArticleDetailPage from './pages/Home/ArticleDetailPage';
import UserProfile from './pages/Profile/UserProfile';
import AttractionsPage from './pages/Home/AttractionsPage';
import SearchResultsPage from './pages/Home/SearchResultsPage';
import GuestBookingPage from './pages/Booking/GuestBookingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ dành cho khách hàng sẽ nằm ở đường dẫn gốc "/" */}
        <Route path="/" element={<HomePage />} />
        
        {/* Trang tin tức - danh sách */}
        <Route path="/news" element={<NewsPage />} />
        {/* Trang chi tiết bài viết */}
        <Route path="/news/:slug" element={<ArticleDetailPage />} />

        {/* Trang khám phá điểm đến */}
        <Route path="/attractions" element={<AttractionsPage />} />

        {/* 2. THÊM DÒNG NÀY: Đăng ký hộ khẩu cho trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Trang đăng ký tài khoản */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Trang quên mật khẩu */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Trang thông tin cá nhân */}
        <Route path="/profile" element={<UserProfile />} />
        {/* Kết quả tìm kiếm phòng */}
        <Route path="/rooms/search-results" element={<SearchResultsPage />} />
        
        {/* Màn hình Checkout / Thanh toán của Khách */}
        <Route path="/booking/new" element={<GuestBookingPage />} />

        {/* Toàn bộ các trang Admin của bạn sẽ được dời vào nhánh "/admin" */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;