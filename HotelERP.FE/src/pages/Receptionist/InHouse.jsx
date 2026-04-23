import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Space, Typography, Tooltip, message } from 'antd';
import { SearchOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import bookingManagementApi from '../../api/bookingManagementApi';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const InHouse = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchInHouse();
  }, []);

  const fetchInHouse = async () => {
    setLoading(true);
    try {
      const response = await bookingManagementApi.getInHouseGuests();
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách đang lưu trú:', error);
      message.error('Không thể tải dữ liệu khách đang lưu trú.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const filteredData = data.filter((item) => {
    const detail = item.details?.[0];
    return (
      item.guestName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      detail?.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_, record) => (
        <Typography.Text strong style={{ color: '#1890ff' }}>
          {record.details?.[0]?.roomNumber || 'Chưa xếp phòng'}
        </Typography.Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customerName',
      render: (_, record) => record.guestName,
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
      key: 'roomType',
      render: (_, record) => record.details?.[0]?.roomTypeName,
    },
    {
      title: 'Giờ Check-in thực tế',
      key: 'actualCheckIn',
      render: (_, record) => {
        const date = record.details?.[0]?.actualCheckInAt;
        return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
      },
    },
    {
      title: 'Dự kiến Check-out',
      key: 'expectedCheckOut',
      render: (_, record) => {
        const date = record.details?.[0]?.checkOutDate;
        return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => navigate('/admin/bookings/' + record.bookingCode)} />
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
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Không có dữ liệu' }}
      />
    </Card>
  );
};

export default InHouse;

