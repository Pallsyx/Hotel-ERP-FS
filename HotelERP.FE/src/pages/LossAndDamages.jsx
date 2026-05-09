import React, { useState, useMemo, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import axiosClient from '../api/axiosClient';
import {
  Table, Button, DatePicker,
  Space, Card, Row, Col, Typography, message,
  Select, InputNumber, Form, Input, Modal, Image, Upload
} from 'antd';
import {
  AppstoreOutlined, SearchOutlined, ReloadOutlined,
  WarningOutlined, DollarOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, InboxOutlined, PlusOutlined, UploadOutlined
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
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

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedDates, setSelectedDates] = useState(null);
  const [appliedDates, setAppliedDates] = useState(null);

  // --- NEW STATE FOR CREATION ---
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomInventories, setRoomInventories] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [compensationType, setCompensationType] = useState('percentage'); // 'percentage', 'custom'
  const [editCompensationType, setEditCompensationType] = useState('percentage');
  const [isFixed100Pct, setIsFixed100Pct] = useState(false);
  const [isEditFixed100Pct, setIsEditFixed100Pct] = useState(false);
  const [createForm] = Form.useForm();
  // ------------------------------

  const handleApplyFilter = () => {
    setAppliedDates(selectedDates);
    message.success('Đã áp dụng bộ lọc ngày!');
  };

  // --- KẾT NỐI SIGNALR ---
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5080/damageHub") // Bật URL này khi Backend SS
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
      const response = await axiosClient.get("/LossAndDamages");
      setData(response.data.data);
      setStats(response.data.stats);
      setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
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

  // --- NEW HANDLERS FOR CREATION ---
  const handleOpenCreateModal = async () => {
    setIsCreateModalVisible(true);
    setLoading(true);
    try {
      const response = await axiosClient.get("/Rooms");
      setRooms(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phòng!");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomChange = async (roomId) => {
    setSelectedRoomId(roomId);
    createForm.setFieldsValue({ equipmentId: undefined });
    setRoomInventories([]);
    setSelectedInventory(null);
    try {
      const response = await axiosClient.get(`/rooms/${roomId}/inventories`);
      setRoomInventories(response.data.data || []);
    } catch (error) {
      message.error("Lỗi khi tải vật tư của phòng!");
    }
  };

  const handleInventoryChange = (inventoryId) => {
    const item = roomInventories.find(ri => ri.id === inventoryId);
    setSelectedInventory(item);

    // Nếu là đồ ăn, thức uống, minibar, hoặc sản phẩm giá trị nhỏ hơn 100k
    const isConsumable = item && (
      item.category === 'Đồ ăn' ||
      item.category === 'Đồ uống' ||
      item.category === 'Minibar' ||
      item.priceIfLost <= 50000
    );

    if (isConsumable) {
      setIsFixed100Pct(true);
      setCompensationType('percentage');
      createForm.setFieldsValue({ percentageValue: 100 });
    } else {
      setIsFixed100Pct(false);
      setCompensationType('percentage');
      createForm.setFieldsValue({ percentageValue: 100 });
    }
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const finalPenaltyAmount = calculatePenaltyAmount(values.quantity);

      const payload = {
        roomId: values.roomId,
        equipmentId: selectedInventory.equipmentId, // Lấy từ inventory đã chọn
        quantity: values.quantity,
        description: values.description,
        penaltyAmount: finalPenaltyAmount
      };

      await axiosClient.post("/LossAndDamages", payload);
      message.success('Đã báo cáo đền bù thành công!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setSelectedInventory(null);
      setCompensationType('percentage');
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi gửi báo cáo!');
    }
  };

  const calculatePenaltyAmount = (quantity) => {
    if (!selectedInventory) return 0;
    const basePrice = selectedInventory.priceIfLost * (quantity || 0);

    if (compensationType === 'percentage') {
      const pct = createForm.getFieldValue('percentageValue') || 0;
      return (basePrice * pct) / 100;
    }
    if (compensationType === 'custom') {
      return createForm.getFieldValue('customAmount') || 0;
    }
    return basePrice;
  };

  // Lắng nghe thay đổi để cập nhật preview tiền
  const qty = Form.useWatch('quantity', createForm);
  const pctVal = Form.useWatch('percentageValue', createForm);
  const customAmt = Form.useWatch('customAmount', createForm);
  const currentPenaltyPreview = useMemo(() => calculatePenaltyAmount(qty), [qty, pctVal, customAmt, selectedInventory, compensationType]);

  // --- LOGIC TÍNH TOÁN CHO MODAL SỬA ---
  const editQty = Form.useWatch('quantity', form);
  const editPctVal = Form.useWatch('editPercentageValue', form);

  useEffect(() => {
    if (isEditModalVisible && editingRecord) {
      const basePrice = editingRecord.priceIfLost || 0;
      const totalBase = basePrice * (editQty || 0);

      if (editCompensationType === 'percentage') {
        const finalAmt = (totalBase * (editPctVal || 0)) / 100;
        form.setFieldsValue({ penaltyAmount: finalAmt });
      }
    }
  }, [editQty, editPctVal, editCompensationType, isEditModalVisible, editingRecord]);
  // ------------------------------------
  // ---------------------------------

  const handleEdit = (record) => {
    setEditingRecord(record);
    setUploadFile(null);
    setPreviewUrl(record.evidenceImageUrl || null);

    // Tính toán xem có bị khóa cứng không dựa vào category và priceIfLost
    const isConsumable = record.category === 'Đồ ăn' ||
      record.category === 'Đồ uống' ||
      record.category === 'Minibar' ||
      (record.priceIfLost && record.priceIfLost <= 50000);
    setIsEditFixed100Pct(isConsumable);

    let pct = 100;
    if (record.priceIfLost && record.quantity && record.penaltyAmount > 0) {
      pct = Math.round((record.penaltyAmount / (record.priceIfLost * record.quantity)) * 100);
    } else if (record.penaltyAmount === 0) {
      pct = 0;
    }

    // Khóa cứng thì ép về 100%
    if (isConsumable) {
      pct = 100;
    }

    setEditCompensationType('percentage');

    form.setFieldsValue({
      quantity: record.quantity,
      description: record.description,
      penaltyAmount: record.penaltyAmount,
      editPercentageValue: pct
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteImage = () => {
    if (uploadFile) {
      setUploadFile(null);
      setPreviewUrl(editingRecord.evidenceImageUrl || null);
      message.success('Đã hủy ảnh chọn mới');
      return;
    }

    if (!editingRecord.evidenceImageUrl) return;

    Modal.confirm({
      title: 'Xác nhận xóa ảnh',
      content: 'Bạn có chắc chắn muốn xóa ảnh bằng chứng này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosClient.delete(`/LossAndDamages/${editingRecord.id}/image`);
          setPreviewUrl(null);
          setEditingRecord(prev => ({ ...prev, evidenceImageUrl: null }));
          message.success('Xóa ảnh thành công!');
          fetchData();
        } catch (error) {
          console.error(error);
          message.error('Lỗi khi xóa ảnh trên Server!');
        }
      }
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await axiosClient.put(`/LossAndDamages/${editingRecord.id}`, values);

      // Tiền hành upload ảnh nếu có file mới được chọn
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        await axiosClient.post(`/LossAndDamages/${editingRecord.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      message.success('Cập nhật thành công!');
      setIsEditModalVisible(false);
      setUploadFile(null);
      fetchData(); // Cập nhật lại Stats & Ảnh
    } catch (error) {
      if (error.isAxiosError) {
        message.error('Lỗi khi cập nhật trên Server!');
      } else {
        console.error(error);
      }
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa vĩnh viễn báo cáo đền bù này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosClient.delete(`/LossAndDamages/${id}`);
          setData(prev => prev.filter(item => item.id !== id));
          message.success('Đã xóa thành công!');
          fetchData(); // Cập nhật lại Stats
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          message.error('Không thể xóa dữ liệu từ Server!');
        }
      }
    });
  };

  // Thống kê & Filter
  const filteredData = useMemo(() => {
    if (!appliedDates || appliedDates.length !== 2) return data;
    const start = appliedDates[0].startOf('day').valueOf();
    const end = appliedDates[1].endOf('day').valueOf();

    return data.filter(item => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt).getTime();
      return itemDate >= start && itemDate <= end;
    });
  }, [data, appliedDates]);

  const displayStats = useMemo(() => {
    if (!appliedDates || appliedDates.length !== 2) return stats; // dùng stats gốc từ BE
    return {
      totalIncidents: filteredData.length,
      totalAmount: filteredData.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0),
      totalQuantity: filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0)
    };
  }, [filteredData, stats, appliedDates]);

  const { totalIncidents, totalAmount, totalQuantity } = displayStats;

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
      render: (img) => img ? (
        <Image
          width={60}
          height={60}
          src={img}
          style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #d9d9d9' }}
          preview={{ mask: 'Xem' }}
          alt="Bằng chứng"
        />
      ) : <span className="text-gray-400 text-sm">Không ảnh</span>
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
                <RangePicker
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                  size="middle"
                  className="rounded-md"
                  value={selectedDates}
                  onChange={(dates) => setSelectedDates(dates)}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  className="bg-blue-600 rounded-md"
                  onClick={handleApplyFilter}
                >
                  Lọc dữ liệu
                </Button>
              </Space>
              <Button onClick={() => {
                setSelectedDates(null);
                setAppliedDates(null);
                fetchData();
              }} icon={<ReloadOutlined />} className="rounded-md hover:text-blue-600 hover:border-blue-600">
                Làm mới
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} bản ghi` }}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chỉnh sửa Chi tiết Đền bù"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="quantity"
            label="Số lượng hỏng (*)"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="penaltyAmount"
            label="Tiền phạt (VND) (Tùy chỉnh)"
            help="Cứ để trống hệ thống sẽ tự tính lại nếu bạn đổi Số lượng"
          >
            <InputNumber min={0} step={1000} className="w-full" placeholder="Ví dụ: 50000" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả / Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Nguyên nhân, tình trạng..." />
          </Form.Item>

          <Form.Item label="Đổi ảnh bằng chứng">
            <Upload
              name="file"
              showUploadList={false}
              beforeUpload={(file) => {
                setUploadFile(file);
                // Tạo preview URL
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target.result);
                reader.readAsDataURL(file);
                return false; // Ngăn chặn upload tự động
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
            </Upload>
            {previewUrl && (
              <div className="mt-3 p-3 bg-gray-50 border rounded text-center" style={{ position: 'relative' }}>
                <Text type="secondary" className="block mb-2 text-xs">Ảnh hiển tại</Text>
                <Image width={80} height={80} src={previewUrl} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={handleDeleteImage}
                  title="Xóa ảnh"
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}