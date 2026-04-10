import React, { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Input, Button, Space, Typography, Tooltip, message, Popconfirm } from 'antd';
import { SearchOutlined, CopyOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import bookingManagementApi from '../../api/bookingManagementApi';

const { Title } = Typography;

const Departures = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartures();
  }, []);

  const fetchDepartures = async () => {
    setLoading(true);
    try {
      const response = await bookingManagementApi.getTodayDepartures();
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách rời đi:', error);
      message.error('Không thể tải dữ liệu khách rời đi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const handleCheckOut = async (record) => {
    const detailId = record.details?.[0]?.id;
    if (!detailId) {
      message.error('Không tìm thấy thông tin phòng!');
      return;
    }

    try {
      const res = await bookingManagementApi.updateDetailStatus(detailId, 'CheckedOut');
      if (res.data && res.data.success) {
        message.success(`Đã Check-out phòng ${record.details[0].roomNumber}. Vui lòng lập hóa đơn thanh toán.`);
        // Tùy chọn: gọi fetchDepartures() để load lại hoặc chuyển luôn sang trang in hóa đơn
        navigate('/admin/invoices');
      }
    } catch (error) {
      console.error('Lỗi check-out:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi Check-out.');
    }
  };

  const filteredData = data.filter((item) => {
    const detail = item.details?.[0];
    const matchSearch =
      item.guestName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      (detail?.roomNumber || '').toLowerCase().includes(searchText.toLowerCase());
    
    // Nới lỏng: Nếu chưa chọn ngày (null) thì hiện tất cả (Hôm nay + Quá hạn), 
    // Nếu có chọn ngày thì mới lọc chính xác
    const matchDate = selectedDate ? dayjs(detail?.checkOutDate).isSame(selectedDate, 'day') : true;

    return matchSearch && matchDate;
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
      title: 'Dự kiến Check-out',
      key: 'expectedCheckOut',
      render: (_, record) => {
        const date = record.details?.[0]?.checkOutDate;
        return date ? <Typography.Text type="danger">{dayjs(date).format('DD/MM/YYYY HH:mm')}</Typography.Text> : '';
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
          <Popconfirm
            title={`Xác nhận trả phòng ${record.details?.[0]?.roomNumber || 'chưa xếp'}?`}
            onConfirm={() => handleCheckOut(record)}
            okText="Check-out"
            cancelText="Hủy"
          >
            <Button danger type="primary" icon={<ExportOutlined />} size="small">
              Trả phòng
            </Button>
          </Popconfirm>
        </Space>
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
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Không có dữ liệu' }}
      />
    </Card>
  );
};

export default Departures;

