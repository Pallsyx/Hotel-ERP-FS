import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Table, Button, DatePicker,
  Space, Card, Row, Col, Typography, message, Image
} from 'antd';
import {
  AppstoreOutlined, SearchOutlined, ReloadOutlined,
  WarningOutlined, DollarOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, InboxOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

// Đường dẫn API (Bạn cần điều chỉnh lại cho khớp với BE)
const API_URL = 'http://localhost:5080/api/LossAndDamages';

// Dữ liệu giả lập ban đầu để hiển thị giao diện giống 100% ảnh chụp
const INITIAL_DATA = [
  { id: 38, roomNumber: '102', itemName: 'Nước ngọt Coca Cola 320ml', quantity: 1, penaltyAmount: 20000, description: '', createdAt: '2026-03-28T04:14:00', evidenceImageUrl: null },
  { id: 35, roomNumber: '102', itemName: 'Ấm đun nước siêu tốc Sunhouse', quantity: 1, penaltyAmount: 350000, description: '', createdAt: '2026-03-28T03:04:00', evidenceImageUrl: null },
  { id: 34, roomNumber: '102', itemName: 'Bánh Oreo 133g', quantity: 1, penaltyAmount: 30000, description: 'khách dùng', createdAt: '2026-03-28T01:28:00', evidenceImageUrl: null },
  { id: 26, roomNumber: '103', itemName: 'Bánh Oreo 133g', quantity: 1, penaltyAmount: 30000, description: '', createdAt: '2026-03-27T15:18:00', evidenceImageUrl: null },
  { id: 25, roomNumber: '103', itemName: 'Nước ngọt Coca Cola 320ml', quantity: 2, penaltyAmount: 20000, description: '', createdAt: '2026-03-27T15:16:00', evidenceImageUrl: null },
  { id: 24, roomNumber: '103', itemName: 'Nước suối Lavie 500ml', quantity: 1, penaltyAmount: 15000, description: '', createdAt: '2026-03-27T13:05:00', evidenceImageUrl: null },
];

export default function LossAndDamage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('vi-VN', { hour12: false }));

  // Hàm lấy dữ liệu thực tế từ BE
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else if (Array.isArray(response.data)) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      message.error("Không kết nối được server để lấy dữ liệu. Đang hiển thị dữ liệu cũ.");
    } finally {
      setLoading(false);
    }
  };

  // --- DÁN HÀM XỬ LÝ XÓA VÀO ĐÂY ---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      // 1. Gọi API xóa thực tế xuống Backend (Đúng địa chỉ https://localhost:7100/api/LossAndDamages/id)
      await axios.delete(`${API_URL}/${id}`);
      
      // 2. Nếu BE báo xóa OK, cập nhật lại giao diện ngay lập tức
      setData(prevData => prevData.filter(item => item.id !== id));
      
      message.success(`Đã xóa sạch dữ liệu và hình ảnh của ID: ${id}`);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      message.error("Không thể xóa dữ liệu từ Server. Vui lòng kiểm tra lại Backend!");
    } finally {
      setLoading(false);
    }
  };
  // --------------------------------

  useEffect(() => {
    fetchData();
  }, []);

  // Tính toán các chỉ số thống kê
  const totalIncidents = data.length;
  const totalAmount = data.reduce((sum, item) => sum + (item.penaltyAmount * item.quantity), 0); // Giả sử tính tổng = giá x số lượng, hoặc chỉ cộng giá tuỳ logic BE
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

  // Định dạng ngày giờ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return (
      <div className="flex flex-col text-gray-600 text-sm">
        <span>{`${day}/${month}/${year}`}</span>
        <span className="text-gray-400">{`${hours}:${minutes}`}</span>
      </div>
    );
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
    {
      title: 'Bằng chứng',
      dataIndex: 'evidenceImageUrl',
      key: 'evidence',
      width: 100, // Cố định luôn cái cột
      align: 'center',
      render: (img) => img ? (
        <Image 
          width={60}
          height={60}
          src={img}
          style={{ 
            objectFit: 'cover', 
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}
          preview={{ mask: 'Xem' }}
          alt="Bằng chứng"
        />
      ) : (
        <Text type="secondary" italic className="text-sm">Không ảnh</Text>
      )
    },
    
    { title: 'Số phòng', dataIndex: 'roomNumber', key: 'roomNumber', className: 'font-medium' },
    {
      title: 'Vật tư',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <span className="text-blue-600 font-medium">{text}</span>
    },
    { title: 'SL Hỏng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    {
      title: 'Tiền phạt (VND)',
      dataIndex: 'penaltyAmount',
      key: 'penaltyAmount',
      render: (amount) => <span className="text-red-500 font-semibold">{amount.toLocaleString('vi-VN')}đ</span>
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              // Khi bấm nút, nó sẽ chạy cái hàm handleDelete bạn vừa dán ở trên
              if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn sự cố ID: ${record.id}?`)) {
                handleDelete(record.id);
              }
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gray-100 font-sans">
      <Sider width={250} theme="light" className="border-r">
        <div className="h-16 flex items-center justify-center border-b font-bold text-blue-600 text-lg">
          HOTEL ERP
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['4']}
          className="mt-4"
          items={[
            { key: '1', icon: <AppstoreOutlined />, label: 'Dashboard' },
            { key: '2', icon: <AppstoreOutlined />, label: 'Quản lý Phòng' },
            { key: '3', icon: <AppstoreOutlined />, label: 'Kho vật tư' },
            { key: '4', icon: <AppstoreOutlined />, label: 'Thất thoát & Đền bù' },
            { key: '5', icon: <AppstoreOutlined />, label: 'Dọn phòng' },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white border-b px-4 flex justify-between items-center">
          <span className="font-semibold text-lg text-gray-700">Admin Panel</span>
          <span className="text-gray-500">Xin chào, Admin</span>
        </Header>

        <Content className="p-6">
          <Row gutter={24} className="mb-6">
            <Col span={8}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <Text className="text-gray-500 text-sm block mb-1">Tổng sự cố (Trang này)</Text>
                <div className="flex items-center text-red-500 text-2xl font-semibold">
                  <WarningOutlined className="mr-2" />
                  {totalIncidents}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <Text className="text-gray-500 text-sm block mb-1">Tổng tiền đền bù</Text>
                <div className="flex items-center text-red-500 text-2xl font-semibold">
                  <DollarOutlined className="mr-2" />
                  {totalAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between">
                <div>
                  <Text className="text-gray-500 text-sm block mb-1">Số lượng thất thoát</Text>
                  <div className="flex items-center text-blue-600 text-2xl font-semibold">
                    <InboxOutlined className="mr-2" />
                    {totalQuantity} <span className="text-sm font-normal text-gray-500 ml-1 mt-2">món</span>
                  </div>
                </div>
                <div className="text-right border-l pl-4 border-gray-200">
                  <Text className="text-gray-500 text-sm block mb-1">Lần cuối cập nhật</Text>
                  <div className="flex items-center justify-end text-gray-700 text-xl font-medium">
                    <ClockCircleOutlined className="mr-2 text-gray-400" />
                    {lastUpdated}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Card bordered={false} className="shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <Space className="w-full flex">
                <Text className="font-medium mr-2">Từ ngày — Đến ngày</Text>
                <RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
                <Button type="primary" icon={<SearchOutlined />} className="bg-blue-600">
                  Lọc dữ liệu
                </Button>
              </Space>
              <Button onClick={fetchData} icon={<ReloadOutlined />}>
                Làm mới
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `Tổng cộng ${total} bản ghi` }}
              className="border border-gray-100 rounded-md"
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}