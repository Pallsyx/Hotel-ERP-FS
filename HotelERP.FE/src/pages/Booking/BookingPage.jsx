import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Form, DatePicker, InputNumber, Button, Card, Table, Tag, 
  Space, Input, Select, message, Spin, Row, Col, Typography, Layout, Result, Modal
} from 'antd'; 
import { 
  SearchOutlined, ArrowLeftOutlined, EditOutlined, 
  DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, LoginOutlined 
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

  const [allMockData, setAllMockData] = useState(() => {
    const saved = localStorage.getItem('hotel_mock_bookings');
    if (saved) {
      // Xoá bỏ 4 dữ liệu giả gốc nếu chúng vẫn còn tồn tại trong kho lưu trữ
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter(b => 
        b.customerName !== 'ABC' && 
        b.customerName !== 'Nhóm phòng' && 
        b.customerName !== 'Nhóm phòng 2' && 
        b.customerName !== 'Nguyễn Văn A'
      );
      return filtered;
    }
    return [];
  });

  // Tự động lưu mảng dữ liệu vào bộ nhớ của trình duyệt mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('hotel_mock_bookings', JSON.stringify(allMockData));
  }, [allMockData]);

  const fetchBookings = async (page = 1, search = '', status = null) => {
    setLoadingBookings(true);
    try {
      // Dùng dữ liệu giả (Mock) trực tiếp thay vì API để Test các Nút Thao Tác (Nhiệm vụ 3)
      let filtered = allMockData;
      if (search) {
        filtered = filtered.filter(item => 
          item.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
          item.customerName.toLowerCase().includes(search.toLowerCase()) ||
          item.phone?.includes(search)
        );
      }
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      }
      setBookings(filtered);
      setPagination(prev => ({ ...prev, current: page, total: filtered.length }));
    } finally {
      setTimeout(() => setLoadingBookings(false), 200); // Tạo độ trễ giả lập Network
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(1, searchTerm, statusFilter), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, allMockData]); // Thêm allMockData để tự re-render khi ấn nút

  // CÁC HÀM XỬ LÝ LOGIC NÚT THAO TÁC (NHIỆM VỤ 3)
  const handleConfirm = (bookingCode) => {
    Modal.confirm({
      title: 'Xác nhận đơn đặt phòng',
      content: `XÁC NHẬN đơn ${bookingCode}?`,
      okText: 'Xác nhận ngay', cancelText: 'Hủy bỏ',
      onOk: () => {
        setAllMockData(prev => prev.map(b => b.bookingCode === bookingCode ? { ...b, status: 'Đã xác nhận' } : b));
        message.success(`Đã xác nhận đơn ${bookingCode} thành công!`);
      }
    });
  };

  const handleCancel = (bookingCode) => {
    Modal.confirm({
      title: 'Hủy đơn đặt phòng',
      content: `HỦY đơn ${bookingCode}? Thao tác không thể hoàn tác.`,
      okText: 'Đồng ý hủy', okType: 'danger', cancelText: 'Quay lại',
      onOk: () => {
        setAllMockData(prev => prev.map(b => b.bookingCode === bookingCode ? { ...b, status: 'Đã hủy' } : b));
        message.success(`Đã hủy đơn ${bookingCode}!`);
      }
    });
  };

  const handleCheckIn = (bookingCode) => {
    Modal.confirm({
      title: 'Tiến hành Nhận Phòng',
      content: `Khách của đơn ${bookingCode} đã đến và Nhận phòng?`,
      okText: 'Nhận phòng', cancelText: 'Chưa phải lúc',
      onOk: () => {
        setAllMockData(prev => prev.map(b => b.bookingCode === bookingCode ? { ...b, status: 'Hoàn tất' } : b));
        message.success(`Check-in thành công cho đơn ${bookingCode}!`);
      }
    });
  };

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
    { title: 'Ngày Nhận', dataIndex: 'checkInDate', render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm') },
    { title: 'Trạng thái', dataIndex: 'status', render: (status) => {
        let color = 'default';
        if (status === 'Đã xác nhận') color = 'success';
        if (status === 'Chờ xử lý') color = 'default'; 
        if (status === 'Hoàn tất') color = 'processing';
        if (status === 'Đã hủy') color = 'error';
        return <Tag color={color}>{status}</Tag>;
    }},
    {
      title: 'Thao tác',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/admin/bookings/${record.bookingCode}`)} title="Xem chi tiết" />
          
          {record.status === 'Chờ xử lý' && (
            <>
              <Button type="text" style={{ color: '#1890ff' }} icon={<CheckCircleOutlined />} onClick={() => handleConfirm(record.bookingCode)} title="Xác nhận" />
              <Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(record.bookingCode)} title="Hủy đơn" />
            </>
          )}

          {record.status === 'Đã xác nhận' && (
            <Button type="primary" size="small" icon={<LoginOutlined />} onClick={() => handleCheckIn(record.bookingCode)}>Nhận phòng</Button>
          )}
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
          <Row gutter={16}>
             <Col span={12}>
               <Input 
                 placeholder="Tìm theo Tên, SĐT, Mã..." 
                 prefix={<SearchOutlined />} 
                 style={{ width: 300 }} 
                 allowClear 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
             </Col>
             <Col span={6}>
               <Select 
                 placeholder="Lọc trạng thái" 
                 style={{ width: 200 }} 
                 allowClear 
                 onChange={(val) => setStatusFilter(val)}
               >
                 <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
                 <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
                 <Select.Option value="Hoàn tất">Hoàn tất</Select.Option>
                 <Select.Option value="Đã hủy">Đã hủy</Select.Option>
               </Select>
             </Col>
          </Row>
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

      // TẠO BOOKING GIẢ VÀ ĐƯA VÀO BỘ NHỚ TRÌNH DUYỆT ĐỂ BẢNG 1 CÓ THỂ ĐỌC ĐƯỢC
      const currentList = JSON.parse(localStorage.getItem('hotel_mock_bookings') || '[]');
      
      // Map phòng đã chọn thành chi tiết phòng
      const bookedRooms = [];
      let totalAmount = 0;
      
      const checkInDayjs = dayjs(searchParams.checkInDate || new Date());
      const checkOutDayjs = dayjs(searchParams.checkOutDate || new Date());
      const diffDays = checkOutDayjs.diff(checkInDayjs, 'day') || 1;

      selectedRooms.forEach(roomId => {
        roomTypesData.forEach(rt => {
          const roomsArray = rt.rooms || rt.Rooms || [];
          const matched = roomsArray.find(r => r.id === roomId);
          if (matched) {
            bookedRooms.push({
              id: matched.id,
              typeName: rt.name,
              roomNum: matched.roomNumber,
              checkIn: searchParams.checkInDate ? searchParams.checkInDate + ' 14:00' : checkInDayjs.format('DD/MM/YYYY HH:mm'),
              checkOut: searchParams.checkOutDate ? searchParams.checkOutDate + ' 12:00' : checkOutDayjs.format('DD/MM/YYYY HH:mm'),
              price: rt.basePrice || 0,
              status: 'Chờ xử lý'
            });
            totalAmount += (rt.basePrice || 0) * diffDays;
          }
        });
      });

      const newMockBooking = {
        id: Date.now(),
        bookingCode: 'BK-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
        customerName: values.fullName,
        phone: values.phone,
        email: values.email || '',
        notes: values.notes || 'Không có',
        voucherCode: values.voucherCode || 'Không áp dụng',
        checkInDate: searchParams.checkInDate ? searchParams.checkInDate + ' 14:00' : dayjs().format('YYYY-MM-DD HH:mm'),
        status: 'Chờ xử lý', // Đơn mới mặc định chờ xử lý
        originalRooms: bookedRooms,
        totalAmount: totalAmount
      };
      
      // Đẩy lên đầu danh sách
      currentList.unshift(newMockBooking);
      localStorage.setItem('hotel_mock_bookings', JSON.stringify(currentList));

      message.success('Tạo Booking thành công!');
      setIsModalOpen(false);
      bookingForm.resetFields();
      clearRooms();
      
      // SỬA TẠI ĐÂY: Quay về đúng trang Quản lý Đặt Phòng thay vì trang chủ '/' gây lỗi 404
      navigate('/admin/bookings'); 
      
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
// 5. COMPONENT: BOOKING DETAIL (TRANG CHI TIẾT THEO MOCK-UP 2)
// =====================================================================
const BookingDetail = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositForm] = Form.useForm();

  useEffect(() => {
    // Lấy data từ kho chứa tạm localStorage để hiển thị chi tiết
    const list = JSON.parse(localStorage.getItem('hotel_mock_bookings') || '[]');
    const found = list.find(b => b.bookingCode === bookingCode);
    if (found) {
      setBooking(found);
    }
  }, [bookingCode]);

  if (!booking) {
    return <Result status="404" title="Không tìm thấy mã Booking này!" extra={<Button type="primary" onClick={() => navigate('/admin/bookings')}>Quay lại Bảng Quản lý</Button>} />;
  }

  const getStatusTag = (status) => {
    let color = 'default';
    if (status === 'Đã xác nhận') color = 'success';
    if (status === 'Chờ xử lý') color = 'warning';
    if (status === 'Hoàn tất') color = 'processing';
    if (status === 'Đã hủy') color = 'error';
    return <Tag color={color}>{status}</Tag>;
  };

  // Nút bên trong Trang chi tiết cũng có thể cập nhật trạng thái ra Bảng 1
  // Nút bên trong Trang chi tiết cũng có thể cập nhật trạng thái ra Bảng 1
  const executeConfirm = () => {
    const list = JSON.parse(localStorage.getItem('hotel_mock_bookings') || '[]');
    const newList = list.map(b => b.bookingCode === bookingCode ? { ...b, status: 'Đã xác nhận' } : b);
    localStorage.setItem('hotel_mock_bookings', JSON.stringify(newList));
    setBooking(prev => ({...prev, status: 'Đã xác nhận'}));
    message.success('Đã xác nhận đơn thành công!');
  };

  const handleConfirm = () => {
    if (!booking.deposit || booking.deposit <= 0) {
      Modal.confirm({
        title: 'Cảnh báo: Khách chưa nạp cọc!',
        content: 'Khách chưa nạp tiền cọc, bạn có chắc chắn muốn xác nhận giữ phòng không?',
        okText: 'Vẫn Xác Nhận',
        cancelText: 'Hủy bỏ',
        onOk: () => executeConfirm()
      });
    } else {
      executeConfirm();
    }
  };

  const handleSaveDeposit = (values) => {
    const list = JSON.parse(localStorage.getItem('hotel_mock_bookings') || '[]');
    const currentDeposit = booking.deposit || 0;
    const newDeposit = currentDeposit + values.amount;
    
    const newList = list.map(b => b.bookingCode === bookingCode ? { ...b, deposit: newDeposit } : b);
    localStorage.setItem('hotel_mock_bookings', JSON.stringify(newList));
    
    setBooking(prev => ({...prev, deposit: newDeposit}));
    message.success(`Đã nạp cọc ${values.amount.toLocaleString()} đ thành công!`);
    setIsDepositModalOpen(false);
    depositForm.resetFields();
  };

  const handleCancel = () => {
    const list = JSON.parse(localStorage.getItem('hotel_mock_bookings') || '[]');
    const newList = list.map(b => b.bookingCode === bookingCode ? { ...b, status: 'Đã hủy' } : b);
    localStorage.setItem('hotel_mock_bookings', JSON.stringify(newList));
    setBooking(prev => ({...prev, status: 'Đã hủy'}));
    message.success('Đã hủy đơn thành công!');
  };

  // Load danh sách phòng thật sự đã đặt (ưu tiên từ dữ liệu giả vừa lưu, nếu không có thì fallback)
  const renderRooms = booking.originalRooms && booking.originalRooms.length > 0 ? booking.originalRooms : [
    { id: 1, typeName: 'Phòng tiêu chuẩn 1 giường đơn', roomNum: 'P.102', checkIn: '04/04/2026 14:00', checkOut: '06/04/2026 12:00', price: 400000, status: booking.status || 'Chờ xử lý' },
    { id: 2, typeName: 'Phòng tiêu chuẩn 1 giường đơn', roomNum: 'P.103', checkIn: '04/04/2026 14:00', checkOut: '06/04/2026 12:00', price: 400000, status: booking.status || 'Chờ xử lý' },
    { id: 3, typeName: 'Phòng tiêu chuẩn 1 giường đơn', roomNum: 'P.104', checkIn: '04/04/2026 14:00', checkOut: '06/04/2026 12:00', price: 400000, status: booking.status || 'Chờ xử lý' }
  ];
  
  // Format tổng tiền liên kết với booking
  const displayTotal = booking.totalAmount ? booking.totalAmount.toLocaleString() : '2.400.000';

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* HEADER CHI TIẾT */}
      <Card styles={{ body: { padding: '16px 24px' } }} style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" size="middle">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/bookings')} style={{ fontWeight: 600, paddingLeft: 0 }}>
                 Chi tiết: {booking.bookingCode}
              </Button>
              {getStatusTag(booking.status)}
            </Space>
          </Col>
          <Col>
            {booking.status === 'Chờ xử lý' && (
              <Space>
                <Button type="primary" onClick={handleConfirm}>Xác nhận Đơn</Button>
                <Button danger onClick={handleCancel}>Hủy Đơn</Button>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* THÔNG TIN */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Thông tin khách hàng" extra={<Button type="link" size="small">Sửa</Button>} style={{ borderRadius: 12, height: '100%' }}>
            <div style={{ lineHeight: '32px' }}>
              <div><Text type="secondary" style={{ width: 120, display: 'inline-block' }}>Họ và tên:</Text> <Text strong>{booking.customerName}</Text></div>
              <div><Text type="secondary" style={{ width: 120, display: 'inline-block' }}>Số điện thoại:</Text> <Text>{booking.phone || '0888699388'}</Text></div>
              <div><Text type="secondary" style={{ width: 120, display: 'inline-block' }}>Email:</Text> <Text>{booking.email || 'Không có'}</Text></div>
              <div><Text type="secondary" style={{ width: 120, display: 'inline-block' }}>Ngày đặt:</Text> <Text>{dayjs(booking.checkInDate).format('DD/MM/YYYY HH:mm')}</Text></div>
              <div><Text type="secondary" style={{ width: 120, display: 'inline-block' }}>Ghi chú:</Text> <Text>{booking.notes || 'Không có'}</Text></div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thông tin thanh toán" extra={<Button size="small" onClick={() => setIsDepositModalOpen(true)}>Nạp Cọc</Button>} style={{ borderRadius: 12, height: '100%' }}>
            <div style={{ lineHeight: '32px' }}>
              <div><Text type="secondary" style={{ width: 150, display: 'inline-block' }}>Mã Voucher:</Text> <Text>{booking.voucherCode || 'Không áp dụng'}</Text></div>
              <div><Text type="secondary" style={{ width: 150, display: 'inline-block' }}>Giảm giá:</Text> <Text type="danger">-0 đ</Text></div>
              <div><Text type="secondary" style={{ width: 150, display: 'inline-block' }}>Đã đặt cọc:</Text> <Text style={{ color: '#52c41a' }}>+{(booking.deposit || 0).toLocaleString()} đ</Text></div>
              <div style={{ marginTop: 8 }}><Text type="secondary" style={{ width: 150, display: 'inline-block', fontSize: 16 }}>Tổng tiền (Dự kiến):</Text> <Text strong style={{ fontSize: 18, color: '#1890ff' }}>{displayTotal} đ</Text></div>
              <div style={{ marginTop: 4 }}><Text type="secondary" style={{ width: 150, display: 'inline-block', fontSize: 16 }}>Còn lại cần thanh toán:</Text> <Text strong type="danger" style={{ fontSize: 16 }}>{((booking.totalAmount || 2400000) - (booking.deposit || 0)).toLocaleString()} đ</Text></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* DANH SÁCH PHÒNG ĐÃ ĐẶT */}
      <Card title={`Danh sách phòng đã đặt (${renderRooms.length})`} style={{ borderRadius: 12 }}>
        <Table
          dataSource={renderRooms}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Hạng phòng', dataIndex: 'typeName', key: 'type', render: t => <Text strong>{t}</Text> },
            { title: 'Phòng xếp', dataIndex: 'roomNum', key: 'room', render: r => <Tag color="blue">{r}</Tag> },
            { title: 'Check-in', dataIndex: 'checkIn', key: 'in' },
            { title: 'Check-out', dataIndex: 'checkOut', key: 'out' },
            { title: 'Giá/Đêm (VNĐ)', dataIndex: 'price', key: 'price', render: p => p.toLocaleString() },
            { title: 'Trạng thái', dataIndex: 'status', key: 'stt', render: s => <Tag color="orange">{s}</Tag> }
          ]}
        />
      </Card>
      
      {/* MODAL NẠP CỌC */}
      <Modal
        title="Tiếp nhận tiền cọc"
        open={isDepositModalOpen}
        onCancel={() => setIsDepositModalOpen(false)}
        onOk={() => depositForm.submit()}
        okText="Lưu thông tin"
        cancelText="Hủy"
      >
        <Form form={depositForm} layout="vertical" onFinish={handleSaveDeposit}>
          <Form.Item name="amount" label="Số tiền cọc khách đưa" rules={[{ required: true, message: 'Vui lòng nhập số tiền cọc' }]}>
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              suffix="VNĐ"
              placeholder="VD: 1000000"
            />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Phương thức thanh toán" initialValue="Chuyển khoản">
            <Select>
              <Select.Option value="Chuyển khoản">Chuyển khoản</Select.Option>
              <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
              <Select.Option value="Thẻ tín dụng/Ghi nợ">Thẻ tín dụng/Ghi nợ</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú / Link ảnh Bill chuyển khoản">
            <Input.TextArea rows={3} placeholder="Nhập đường link ảnh chụp bill hoặc ghi chú thông tin người chuyển..." />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

// =====================================================================
// 6. MAIN COMPONENT (GOM NHÓM ROUTE)
// =====================================================================
const BookingSystem = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Content>
        <Routes>
          <Route path="/" element={<BookingList />} />
          <Route path="select-room" element={<SelectRoom />} />
          <Route path=":bookingCode" element={<BookingDetail />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default BookingSystem;