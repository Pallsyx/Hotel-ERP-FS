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
  WarningOutlined,
  DashboardOutlined, // Icon cho Dashboard
  IdcardOutlined,    // Icon cho Quầy lễ tân
  FileTextOutlined,  // Icon cho Hóa đơn
  GiftOutlined       // Icon cho Voucher
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

  const isAdmin = user?.roleName === 'Admin' || user?.fullName === 'Admin';

  // === ĐÃ NÂNG CẤP: DANH SÁCH MENU MỚI CHUẨN ERP ===
  const rawMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      requiredPermission: 'VIEW_DASHBOARD',
    },
    {
      key: '/admin/room-types',
      icon: <AppstoreOutlined />,
      label: 'Hạng phòng',
      requiredPermission: 'MANAGE_AMENITIES',
    },
    {
      key: '/admin/rooms',
      icon: <HomeOutlined />,
      label: 'Quản lý phòng',
      requiredPermission: 'MANAGE_ROOMS',
    },
    {
      key: '/admin/inventory',
      icon: <DatabaseOutlined />,
      label: 'Kho vật tư',
      requiredPermission: 'MANAGE_INVENTORY',
    },
    {
      key: '/admin/loss-and-damages',
      icon: <WarningOutlined />,
      label: 'Thất thoát & Đền bù',
      requiredPermission: 'MANAGE_INVENTORY',
    },
    {
      key: '/admin/housekeeping',
      icon: <FormatPainterOutlined />,
      label: 'Dọn phòng',
      requiredPermission: 'UPDATE_ROOM_STATUS',
    },
    // MENU THẢ XUỐNG: QUẦY LỄ TÂN
    {
      key: 'reception_menu',
      icon: <IdcardOutlined />,
      label: 'Quầy lễ tân',
      requiredPermission: 'MANAGE_BOOKINGS',
      children: [
        {
          key: '/admin/bookings',
          label: 'Quản lý Đặt phòng',
        },
        {
          key: '/admin/arrivals',
          label: 'Khách đến hôm nay',
        },
        {
          key: '/admin/in-house',
          label: 'Khách đang lưu trú',
        },
        {
          key: '/admin/departures',
          label: 'Thủ tục trả phòng',
        },
      ],
    },
    {
      key: '/admin/vouchers',
      icon: <GiftOutlined />,
      label: 'Quản lý Voucher',
      requiredPermission: 'MANAGE_SERVICES',
    },
    {
      key: '/admin/invoices',
      icon: <FileTextOutlined />,
      label: 'Quản lý hóa đơn',
      requiredPermission: 'MANAGE_INVOICES',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'Danh sách Nhân sự',
      requiredPermission: 'MANAGE_USERS',
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Vai trò & Phân quyền',
      requiredPermission: 'MANAGE_ROLES',
    },
    {
      key: '/admin/audit-logs',
      icon: <SafetyCertificateOutlined />,
      label: 'Nhật ký hoạt động',
      requiredPermission: 'MANAGE_ROLES',
    }
  ];

  // === ĐÃ NÂNG CẤP: Hàm lọc quyền thông minh (Lọc cả Menu cha lẫn Menu con) ===
  const filterMenuItems = (items) => {
    return items
      .filter((item) => {
        if (isAdmin) return true; // Admin thấy hết
        if (!item.requiredPermission) return true; // Không yêu cầu quyền thì ai cũng thấy
        return permissions && permissions.includes(item.requiredPermission);
      })
      .map((item) => {
        // Nếu có menu con thì dùng đệ quy để lọc tiếp bên trong
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      // Xóa bỏ thuộc tính requiredPermission trước khi ném vào UI của Ant Design
      .map(({ requiredPermission, ...rest }) => rest);
  };

  const menuItems = filterMenuItems(rawMenuItems);

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Hồ sơ cá nhân',
        onClick: () => navigate('/admin/profile'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        danger: true,
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
            // Tính năng tự mở menu cha khi đang ở trang con
            defaultOpenKeys={location.pathname.startsWith('/admin/') ? ['reception_menu'] : []}
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
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
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