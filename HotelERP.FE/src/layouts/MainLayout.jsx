import React from 'react';
import { Layout, Menu, Button, Typography, Dropdown } from 'antd';
import { UserOutlined, TeamOutlined, SafetyCertificateOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Quản lý Nhân sự',
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Phân quyền (RBAC)',
    },
  ];

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="dark">
        <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.1)', margin: '16px', borderRadius: '8px' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>HOTEL ERP</Title>
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
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
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
  );
};

export default MainLayout;