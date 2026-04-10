import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Typography, Tooltip, message } from 'antd';
import { SearchOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;

const InHouse = () => {
  const [data, setData] = useState([]); // Không dùng Mock Data
  const [searchText, setSearchText] = useState('');

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const columns = [
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      key: 'roomName',
      render: (text) => <Typography.Text strong style={{ color: '#1890ff' }}>{text}</Typography.Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Mã Booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (text) => (
        <Space>
          <Typography.Text>{text}</Typography.Text>
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
      title: 'Hạng phòng',
      dataIndex: 'roomType',
      key: 'roomType',
    },
    {
      title: 'Giờ Check-in thực tế',
      dataIndex: 'actualCheckIn',
      key: 'actualCheckIn',
    },
    {
      title: 'Dự kiến Check-out',
      dataIndex: 'expectedCheckOut',
      key: 'expectedCheckOut',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Khách đang lưu trú (In-House)</Title>} 
      bordered={false}
      style={{ margin: 24, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo Số phòng, Tên khách, Mã Booking..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
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

export default InHouse;
