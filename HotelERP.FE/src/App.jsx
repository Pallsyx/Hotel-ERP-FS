import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes.jsx';
import HomePage from './pages/Home/HomePage';

// 1. THÊM DÒNG NÀY: Import trang Login của bạn vào đây
import LoginPage from './pages/Auth/Login';
import NewsPage from './pages/Home/NewsPage';
import AttractionsPage from './pages/Home/AttractionsPage';
import SearchResultsPage from './pages/Home/SearchResultsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ dành cho khách hàng sẽ nằm ở đường dẫn gốc "/" */}
        <Route path="/" element={<HomePage />} />
        
        {/* Trang tin tức */}
        <Route path="/news" element={<NewsPage />} />

        {/* Trang khám phá điểm đến */}
        <Route path="/attractions" element={<AttractionsPage />} />

        {/* 2. THÊM DÒNG NÀY: Đăng ký hộ khẩu cho trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Kết quả tìm kiếm phòng */}
        <Route path="/rooms/search-results" element={<SearchResultsPage />} />

        {/* Toàn bộ các trang Admin của bạn sẽ được dời vào nhánh "/admin" */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;