import React from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Spin } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HomeOutlined,
  DatabaseOutlined,
  FormatPainterOutlined,
  WarningOutlined
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
    {
      key: '/admin/housekeeping',
      icon: <FormatPainterOutlined />,
      label: 'Dọn phòng',
    },
    {
      key: '/admin/loss-and-damages',
      icon: <WarningOutlined />,
      label: 'Thất thoát & Đền bù',
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

  const isHousekeeping = location.pathname.startsWith('/admin/housekeeping');

  return (
    <Spin spinning={isLoading} size="large" description="Hệ thống đang xử lý...">
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={250} theme="dark" collapsed={isHousekeeping} collapsedWidth={50}>
          <div
            style={{
              padding: isHousekeeping ? '16px 8px' : '16px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '16px 8px',
              borderRadius: '8px',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <Title level={4} style={{ color: 'white', margin: 0, fontSize: isHousekeeping ? '14px' : '20px' }}>
              {isHousekeeping ? 'ERP' : 'HOTEL ERP'}
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
              paddingLeft: isHousekeeping ? 16 : 24,
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
              margin: isHousekeeping ? 0 : '24px',
              padding: isHousekeeping ? 0 : '24px',
              background: isHousekeeping ? '#f0f2f5' : '#fff',
              borderRadius: isHousekeeping ? 0 : '8px',
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