import React from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Spin } from 'antd';
import { UserOutlined, TeamOutlined, SafetyCertificateOutlined, LogoutOutlined, AppstoreOutlined } from '@ant-design/icons';
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HomeOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLoadingStore } from '../store/loadingStore';
import NotificationBell from './NotificationBell.jsx';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const { user, logout, permissions } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useLoadingStore((state) => state.isLoading);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rawMenuItems = [
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Quản lý Nhân sự',
      requiredPermission: 'MANAGE_USERS',
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Phân quyền (RBAC)',
      requiredPermission: 'MANAGE_ROLES',
    },
    {
      key: '/admin/room-types',
      icon: <AppstoreOutlined />,
      label: 'Loại phòng & Tiện ích',
      requiredPermission: 'MANAGE_AMENITIES',
    },
    {
      key: '/admin/rooms',
      icon: <HomeOutlined />,
      label: 'Quản lý phòng',
      requiredPermission: 'MANAGE_ROOMS',
    },
    {
      key: '/admin/room-inventory',
      icon: <DatabaseOutlined />,
      label: 'Kho quản lý vật tư',
    },
  ];

  const isAdmin = user?.roleName === 'Admin' || user?.fullName === 'Admin';

  const menuItems = rawMenuItems
    .filter((item) => {
      if (isAdmin) return true;
      if (!item.requiredPermission) return true;
      return permissions && permissions.includes(item.requiredPermission);
    })
    .map(({ requiredPermission, ...rest }) => rest);

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
    <Spin spinning={isLoading} size="large" description="Hệ thống đang xử lý...">
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={250} theme="dark">
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '16px',
              borderRadius: '8px',
            }}
          >
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              HOTEL ERP
            </Title>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={(e) => navigate(e.key)}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            }}
          >
            <NotificationBell />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                Xin chào, {user?.fullName || 'Admin'}
              </Button>
            </Dropdown>
          </Header>

          <Content
            style={{
              margin: '24px',
              padding: '24px',
              background: '#fff',
              borderRadius: '8px',
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Spin>
  );
};

export default MainLayout;