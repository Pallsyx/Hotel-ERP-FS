import React, { useState } from 'react';
import { Card, Table, DatePicker, Input, Button, Space, Typography, Tooltip, message, Popconfirm } from 'antd';
import { SearchOutlined, CopyOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Departures = () => {
  const [data, setData] = useState([]); // Không dùng Mock Data
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const navigate = useNavigate();

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const handleCheckOut = (record) => {
    message.success(`Đã Check-out phòng ${record.roomName}. Vui lòng lập hóa đơn thanh toán.`);
    // Navigate to invoices (assumed path)
    navigate('/admin/invoices');
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
      title: 'Dự kiến Check-out',
      dataIndex: 'expectedCheckOut',
      key: 'expectedCheckOut',
      render: (text) => <Typography.Text type="danger">{text}</Typography.Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title={`Xác nhận trả phòng ${record.roomName}?`}
          onConfirm={() => handleCheckOut(record)}
          okText="Check-out"
          cancelText="Hủy"
        >
          <Button danger type="primary" icon={<ExportOutlined />} size="small">
            Trả phòng
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Khách dự kiến rời đi (Departures)</Title>} 
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
          placeholder="Tìm theo Số phòng, Tên khách, Mã Booking..."
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

export default Departures;
