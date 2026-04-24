import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, message, Spin } from 'antd';
import { useAuthStore } from '../../../store/authStore';
import bookingManagementApi from '../../../api/bookingManagementApi';
import { roomInventoryApi } from '../../../api/roomInventoryApi';
import { invoiceApi } from '../../../api/invoiceApi';

import StatCards from './components/StatCards';
import RoomStatusChart from './components/RoomStatusChart';
import RevenueChart from './components/RevenueChart';

const { Title } = Typography;

const Dashboard = () => {
  const { user, permissions } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // States dữ liệu thực tế
  const [receptionStats, setReceptionStats] = useState({ arrivals: 0, inHouse: 0, departures: 0 });
  const [housekeepingStats, setHousekeepingStats] = useState({ available: 0, dirty: 0, maintenance: 0, occupied: 0 });
  const [invoiceStats, setInvoiceStats] = useState({ totalRevenue: 0, todayRevenue: 0, totalPaid: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Phục vụ Lễ tân
      const [arrRes, inHouseRes, depRes] = await Promise.all([
        bookingManagementApi.getTodayArrivals(),
        bookingManagementApi.getInHouseGuests(),
        bookingManagementApi.getTodayDepartures()
      ]);
      setReceptionStats({
        arrivals: arrRes?.data?.count ?? arrRes?.data?.data?.length ?? 0,
        inHouse: inHouseRes?.data?.count ?? inHouseRes?.data?.data?.length ?? 0,
        departures: depRes?.data?.count ?? depRes?.data?.data?.length ?? 0,
      });

      // 2. Phục vụ Buồng phòng
      const roomsRes = await roomInventoryApi.getRooms();
      if (roomsRes?.data) {
        const rooms = roomsRes.data.data || roomsRes.data;
        let available = 0, dirty = 0, maintenance = 0, occupied = 0;
        if (Array.isArray(rooms)) {
          rooms.forEach((r) => {
            const st = (r.status || '').toLowerCase();
            if (st === 'available') available++;
            else if (st === 'dirty') dirty++;
            else if (st === 'maintenance' || st === 'out_of_order') maintenance++;
            else if (st === 'occupied') occupied++;
          });
        }
        setHousekeepingStats({ available, dirty, maintenance, occupied });
      }

      // 3. Phục vụ Quản lý hóa đơn
      const invRes = await invoiceApi.getSummary();
      if (invRes?.data) {
        // Backend có thể trả về trực tiếp Object hoặc bọc trong { data: ... }
        const invData = invRes.data.data || invRes.data;
        setInvoiceStats({
          totalRevenue: invData.totalRevenueAllTime || 0,
          todayRevenue: invData.todayRevenue || 0,
          totalPaid: invData.totalRevenueAllTime || 0 // Tạm mượn do API Paid=Total
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data', error);
      message.error('Không thể tải dữ liệu Dashboard thực tế!');
    } finally {
      setLoading(false);
    }
  };

  const rolesObj = { user, permissions };
  const isAdmin = user?.roleName === 'Admin' || user?.fullName === 'Admin';
  const isHousekeeping = isAdmin || permissions?.includes('UPDATE_ROOM_STATUS') || user?.roleName === 'Housekeeping';
  const isManager = isAdmin || permissions?.includes('MANAGE_INVOICES') || user?.roleName === 'Manager';

  return (
    <Spin spinning={loading} size="large" tip="Đang tải dữ liệu thực tế...">
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginBottom: 24, color: '#1890ff' }}>
          Dashboard Hoạt Động Khách Sạn
        </Title>
        
        {/* Module Thẻ Thống kê (View theo Role) */}
        <StatCards
          roles={rolesObj}
          receptionStats={receptionStats}
          housekeepingStats={housekeepingStats}
          invoiceStats={invoiceStats}
        />

        <Row gutter={[24, 24]}>
          {/* Module Housekeeping / Admin sẽ thấy Pie Chart tỷ lệ phòng */}
          {isHousekeeping && (
            <Col xs={24} md={12} lg={10}>
              <RoomStatusChart {...housekeepingStats} />
            </Col>
          )}

          {/* Module Manager / Admin sẽ thấy biểu đồ doanh thu */}
          {isManager && (
            <Col xs={24} md={12} lg={14}>
              <RevenueChart todayRevenue={invoiceStats.todayRevenue} totalRevenue={invoiceStats.totalRevenue} />
            </Col>
          )}
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
