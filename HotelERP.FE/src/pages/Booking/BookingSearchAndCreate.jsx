import React, { useState } from 'react';
import { 
  DatePicker, InputNumber, Button, Row, Col, 
  Card, Table, Modal, Form, Input, Tag, message 
} from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const BookingSearchAndCreate = () => {
  const [searchForm] = Form.useForm();
  const [bookingForm] = Form.useForm();
  
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Pop-up (Modal)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ========================================================
  // YÊU CẦU 1 & 2: XỬ LÝ FORM TÌM KIẾM
  // ========================================================
  const handleSearch = (values) => {
    if (!values.dates || values.dates.length !== 2) {
      message.error("Vui lòng chọn Ngày nhận và Ngày trả!");
      return;
    }
    setLoading(true);
    
    // Giả lập dữ liệu API trả về. (Thực tế bạn sẽ gọi axios ở đây)
    setTimeout(() => {
      const mockData = [
        { id: 1, name: 'Phòng 101', type: 'Standard', price: 500000, isOccupied: false },
        { id: 2, name: 'Phòng 102', type: 'Standard', price: 500000, isOccupied: true }, // Phòng đang có người
        { id: 3, name: 'Phòng 201', type: 'VIP', price: 1200000, isOccupied: false },
      ];
      setAvailableRooms(mockData);
      setLoading(false);
    }, 800);
  };

  // Mở Pop-up khi bấm "Chọn đặt phòng"
  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
  };

  // ========================================================
  // YÊU CẦU 4: XỬ LÝ SUBMIT FORM LẤY THÔNG TIN KHÁCH
  // ========================================================
  const handleBookingSubmit = (values) => {
    // values chứa: fullName, phone, email, voucherCode, notes
    console.log("Dữ liệu gửi lên API:", { roomId: selectedRoom.id, ...values });
    
    message.success("Đã ghi nhận thông tin! Chuyển sang tiến hành đặt phòng...");
    setIsModalVisible(false);
    bookingForm.resetFields(); // Xóa trắng form sau khi submit
  };

  // ========================================================
  // YÊU CẦU 3: CẤU HÌNH BẢNG KẾT QUẢ TÌM KIẾM
  // ========================================================
  const columns = [
    { title: 'Phòng', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
    { title: 'Hạng phòng', dataIndex: 'type', key: 'type' },
    { title: 'Giá / Đêm', dataIndex: 'price', key: 'price', render: (val) => `${val.toLocaleString()} đ` },
    { 
      title: 'Trạng thái', 
      key: 'status', 
      render: (_, record) => (
        record.isOccupied 
          ? <Tag color="red">Đang có khách</Tag> 
          : <Tag color="green">Trống & Sạch</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          disabled={record.isOccupied} // 👉 Logic: Disable nếu phòng có người
          danger={record.isOccupied}   // 👉 UI: Antd tự bôi đỏ nút nếu có thêm danger
          onClick={() => handleOpenModal(record)}
        >
          {record.isOccupied ? 'Không thể chọn' : 'Chọn đặt phòng'}
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* -------------------- KHU VỰC 1 & 2: TÌM KIẾM -------------------- */}
      <Card title="TÌM KIẾM PHÒNG" style={{ marginBottom: 24 }}>
        <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
          <Row gutter={16}>
            <Col span={10}>
              {/* COMPONENT LỊCH (RangePicker) */}
              <Form.Item name="dates" label="Ngày nhận - Ngày trả" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <RangePicker 
                  format="DD/MM/YYYY" 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => current && current < dayjs().startOf('day')} // Không cho chọn ngày quá khứ
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              {/* BỘ ĐẾM NGƯỜI LỚN */}
              <Form.Item name="adults" label="Người lớn" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              {/* BỘ ĐẾM TRẺ EM */}
              <Form.Item name="children" label="Trẻ em" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} block>
                  Tìm Phòng
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* -------------------- KHU VỰC 3: HIỂN THỊ KẾT QUẢ -------------------- */}
      {availableRooms.length > 0 && (
        <Card title="DANH SÁCH PHÒNG TRỐNG">
          <Table 
            dataSource={availableRooms} 
            columns={columns} 
            rowKey="id" 
            pagination={false} 
            // 👉 Logic: Bôi nền đỏ nhạt cho cả dòng nếu phòng đang có người ở
            rowClassName={(record) => record.isOccupied ? 'row-occupied' : ''}
          />
        </Card>
      )}

      {/* -------------------- KHU VỰC 4: POP-UP NHẬP THÔNG TIN (MODAL) -------------------- */}
      <Modal
        title={`NHẬP THÔNG TIN KHÁCH HÀNG - ${selectedRoom?.name || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} // Tắt footer mặc định để dùng button submit của Form
        width={650}
      >
        <Form form={bookingForm} layout="vertical" onFinish={handleBookingSubmit} style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="09xx..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email (Tùy chọn)">
                <Input prefix={<MailOutlined />} placeholder="email@example.com" type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="voucherCode" label="Mã Voucher (Tùy chọn)">
                <Input placeholder="Nhập mã giảm giá..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="Ghi chú (Tùy chọn)">
                <TextArea rows={3} placeholder="Ví dụ: Yêu cầu dọn phòng kỹ, lấy thêm gối..." />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" size="large" htmlType="submit" block icon={<CheckCircleOutlined />}>
            Tiến hành Đặt phòng
          </Button>
        </Form>
      </Modal>

      {/* CSS Nhỏ lẻ đính kèm để bôi đỏ dòng bị Occupied */}
      <style>{`
        .row-occupied {
          background-color: #fff2f0 !important; /* Đỏ nhạt */
        }
        .row-occupied:hover > td {
          background-color: #ffccc7 !important; /* Đỏ nhạt hơn khi hover */
        }
      `}</style>
    </div>
  );
};

export default BookingSearchAndCreate;