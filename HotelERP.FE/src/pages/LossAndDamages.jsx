import React, { useState, useMemo, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import { 
  Table, Button, DatePicker, 
  Space, Card, Row, Col, Typography, message, 
  Select, InputNumber, Form, Input, Modal
} from 'antd';
import { 
  AppstoreOutlined, SearchOutlined, ReloadOutlined,
  WarningOutlined, DollarOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, InboxOutlined, PlusOutlined
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;

// --- MOCK DATA ---
const mockBookings = [
  { id: '102', roomName: 'Phòng 102' },
  { id: '103', roomName: 'Phòng 103' },
  { id: 'BK001', roomName: 'Phòng 101' },
  { id: 'BK002', roomName: 'Phòng 205 (VIP)' },
];

const mockRoomItems = [
  { id: 'IT01', name: 'Khăn tắm', price: 150000 },
  { id: 'IT02', name: 'Cốc thủy tinh', price: 50000 },
  { id: 'IT03', name: 'Điều khiển TV', price: 300000 },
  { id: 'IT04', name: 'Bình siêu tốc Sunhouse', price: 350000 },
  { id: 'IT05', name: 'Nước ngọt Coca Cola 320ml', price: 20000 },
  { id: 'IT06', name: 'Bánh Oreo 133g', price: 30000 },
  { id: 'IT07', name: 'Nước suối Lavie 500ml', price: 15000 },
];

const INITIAL_DATA = [
  { id: 38, roomNumber: '102', itemName: 'Nước ngọt Coca Cola 320ml', quantity: 1, penaltyAmount: 20000, description: '', createdAt: '2026-03-28T04:14:00', evidenceImageUrl: null },
  { id: 35, roomNumber: '102', itemName: 'Ấm đun nước siêu tốc Sunhouse', quantity: 1, penaltyAmount: 350000, description: '', createdAt: '2026-03-28T03:04:00', evidenceImageUrl: null },
  { id: 34, roomNumber: '102', itemName: 'Bánh Oreo 133g', quantity: 1, penaltyAmount: 30000, description: 'khách dùng', createdAt: '2026-03-28T01:28:00', evidenceImageUrl: null },
  { id: 26, roomNumber: '103', itemName: 'Bánh Oreo 133g', quantity: 1, penaltyAmount: 30000, description: '', createdAt: '2026-03-27T15:18:00', evidenceImageUrl: null },
  { id: 25, roomNumber: '103', itemName: 'Nước ngọt Coca Cola 320ml', quantity: 2, penaltyAmount: 20000, description: '', createdAt: '2026-03-27T15:16:00', evidenceImageUrl: null },
  { id: 24, roomNumber: '103', itemName: 'Nước suối Lavie 500ml', quantity: 1, penaltyAmount: 15000, description: '', createdAt: '2026-03-27T13:05:00', evidenceImageUrl: null },
];

export default function LossAndDamages() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalIncidents: 0, totalAmount: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
  // --- KẾT NỐI SIGNALR ---
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7100/damageHub") // Bật URL này khi Backend SS
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNewDamage", (newRecord) => {
      setData(prevList => [newRecord, ...prevList]);
      setStats(prev => ({
        totalIncidents: prev.totalIncidents + 1,
        totalAmount: prev.totalAmount + newRecord.penaltyAmount,
        totalQuantity: prev.totalQuantity + newRecord.quantity
      }));
      message.success(`Có báo cáo đền bù mới cho phòng ${newRecord.roomNumber}!`);
      setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
    });

    connection.start()
      .then(() => console.log("Đã kết nối Realtime với SignalR!"))
      .catch(err => console.error("Lỗi kết nối SignalR: ", err));

    return () => {
      connection.stop();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:7100/api/LossAndDamages");
      setData(response.data.data);
      setStats(response.data.stats);
      setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
      message.success('Đã làm mới dữ liệu từ hệ thống!');
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi kết nối API Backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Load lần đầu khi mở
  }, []);

  const handleEdit = (record) => {
    message.info(`Đang mở form chỉnh sửa cho vật tư: ${record.itemName}`);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa báo cáo đền bù này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        // Trong hệ thống thật, gọi API DELETE ở đây rồi mới cập nhật UI
        setData(prev => prev.filter(item => item.id !== id));
        fetchData(); // Gọi lại để lấy đúng Stats mới từ Backend
        message.success('Đã xóa thành công!');
      }
    });
  };

  // Thống kê (lấy từ backend API)
  const { totalIncidents, totalAmount, totalQuantity } = stats;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }} className="text-gray-600 text-sm">
        <span>{`${day}/${month}/${year}`}</span>
        <span className="text-gray-400">{`${hours}:${minutes}`}</span>
      </div>
    );
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
    { 
      title: 'Bằng chứng', 
      dataIndex: 'evidenceImageUrl', 
      key: 'evidence',
      width: 100,
      render: (img) => img ? <img src={img} alt="Bằng chứng" className="w-10 h-10 object-cover rounded" /> : <span className="text-gray-400 text-sm">Không ảnh</span>
    },
    { title: 'Số phòng', dataIndex: 'roomNumber', key: 'roomNumber', width: 100, className: 'font-medium' },
    { 
      title: 'Vật tư', 
      dataIndex: 'itemName', 
      key: 'itemName',
      render: (text) => <span className="text-blue-600 font-medium whitespace-normal break-words">{text}</span>
    },
    { title: 'SL Hỏng', dataIndex: 'quantity', key: 'quantity', width: 90, align: 'center' },
    { 
      title: 'Tiền phạt (VND)', 
      dataIndex: 'penaltyAmount', 
      key: 'penaltyAmount',
      width: 150,
      render: (amount) => <span className="text-red-500 font-semibold">{amount.toLocaleString('vi-VN')}đ</span>
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (text) => <span className="whitespace-normal break-words">{text}</span> },
    { 
      title: 'Ngày báo cáo', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      width: 150,
      render: (date) => formatDate(date)
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" onClick={() => handleEdit(record)} icon={<EditOutlined className="text-gray-500 hover:text-blue-500" />} />
          <Button type="text" onClick={() => handleDelete(record.id)} icon={<DeleteOutlined className="text-gray-500 hover:text-red-500" />} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 overflow-y-auto w-full max-w-screen-2xl mx-auto font-sans min-h-screen">
          {/* KHU VỰC THỐNG KÊ */}
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} lg={8}>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                <Text className="text-gray-500 text-sm block mb-2 font-medium">Tổng sự cố (Trang này)</Text>
                <div className="flex items-center text-yellow-600 text-2xl font-bold">
                  <WarningOutlined className="mr-3" />
                  {totalIncidents}
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
                <Text className="text-gray-500 text-sm block mb-2 font-medium">Tổng tiền đền bù</Text>
                <div className="flex items-center text-red-500 text-2xl font-bold">
                  <DollarOutlined className="mr-3" />
                  {totalAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center h-full">
                <div>
                  <Text className="text-gray-500 text-sm block mb-2 font-medium">Số lượng thất thoát</Text>
                  <div className="flex items-center text-blue-600 text-2xl font-bold">
                    <InboxOutlined className="mr-3" />
                    {totalQuantity} <span className="text-base font-normal text-gray-500 ml-2 mt-1">món</span>
                  </div>
                </div>
                <div className="text-right border-l pl-5 border-gray-200 flex flex-col justify-center">
                  <Text className="text-gray-500 text-sm block mb-2 font-medium">Lần cuối cập nhật</Text>
                  <div className="flex items-center justify-end text-gray-700 text-xl font-semibold">
                    <ClockCircleOutlined className="mr-2 text-gray-400 text-lg" />
                    {lastUpdated}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* BẢNG DỮ LIỆU */}
            <Col xs={24} lg={24}>
              <Card 
                title={<span className="font-semibold text-gray-700 text-base">▤ Quản lý Đền bù & Thất thoát</span>}
                bordered={false} 
                className="shadow-sm border border-gray-100 rounded-xl h-full"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <Space className="w-full sm:w-auto flex flex-wrap gap-2">
                    <RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} size="middle" className="rounded-md" />
                    <Button type="primary" icon={<SearchOutlined />} className="bg-blue-600 rounded-md">
                      Lọc dữ liệu
                    </Button>
                  </Space>
                  <Button onClick={fetchData} icon={<ReloadOutlined />} className="rounded-md hover:text-blue-600 hover:border-blue-600">
                    Làm mới
                  </Button>
                </div>

                <Table 
                  columns={columns} 
                  dataSource={data} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} bản ghi` }}
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                />
              </Card>
            </Col>
          </Row>
    </div>
  );
}