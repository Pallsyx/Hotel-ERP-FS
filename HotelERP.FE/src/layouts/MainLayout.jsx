import React from 'react';
// MỚI THÊM: Bổ sung chữ Spin vào danh sách import của antd
import { Layout, Menu, Button, Typography, Dropdown, Spin } from 'antd'; 
import { UserOutlined, TeamOutlined, SafetyCertificateOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLoadingStore } from '../store/loadingStore';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {  
  // 👉 1. Lấy thêm mảng permissions từ AuthStore ra
  const { user, logout, permissions } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // MỚI THÊM: Lấy trạng thái isLoading từ Zustand Store
  const isLoading = useLoadingStore((state) => state.isLoading);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 👉 2. Khai báo Menu gốc kèm theo "điều kiện quyền hạn"
  const rawMenuItems = [
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Quản lý Nhân sự',
      requiredPermission: 'MANAGE_USERS' // Bắt buộc phải có quyền này mới được thấy
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Phân quyền (RBAC)',
      requiredPermission: 'MANAGE_ROLES' // Bắt buộc phải có quyền này mới được thấy
    },
  ];

  // 👉 3. Lọc Menu: Chỉ giữ lại những mục mà User có quyền xem
  // 1. Kiểm tra quyền Admin [cite: 55]
  const isAdmin = user?.roleName === 'Admin';

  // 2. Lọc danh sách menu dựa trên quyền hạn 
  const filteredMenuItems = rawMenuItems.filter(item => 
    isAdmin || 
    !item.requiredPermission || 
    (permissions && permissions.includes(item.requiredPermission))
  );

  // 3. QUAN TRỌNG: Loại bỏ thuộc tính 'requiredPermission' để không truyền xuống DOM [cite: 53, 59]
  const menuItems = filteredMenuItems.map(({ requiredPermission, ...rest }) => rest);

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
  };

  return (
    // MỚI THÊM: Bọc toàn bộ Layout bên trong thẻ Spin
    <Spin spinning={isLoading} size="large" description="Hệ thống đang xử lý...">
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={250} theme="dark">
          <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.1)', margin: '16px', borderRadius: '8px' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>HOTEL ERP</Title>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems} // Truyền mảng menu đã được lọc quyền vào đây
            onClick={(e) => navigate(e.key)}
          />
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
            <NotificationBell />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                Xin chào, {user?.fullName || 'Admin'}
              </Button>
            </Dropdown>
          </Header>
          <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: '8px', minHeight: 280 }}>
            {/* Các trang con sẽ được nhúng vào đây */}
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Spin>
  );
};

export default MainLayout;