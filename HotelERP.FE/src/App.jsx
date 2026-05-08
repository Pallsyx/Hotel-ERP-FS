import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import AdminRoutes from './routes/AdminRoutes.jsx';
import HomePage from './pages/Home/HomePage';
import FloatingSidebar from './components/Layout/FloatingSidebar';

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
import CustomerReviewsPage from './pages/Home/CustomerReviewsPage';

function App() {
  return (
    <BrowserRouter>
      <FloatingSidebar />
      <Routes>
        {/* NHÁNH CHO KHÁCH HÀNG: Sử dụng Theme Dark Sang Trọng */}
        <Route path="/*" element={
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: '#b8956a',
                borderRadius: 8,
                colorBgBase: '#0d0d0d',
              },
            }}
          >
            <AntdApp>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<ArticleDetailPage />} />
                <Route path="/attractions" element={<AttractionsPage />} />
                <Route path="/reviews" element={<CustomerReviewsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/rooms/search-results" element={<SearchResultsPage />} />
                <Route path="/booking/new" element={<GuestBookingPage />} />
              </Routes>
            </AntdApp>
          </ConfigProvider>
        } />

        {/* NHÁNH CHO ADMIN: Trả về Theme Sáng (Light Mode) như cũ */}
        <Route path="/admin/*" element={
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm, // Trả về theme cũ
              token: {
                borderRadius: 4,
                // Bạn có thể tùy chỉnh lại màu primary của admin ở đây nếu cần
              },
            }}
          >
            <AntdApp>
              <AdminRoutes />
            </AntdApp>
          </ConfigProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;