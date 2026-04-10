import React, { useState } from 'react';
import {
  Table, Input, Select, Button, Space, Tag, Card, Row, Col, DatePicker, InputNumber, Typography, Modal, message
} from 'antd';
import {
  SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

export default function BookingManagement() {
  const navigate = useNavigate();

  // States cho Nhiệm vụ 2: Bộ lọc tìm kiếm
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  // ĐÃ BƠM DỮ LIỆU MOCK GIỐNG Y HỆT ẢNH CỦA BẠN
  const [bookings, setBookings] = useState([
    { id: 1, bookingCode: 'BK-20260404102535', guestName: 'ABC', phone: '0901111111', checkInDate: '06/04/2026 14:00', status: 'Đã xác nhận' },
    { id: 2, bookingCode: 'BK-20260403212455', guestName: 'Nhóm phòng 2', phone: '0902222222', checkInDate: '03/04/2026 14:00', status: 'Chờ xử lý' }, // Chờ xử lý tương đương In_Progress
    { id: 3, bookingCode: 'BK-20260403212341', guestName: 'Nhóm phòng', phone: '0903333333', checkInDate: '04/04/2026 14:00', status: 'Đã xác nhận' },
    { id: 4, bookingCode: 'BK-20260403203442', guestName: 'Nguyễn Văn A', phone: '0904444444', checkInDate: '02/04/2026 14:00', status: 'Hoàn tất' }
  ]);

  // NHIỆM VỤ 2: Logic Bộ lọc (Tên, SĐT, Mã) và Dropdown Trạng thái
  const filteredData = bookings.filter(item => {
    const searchLower = searchText.toLowerCase();
    const matchText =
      item.bookingCode.toLowerCase().includes(searchLower) ||
      item.guestName.toLowerCase().includes(searchLower) ||
      item.phone.includes(searchLower);

    const matchStatus = statusFilter ? item.status === statusFilter : true;

    return matchText && matchStatus;
  });

  // NHIỆM VỤ 3: CÁC HÀM XỬ LÝ LOGIC NÚT THAO TÁC
  const handleConfirm = (bookingCode) => {
    Modal.confirm({
      title: 'Xác nhận đơn đặt phòng',
      content: `Bạn có chắc chắn muốn XÁC NHẬN đơn ${bookingCode}?`,
      okText: 'Xác nhận ngay',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setBookings(prev => prev.map(b => 
          b.bookingCode === bookingCode ? { ...b, status: 'Đã xác nhận' } : b
        ));
        message.success(`Đã xác nhận đơn ${bookingCode} thành công!`);
      }
    });
  };

  const handleCancel = (bookingCode) => {
    Modal.confirm({
      title: 'Hủy đơn đặt phòng',
      content: `Bạn có chắc chắn muốn HỦY đơn ${bookingCode}? Thao tác này không thể hoàn tác.`,
      okText: 'Đồng ý hủy',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: () => {
        setBookings(prev => prev.map(b => 
          b.bookingCode === bookingCode ? { ...b, status: 'Đã hủy' } : b
        ));
        message.success(`Đã hủy đơn ${bookingCode}!`);
      }
    });
  };

  const handleCheckIn = (bookingCode) => {
    Modal.confirm({
      title: 'Tiến hành Nhận Phòng',
      content: `Xác nhận khách của đơn ${bookingCode} đã đến và Nhận phòng?`,
      okText: 'Nhận phòng',
      cancelText: 'Chưa phải lúc',
      onOk: () => {
        setBookings(prev => prev.map(b => 
          b.bookingCode === bookingCode ? { ...b, status: 'Hoàn tất' } : b
        ));
        message.success(`Check-in thành công cho đơn ${bookingCode}!`);
      }
    });
  };

  // NHIỆM VỤ 1 & 3: Cấu hình Bảng và Logic nút Thao tác
  const columns = [
    {
      title: 'Mã Booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: text => <b>{text}</b>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'guestName',
      key: 'guestName'
    },
    {
      title: 'Ngày Check-in',
      dataIndex: 'checkInDate',
      key: 'checkInDate'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        // Tô màu Tag theo trạng thái giống trong ảnh
        let color = 'default';
        if (status === 'Đã xác nhận') color = 'success';
        if (status === 'Chờ xử lý') color = 'default'; // Màu xám cho In_Progress
        if (status === 'Hoàn tất') color = 'processing';
        if (status === 'Đã hủy') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="middle">
            {/* NHIỆM VỤ 3: Nút Mắt (Luôn hiện để mở trang Chi tiết Booking) */}
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/bookings/${record.bookingCode}`)}
              title="Xem chi tiết"
            />

            {/* NHIỆM VỤ 3: Logic Trạng thái "Chờ xử lý" (Hiện Done + X) */}
            {record.status === 'Chờ xử lý' && (
              <>
                <Button
                  type="text"
                  style={{ color: '#1890ff' }}
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirm(record.bookingCode)}
                  title="Xác nhận"
                />
                <Button
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCancel(record.bookingCode)}
                  title="Hủy đơn"
                />
              </>
            )}

            {/* NHIỆM VỤ 3: Logic Trạng thái "Đã xác nhận" (Hiện nút Nhận phòng) */}
            {record.status === 'Đã xác nhận' && (
              <Button
                type="primary"
                size="small"
                icon={<LoginOutlined />}
                onClick={() => handleCheckIn(record.bookingCode)}
              >
                Nhận phòng
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>

      {/* KHU VỰC TRÊN: FORM TÌM PHÒNG TRỐNG (Giống y hệt hình mẫu) */}
      <Card style={{ borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Title level={5} style={{ marginTop: 0, color: '#1890ff' }}>Tìm phòng trống & Đặt phòng</Title>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 4 }}>* Ngày nhận - trả phòng</div>
            <RangePicker style={{ width: '100%' }} size="large" />
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 4 }}>* Người lớn</div>
            <InputNumber min={1} defaultValue={1} style={{ width: '100%' }} size="large" />
          </Col>
          <Col span={4}>
            <div style={{ marginBottom: 4 }}>Trẻ em</div>
            <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} size="large" />
          </Col>
          <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button type="primary" icon={<SearchOutlined />} size="large" style={{ width: '100%' }}>
              Tìm phòng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KHU VỰC DƯỚI: BẢNG QUẢN LÝ BOOKING */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

        {/* NHIỆM VỤ 2: THANH TÌM KIẾM VÀ LỌC */}
        <Row gutter={16} style={{ marginBottom: 16 }} justify="space-between">
          <Col span={12}>
            <Input
              placeholder="Tìm theo Tên, SĐT, Mã..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="Chờ xử lý">Chờ xử lý</Option>
              <Option value="Đã xác nhận">Đã xác nhận</Option>
              <Option value="Hoàn tất">Hoàn tất</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Col>
        </Row>

        {/* NHIỆM VỤ 1: HIỂN THỊ BẢNG */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}