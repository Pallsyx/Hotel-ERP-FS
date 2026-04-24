import React from 'react';
import { Card } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const RevenueChart = ({ totalRevenue, todayRevenue }) => {
  // Vì Backend hiện chưa có API lấy doanh thu theo từng ngày trong lịch sử (chỉ có Today và Total)
  // Dummy data được sinh ra dựa trên todayRevenue để hiển thị minh họa, kết hợp dữ liệu thật.
  
  const mockDailyAvg = todayRevenue > 0 ? todayRevenue : 5000000;
  
  const data = [
    { day: 'T2', revenue: mockDailyAvg * 0.8 },
    { day: 'T3', revenue: mockDailyAvg * 1.1 },
    { day: 'T4', revenue: mockDailyAvg * 0.9 },
    { day: 'T5', revenue: mockDailyAvg * 1.2 },
    { day: 'T6', revenue: mockDailyAvg * 1.5 },
    { day: 'T7', revenue: mockDailyAvg * 2.0 },
    { day: 'CN (Hôm nay)', revenue: todayRevenue > 0 ? todayRevenue : mockDailyAvg * 1.8 }
  ];

  const formatVND = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;

  return (
    <Card title="Doanh thu 7 ngày gần nhất (Minh họa + Thực tế hôm nay)" bordered={false} hoverable>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(val) => `${val / 1000000}M`} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatVND(value)} cursor={{ fill: '#f5f5f5' }} />
          <Legend />
          <Bar dataKey="revenue" name="Doanh thu (VND)" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;
