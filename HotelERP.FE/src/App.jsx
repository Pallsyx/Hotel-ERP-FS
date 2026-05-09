import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setAntdStatic } from './utils/antdGlobal';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import AdminRoutes from './routes/AdminRoutes.jsx';
import HomePage from './pages/Home/HomePage';
import FloatingSidebar from './components/Layout/FloatingSidebar';

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
import SubmitReview from './pages/Customer/SubmitReview';

const StaticSetter = () => {
  const { message, notification, modal } = AntdApp.useApp();
  useEffect(() => {
    setAntdStatic(message, notification, modal);
  }, [message, notification, modal]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <FloatingSidebar />
      <Routes>
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
              <StaticSetter />
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
                <Route path="/booking/:bookingId/review" element={<SubmitReview />} />
              </Routes>
            </AntdApp>
          </ConfigProvider>
        } />

        <Route path="/admin/*" element={
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                borderRadius: 4,
              },
            }}
          >
            <AntdApp>
              <StaticSetter />
              <AdminRoutes />
            </AntdApp>
          </ConfigProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;