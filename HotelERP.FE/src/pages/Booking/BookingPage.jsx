import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, DatePicker, InputNumber, Button, Card, Table, Tag, 
  Space, Input, Select, message, Spin, Row, Col, Typography, Layout, Result, Modal
} from 'antd'; 
import { 
  SearchOutlined, ArrowLeftOutlined, EditOutlined, 
  DeleteOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { create } from 'zustand';
import dayjs from 'dayjs';
import { useAuthStore } from "../../store/authStore";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Content } = Layout;

// =====================================================================
// 1. AXIOS CONFIGURATION
// =====================================================================
const apiClient = axios.create({
  baseURL: 'https://localhost:7100/api', 
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = useAuthStore.getState().token; 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("AuthStore chưa sẵn sàng:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ!';
    message.error(errorMsg);
    return Promise.reject(error);
  }
);

// =====================================================================
// 2. ZUSTAND STORE (Chỉ lưu mảng ID của phòng theo đúng yêu cầu)
// =====================================================================
const useBookingStore = create((set) => ({
  selectedRooms: [],
  toggleRoom: (roomId) => set((state) => ({ 
    selectedRooms: state.selectedRooms.includes(roomId)
      ? state.selectedRooms.filter(id => id !== roomId) // Đã có thì xóa đi
      : [...state.selectedRooms, roomId] // Chưa có thì thêm vào
  })),
  clearRooms: () => set({ selectedRooms: [] })
}));

// =====================================================================
// 3. COMPONENT: BOOKING LIST (TRANG 1)
// =====================================================================
const BookingList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchingRooms, setSearchingRooms] = useState(false);

  const fetchBookings = async (page = 1, search = '', status = null) => {
    setLoadingBookings(true);
    try {
      const response = await apiClient.get('/BookingEngine', {
        params: { page, limit: pagination.pageSize, search, status }
      });
      setBookings(response.data || []);
      setPagination(prev => ({ ...prev, current: page, total: response.total || 0 }));
    } catch (error) {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(1, searchTerm, statusFilter), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleSearchRooms = async (values) => {
    if (!values.dates) {
      message.warning('Vui lòng chọn ngày!');
      return;
    }
    setSearchingRooms(true);
    try {
      const payload = {
        checkInDate: values.dates[0].format('YYYY-MM-DD'),
        checkOutDate: values.dates[1].format('YYYY-MM-DD'),
        adultsCount: values.adults,   
        childrenCount: values.children,
      };
      
      // GỌI API THẬT
      const response = await apiClient.post('/BookingEngine/search', payload);
      
      // Chuyển sang Trang 2, truyền dữ liệu từ C# trả về (Dự kiến là mảng RoomType)
      navigate('select-room', { 
        state: { searchParams: payload, availableRooms: response.data || response } 
      });
    } catch (error) { 
      // Lỗi đã được Interceptor xử lý hiển thị message
    } finally { 
      setSearchingRooms(false); 
    }
  };

  const columns = [
    { title: 'Mã Booking', dataIndex: 'bookingCode', key: 'bookingCode', render: (t) => <b>{t}</b> },
    { title: 'Khách Hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Ngày Nhận', dataIndex: 'checkInDate', render: (d) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color="blue">{s}</Tag> },
    {
      title: 'Thao tác',
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={4}>QUẢN LÝ ĐẶT PHÒNG</Title>
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Form form={form} layout="inline" onFinish={handleSearchRooms} initialValues={{ adults: 2, children: 0 }}>
          <Form.Item name="dates" rules={[{ required: true, message: 'Chọn ngày!' }]}>
            <RangePicker format="DD/MM/YYYY" style={{ width: 280 }} />
          </Form.Item>
          <Form.Item name="adults" label="Người lớn"><InputNumber min={1} /></Form.Item>
          <Form.Item name="children" label="Trẻ em"><InputNumber min={0} /></Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={searchingRooms}>
              Tìm phòng trống
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="Tìm kiếm nhanh..." style={{ width: 250 }} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Table columns={columns} dataSource={bookings} rowKey="id" loading={loadingBookings} />
      </Card>
    </div>
  );
};

// =====================================================================
// 4. COMPONENT: SELECT ROOM (TRANG 2 - CÓ POPUP XÁC NHẬN)
// =====================================================================
const SelectRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRooms, toggleRoom, clearRooms } = useBookingStore();

  const searchParams = location.state?.searchParams || {};
  const roomTypesData = location.state?.availableRooms || [];

  // ---- QUẢN LÝ TRẠNG THÁI POPUP VÀ FORM ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm] = Form.useForm();

  useEffect(() => { clearRooms(); }, [clearRooms]);

  const handleSelect = (room) => {
    if (room.status === 'Occupied') return;
    toggleRoom(room.id); 
  };

  // ---- HÀM XỬ LÝ KHI SUBMIT FORM TRONG POPUP ----
  const handleConfirmBooking = async (values) => {
    setIsSubmitting(true);
    try {
      // Đóng gói dữ liệu chuẩn bị gửi API
      const finalPayload = {
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adultsCount: searchParams.adultsCount,
        childrenCount: searchParams.childrenCount,
        roomIds: selectedRooms, 
        customerInfo: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || '',
          voucherCode: values.voucherCode || '',
          notes: values.notes || ''
        }
      };

      console.log("Dữ liệu chuẩn bị gửi API:", finalPayload);

      // GỌI API BACKEND TẠI ĐÂY (Mở comment khi có API thật)
      // await apiClient.post('/BookingEngine/create', finalPayload);

      message.success('Tạo Booking thành công!');
      setIsModalOpen(false);
      bookingForm.resetFields();
      clearRooms();
      navigate('/'); // Quay về trang danh sách
      
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo Booking!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location.state) {
    return (
      <Result 
        status="warning" 
        title="Vui lòng tìm kiếm phòng trước!"
        extra={<Button type="primary" onClick={() => navigate('../')}>Quay lại</Button>}
      />
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* HEADER CHI TIẾT */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large" align="center">
              <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0 }}>
                Quay lại
              </Button>
              <div style={{ borderLeft: '1px solid #e8e8e8', paddingLeft: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  {dayjs(searchParams.checkInDate).format('DD/MM/YYYY')} 
                  <span style={{ margin: '0 8px' }}>→</span> 
                  {dayjs(searchParams.checkOutDate).format('DD/MM/YYYY')}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="blue">{searchParams.adultsCount || 0} Người lớn</Tag>
                  <Tag color="cyan">{searchParams.childrenCount || 0} Trẻ em</Tag>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Text strong style={{ fontSize: 16 }}>
                Đã chọn: <span style={{ color: '#1890ff', fontSize: 18 }}>{selectedRooms.length}</span> phòng
              </Text>
              <Button 
                type="primary" 
                size="large" 
                disabled={selectedRooms.length === 0}
                onClick={() => setIsModalOpen(true)} // MỞ POPUP KHI BẤM NÚT NÀY
              >
                Tiếp tục
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* DANH SÁCH HẠNG PHÒNG & PHÒNG */}
      {(() => {
        const validRoomTypes = roomTypesData.filter(rt => {
           const rooms = rt.rooms || rt.Rooms || [];
           return rooms.length > 0;
        });

        if (validRoomTypes.length === 0) {
          return (
            <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12 }}>
              <Text type="secondary">Không có phòng trống nào trong thời gian này.</Text>
            </Card>
          );
        }

        return validRoomTypes.map((roomType, index) => {
          const roomList = roomType.rooms || roomType.Rooms || [];
          const groupedByFloor = roomList.reduce((acc, room) => {
            const floorLevel = room.floor || room.Floor || '1'; 
            if (!acc[floorLevel]) acc[floorLevel] = [];
            acc[floorLevel].push(room);
            return acc;
          }, {});

          return (
            <Card 
              key={roomType.id || `roomType-${index}`} 
              style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }} 
              styles={{ body: { padding: 0 } }} 
            >
              <div style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                  {roomType.name} - <span style={{ color: '#ff4d4f' }}>{roomType.basePrice?.toLocaleString()} VNĐ/Đêm</span>
                </Title>
                <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                  Sức chứa: {roomType.capacityAdults} NL, {roomType.capacityChildren} TE
                </Text>
              </div>

              <div style={{ padding: 24 }}>
                {Object.entries(groupedByFloor).map(([floor, roomsInFloor]) => (
                  <div key={floor} style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 16, borderBottom: '1px dashed #e8e8e8', paddingBottom: 8 }}>
                      <Text strong style={{ fontSize: 16, color: '#595959' }}>Tầng {floor}</Text>
                    </div>

                    <Row gutter={[16, 16]}>
                      {roomsInFloor.map((room) => {
                        const isOccupied = room.status === 'Occupied';
                        const isSelected = selectedRooms.includes(room.id); 

                        let cardStyle = {
                          padding: '20px 10px', textAlign: 'center', borderRadius: 8,
                          border: '1px solid #d9d9d9', backgroundColor: '#ffffff',
                          cursor: 'pointer', transition: 'all 0.3s ease',
                        };

                        if (isOccupied) {
                          cardStyle = { ...cardStyle, backgroundColor: '#fff1f0', borderColor: '#ffa39e', cursor: 'not-allowed' };
                        } else if (isSelected) {
                          cardStyle = { ...cardStyle, backgroundColor: '#e6f7ff', borderColor: '#1890ff', boxShadow: '0 0 8px rgba(24,144,255,0.2)' };
                        }

                        return (
                          <Col span={4} key={room.id}>
                            <div style={cardStyle} onClick={() => handleSelect(room)}>
                              <Title level={4} style={{ margin: 0, color: isOccupied ? '#cf1322' : (isSelected ? '#096dd9' : '#262626') }}>
                                {room.roomNumber}
                              </Title>
                              <Text type="secondary" style={{ fontSize: 12 }}>Tầng {room.floor || room.Floor}</Text>
                              <div style={{ marginTop: 12 }}>
                                {isOccupied ? <Tag color="red" style={{ margin: 0 }}>Đang ở</Tag> : isSelected ? <Tag color="blue" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>Đã chọn</Tag> : <Tag color="default" style={{ margin: 0 }}>Trống</Tag>}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                ))}
              </div>
            </Card>
          );
        });
      })()}

      {/* ========================================================= */}
      {/* POPUP THÔNG TIN KHÁCH HÀNG KHI BẤM "TIẾP TỤC"             */}
      {/* ========================================================= */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Thông tin Lễ Tân Đặt Phòng</Title>}
        open={isModalOpen}
        onCancel={() => !isSubmitting && setIsModalOpen(false)}
        okText="Xác nhận đặt phòng"
        cancelText="Hủy"
        onOk={() => bookingForm.submit()} // Gắn nút OK của Modal với sự kiện Submit của Form
        confirmLoading={isSubmitting}
        width={700}
        centered
        maskClosable={false} // Chống bấm ra ngoài tắt nhầm
      >
        <div style={{ padding: '20px 0 0 0' }}>
          <Form 
            form={bookingForm} 
            layout="vertical" 
            onFinish={handleConfirmBooking}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="fullName" 
                  label={<Text strong>Họ và tên khách hàng</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input placeholder="Nhập họ và tên..." size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="phone" 
                  label={<Text strong>Số điện thoại</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input placeholder="Nhập số điện thoại..." size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="email" 
                  label={<Text strong>Email <Text type="secondary" style={{fontWeight: 'normal'}}>(Tùy chọn)</Text></Text>}
                  rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]}
                >
                  <Input placeholder="Nhập địa chỉ email..." size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="voucherCode" 
                  label={<Text strong>Mã Voucher <Text type="secondary" style={{fontWeight: 'normal'}}>(Tùy chọn)</Text></Text>}
                >
                  <Input placeholder="Nhập mã giảm giá..." size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="notes" 
              label={<Text strong>Ghi chú <Text type="secondary" style={{fontWeight: 'normal'}}>(Tùy chọn)</Text></Text>}
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Ví dụ: Khách yêu cầu phòng yên tĩnh..." 
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

    </div>
  );
};

// =====================================================================
// 5. MAIN COMPONENT (GOM NHÓM ROUTE)
// =====================================================================
const BookingSystem = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Content>
        <Routes>
          <Route path="/" element={<BookingList />} />
          <Route path="select-room" element={<SelectRoom />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default BookingSystem;