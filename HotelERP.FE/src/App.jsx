import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes.jsx';
import HomePage from './pages/Home/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ dành cho khách hàng sẽ nằm ở đường dẫn gốc "/" */}
        <Route path="/" element={<HomePage />} />

        {/* Toàn bộ các trang Admin của bạn sẽ được dời vào nhánh "/admin" */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;