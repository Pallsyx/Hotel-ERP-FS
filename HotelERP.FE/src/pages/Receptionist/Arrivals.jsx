import React, { useState } from 'react';
import { Card, Table, DatePicker, Input, Button, Space, Typography, Tooltip, message, Popconfirm } from 'antd';
import { SearchOutlined, EyeOutlined, LoginOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

const Arrivals = () => {
  const [data, setData] = useState([]); // Không dùng Mock Data
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const handleCheckIn = (record) => {
    message.success('Nhận phòng thành công! Trạng thái đã chuyển sang Đang ở (In-House).');
    // TODO: Call API to check-in
  };

  const columns = [
    {
      title: 'Mã Booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (text) => (
        <Space>
          <Typography.Text strong>{text}</Typography.Text>
          {text && (
            <Tooltip title="Copy">
              <CopyOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => handleCopy(text)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Hạng phòng',
      dataIndex: 'roomType',
      key: 'roomType',
    },
    {
      title: 'Phòng thực tế',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (text) => <Typography.Text strong style={{ color: '#1890ff' }}>{text}</Typography.Text>,
    },
    {
      title: 'Dự kiến Check-in',
      dataIndex: 'expectedCheckIn',
      key: 'expectedCheckIn',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Popconfirm
            title={`Xác nhận khách đã vào phòng ${record.roomName}?`}
            onConfirm={() => handleCheckIn(record)}
            okText="Check-in"
            cancelText="Hủy"
            okButtonProps={{ type: 'primary' }}
          >
            <Button type="primary" icon={<LoginOutlined />} size="small" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Khách đến hôm nay (Arrivals)</Title>} 
      bordered={false}
      style={{ margin: 24, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <DatePicker 
          format="DD/MM/YYYY" 
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          style={{ width: 200 }} 
        />
        <Input
          placeholder="Tìm theo Tên khách, Mã Booking..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Không có dữ liệu' }}
      />
    </Card>
  );
};

export default Arrivals;
