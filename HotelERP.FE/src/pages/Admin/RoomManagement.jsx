import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Table, Button, Input, Select,
  Space, Form, Upload, message, Tabs, Checkbox,
  Modal, InputNumber, Row, Col, Card, Steps
} from 'antd';
const { Step } = Steps;
import {
  AppstoreOutlined, PlusOutlined, UploadOutlined,
  CopyOutlined, SearchOutlined, EditOutlined
} from '@ant-design/icons';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = 'https://localhost:7100/api';

// --- COMPONENT CHÍNH ---
export default function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'

  // STATE LƯU DỮ LIỆU TỪ API
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]); // State mới lưu tiện ích từ API
  const [loading, setLoading] = useState(false);
  const [filterFloor, setFilterFloor] = useState(null);

  // GỌI API KHI COMPONENT ĐƯỢC RENDER LẦN ĐẦU
  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchAmenities(); // Gọi thêm API lấy tiện ích
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/Rooms');
      setRooms(response.data.data ? response.data.data : response.data);
    } catch (error) {
      message.error("Lỗi mạng: Không thể kết nối đến Backend hoặc chưa có dữ liệu!");
      console.error("fetchRooms error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await axiosClient.get('/RoomTypes');
      setRoomTypes(response.data.data ? response.data.data : response.data);
    } catch (error) {
      message.warning("Lỗi mạng: Không thể tải hạng phòng từ Backend.");
      console.error("fetchRoomTypes error:", error);
    }
  };

  const fetchAmenities = async () => {
    try {
      // Backend cần có API GET /api/Amenities trả về list { id, name }
      const response = await axiosClient.get('/Amenities');
      setAmenitiesList(response.data.data ? response.data.data : response.data);
    } catch (error) {
      message.warning("Lỗi mạng: Không thể tải danh sách tiện ích từ Backend.");
      console.error("fetchAmenities error:", error);
    }
  };

  // MÀN HÌNH 1: DANH SÁCH PHÒNG
  const renderRoomList = () => {
    // Logic Đổi trạng thái nhanh gọi API
    const handleStatusChange = async (roomId, field, newStatus) => {
      try {
        if (field === 'status') {
          await axiosClient.patch(`/Rooms/${roomId}/status`, { newStatus });
        } else {
          await axiosClient.patch(`/Rooms/${roomId}/cleaning-status`, { newCleaningStatus: newStatus });
        }
        // Cập nhật State cục bộ để UI phản hồi ngay lập tức
        setRooms(prevRooms => prevRooms.map(r => r.id === roomId ? { ...r, [field]: newStatus } : r));
        message.success(`Đã cập nhật trạng thái thành công!`);
      } catch (error) {
        message.error("Lỗi kết nối Backend. Không thể cập nhật!");
        console.error("handleStatusChange error:", error);
      }
    };

    // Mapping trạng thái từ tiếng Anh (Backend) sang tiếng Việt (UI)
    const statusLabels = {
      'AVAILABLE': 'Sẵn sàng', 'Available': 'Sẵn sàng',
      'OCCUPIED': 'Đang có khách', 'Occupied': 'Đang có khách',
      'MAINTENANCE': 'Bảo trì', 'Maintenance': 'Bảo trì',
      'OUT_OF_ORDER': 'Ngừng hoạt động',
    };
    const cleaningLabels = {
      'CLEAN': 'Đã dọn', 'Clean': 'Đã dọn',
      'DIRTY': 'Chưa dọn', 'Dirty': 'Chưa dọn',
      'INSPECTING': 'Đang kiểm tra', 'Inspecting': 'Đang kiểm tra',
    };
    const statusColor = (val) => {
      const upper = (val || '').toUpperCase();
      if (upper === 'AVAILABLE') return 'text-green-600';
      if (upper === 'OCCUPIED') return 'text-blue-600';
      return 'text-red-600';
    };
    const cleaningColor = (val) => {
      const upper = (val || '').toUpperCase();
      if (upper === 'CLEAN') return 'text-green-600';
      if (upper === 'INSPECTING') return 'text-purple-600';
      return 'text-orange-500';
    };

    const columns = [
      { title: 'Số phòng', dataIndex: 'roomNumber', key: 'roomNumber' },
      { title: 'Tầng', dataIndex: 'floor', key: 'floor' },
      {
        title: 'Hạng phòng',
        key: 'roomTypeName',
        dataIndex: 'roomTypeName',
      },
      {
        title: 'Kinh doanh',
        key: 'status',
        render: (_, record) => (
          <Select
            value={statusLabels[record.status] || record.status}
            onChange={(val) => handleStatusChange(record.id, 'status', val)}
            style={{ width: 160 }}
            variant="borderless"
            className={`font-semibold ${statusColor(record.status)}`}
          >
            <Option value="AVAILABLE"><span className="text-green-600">Sẵn sàng</span></Option>
            <Option value="OCCUPIED"><span className="text-blue-600">Đang có khách</span></Option>
            <Option value="MAINTENANCE"><span className="text-red-600">Bảo trì</span></Option>
          </Select>
        )
      },
      {
        title: 'Trạng thái phòng',
        key: 'cleaningStatus',
        render: (_, record) => (
          <Select
            value={cleaningLabels[record.cleaningStatus] || record.cleaningStatus}
            onChange={(val) => handleStatusChange(record.id, 'cleaningStatus', val)}
            style={{ width: 160 }}
            variant="borderless"
            className={`font-semibold ${cleaningColor(record.cleaningStatus)}`}
          >
            <Option value="CLEAN"><span className="text-green-600">Đã dọn</span></Option>
            <Option value="DIRTY"><span className="text-orange-500">Chưa dọn</span></Option>
            <Option value="INSPECTING"><span className="text-purple-600">Đang kiểm tra</span></Option>
          </Select>
        )
      },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
          <Button
            type="text"
            className="text-blue-600 hover:text-blue-800"
            icon={<EditOutlined />}
            onClick={() => setCurrentView('edit')}
          />
        )
      }
    ];

    const filteredRooms = filterFloor ? rooms.filter(r => r.floor === filterFloor) : rooms;

    return (
      <Card title="Quản lý Quỹ phòng" variant="borderless" className="m-4">
        <div className="flex justify-between mb-4">
          <Space>
            {/* Lọc theo tầng */}
            <Select
              allowClear
              placeholder="Chọn Tầng"
              style={{ width: 120 }}
              onChange={setFilterFloor}
            >
              <Option value={1}>Tầng 1</Option>
              <Option value={2}>Tầng 2</Option>
              <Option value={3}>Tầng 3</Option>
            </Select>
            <Button icon={<SearchOutlined />}>Lọc dữ liệu</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCurrentView('create')}>
            Thêm phòng mới
          </Button>
        </div>
        <Table loading={loading} dataSource={filteredRooms} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>
    );
  };

  // MÀN HÌNH 2: FORM THÊM/SỬA PHÒNG
  const RoomForm = () => {
    const [form] = Form.useForm();
    const [inventoryData, setInventoryData] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
    const [isAddSupplyModalVisible, setIsAddSupplyModalVisible] = useState(false);
    const [supplyForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Tính năng: Clone từ phòng mẫu gọi API Backend
    const handleCloneRoom = async (sampleRoomId) => {
      try {
        message.loading({ content: 'Đang tải dữ liệu phòng mẫu...', key: 'clone' });

        const response = await axiosClient.get(`/rooms/${sampleRoomId}/inventories`);

        const allAmenityNames = amenitiesList.map(a => a.name || a);
        form.setFieldsValue({ amenities: allAmenityNames });

        const mappedInventories = (response.data.data || []).map((item, idx) => ({
          id: item.id || Date.now() + idx,
          code: item.code || 'SYS',
          name: item.itemName,
          unit: item.unit || 'Cái',
          quantity: item.quantity,
          penaltyPrice: item.priceIfLost
        }));
        setInventoryData(mappedInventories);

        message.success({ content: `Đã sao chép tiện ích và vật tư từ phòng mẫu`, key: 'clone' });
      } catch (error) {
        message.error({ content: `Lỗi kết nối! Không thể lấy dữ liệu vật tư mẫu từ API.`, key: 'clone' });
        console.error("handleCloneRoom error:", error);
      } finally {
        setIsCloneModalVisible(false);
      }
    };

    // Tính năng: Upload ảnh trực tiếp lên Cloudinary bằng Axios
    const customUpload = async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append('file', file);

      // LƯU Ý: Cập nhật "upload_preset" và "Cloud Name" thật của dự án
      formData.append('upload_preset', 'YOUR_UNSIGNED_PRESET');
      const cloudinaryName = 'YOUR_CLOUD_NAME';

      message.loading({ content: 'Đang tải ảnh lên Cloudinary...', key: 'upload' });
      try {
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`, formData);
        setImageUrl(res.data.secure_url);
        form.setFieldsValue({ imageUrl: res.data.secure_url });
        message.success({ content: 'Tải ảnh thành công!', key: 'upload' });
        onSuccess("ok");
      } catch (err) {
        message.error({ content: 'Lỗi tải ảnh lên Cloudinary!', key: 'upload' });
        onError(err);
      }
    };

    const onFinish = async (values) => {
      setSubmitting(true);
      try {
        const submitData = {
          roomNumber: values.roomNumber,
          roomTypeId: values.typeId,
          status: 'AVAILABLE',
          cleaningStatus: 'CLEAN',
        };

        const res = await axiosClient.post('/Rooms', submitData);
        const newRoomId = res.data?.roomId || res.data?.data?.roomId;

        // Lưu inventoryData xuống API RoomInventories
        if (newRoomId && inventoryData.length > 0) {
          for (const item of inventoryData) {
            await axiosClient.post(`/rooms/${newRoomId}/inventories`, {
              ItemName: item.name,
              Quantity: item.quantity,
              Condition: "NEW",
              IsMinibar: false,
              PriceIfLost: item.penaltyPrice || 0
            });
          }
        }

        message.success("Lưu phòng và cập nhật vật tư thành công!");
        setCurrentView('list');
        fetchRooms();
      } catch (error) {
        message.error("Lỗi khi lưu phòng! Vui lòng kiểm tra lại kết nối Backend.");
        console.error("onFinish error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const inventoryColumns = [
      { title: 'Mã VT', dataIndex: 'code' },
      { title: 'Tên vật tư', dataIndex: 'name' },
      { title: 'ĐVT', dataIndex: 'unit' },
      { title: 'Số lượng', dataIndex: 'quantity', render: (val) => <InputNumber min={1} defaultValue={val} /> },
      { title: 'Giá đền bù (VNĐ)', dataIndex: 'penaltyPrice', render: (val) => val?.toLocaleString() + ' đ' },
    ];

    return (
      <div className="m-4">
        <Button type="link" onClick={() => setCurrentView('list')} className="mb-2">
          &larr; Quay lại danh sách
        </Button>
        <Card title="Quy trình thiết lập phòng" variant="borderless">
          <Form form={form} layout="vertical" onFinish={onFinish}>

            {/* 3 Tabs */}
            <Steps current={currentStep} className="mb-8">
              <Step title="Thông tin chính" />
              <Step title="Vật tư & Minibar" />
            </Steps>

            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true }]}>
                        <Input placeholder="VD: 101" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="floor" label="Tầng" rules={[{ required: true }]}>
                        <InputNumber className="w-full" placeholder="VD: 1" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* Hạng phòng Dropdown gọi từ API */}
                  <Form.Item name="typeId" label="Hạng phòng" rules={[{ required: true }]}>
                    <Select placeholder="Chọn hạng phòng">
                      {roomTypes.map(type => (
                        <Option key={type.id} value={type.id}>{type.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Hình ảnh hạng phòng" name="imageUrl">
                    <Upload
                      customRequest={customUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center h-48">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Room" className="h-full object-contain" />
                        ) : (
                          <div>
                            <UploadOutlined className="text-2xl text-blue-500 mb-2" />
                            <div className="text-gray-500">Click để chọn ảnh từ máy</div>
                          </div>
                        )}
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>



            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <div className="mb-4 space-x-2">
                <Button type="primary" ghost onClick={() => setIsAddSupplyModalVisible(true)}>+ Thêm vật tư</Button>
                <Button icon={<CopyOutlined />} onClick={() => setIsCloneModalVisible(true)}>
                  Clone từ phòng mẫu
                </Button>
              </div>
              <Table dataSource={inventoryData} columns={inventoryColumns} rowKey="id" pagination={false} />
            </div>

            <div className="mt-6 border-t pt-4 flex space-x-4">
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(c => c - 1)}>Quay lại</Button>
              )}
              {currentStep === 0 && (
                <Button type="primary" onClick={async () => {
                  await form.validateFields(['roomNumber', 'floor', 'typeId']);
                  setCurrentStep(1);
                }}>Tiếp tục</Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" htmlType="submit" loading={submitting}>Lưu & Tạo phòng</Button>
              )}
            </div>
          </Form>
        </Card>

        {/* Modal chọn phòng mẫu để sao chép */}
        <Modal
          title="Sao chép từ phòng mẫu"
          open={isCloneModalVisible}
          onCancel={() => setIsCloneModalVisible(false)}
          footer={null}
        >
          <p className="mb-4 text-gray-600">
            Tính năng này sẽ tự động điền <b>Tiện ích mặc định</b> và toàn bộ <b>Vật tư/Minibar</b> từ phòng mẫu bạn chọn.
          </p>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {rooms.length > 0 ? rooms.map(room => (
              <li key={room.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                <span>Phòng mẫu: <b>{room.roomNumber}</b></span>
                <Button size="small" type="primary" onClick={() => handleCloneRoom(room.id)}>Sao chép</Button>
              </li>
            )) : <p className="text-gray-500 italic">Chưa có dữ liệu phòng nào để sao chép.</p>}
          </ul>
        </Modal>

        {/* Modal Thêm Vật tư */}
        <Modal
          title="Thêm Vật tư/Minibar"
          open={isAddSupplyModalVisible}
          onCancel={() => setIsAddSupplyModalVisible(false)}
          onOk={() => supplyForm.submit()}
        >
          <Form form={supplyForm} layout="vertical" onFinish={(vals) => {
            const actualName = Array.isArray(vals.name) ? vals.name[0] : vals.name;
            setInventoryData(prev => [...prev, { ...vals, name: actualName, id: Date.now(), code: vals.code || 'MNB' }]);
            setIsAddSupplyModalVisible(false);
            supplyForm.resetFields();
          }}>
            <Form.Item name="name" label="Tên vật tư" rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập tên vật tư' }]}>
              <Select
                mode="tags"
                maxTagCount={1}
                showSearch
                allowClear
                placeholder="Chọn vật tư có sẵn hoặc gõ tên mới..."
                options={[
                  { value: 'Tivi', label: 'Tivi' },
                  { value: 'Tủ Lạnh', label: 'Tủ Lạnh' },
                  { value: 'Điều hòa', label: 'Điều hòa' },
                  { value: 'Giường', label: 'Giường' },
                  { value: 'Tủ quần áo', label: 'Tủ quần áo' },
                  { value: 'Két sắt', label: 'Két sắt' },
                  { value: 'Bàn làm việc', label: 'Bàn làm việc' },
                  { value: 'Máy sấy tóc', label: 'Máy sấy tóc' },
                  { value: 'Bình đun siêu tốc', label: 'Bình đun siêu tốc' },
                  { value: 'Mắc áo', label: 'Mắc áo' },
                  { value: 'Dép đi trong nhà', label: 'Dép đi trong nhà' },
                  { value: 'Khăn tắm', label: 'Khăn tắm' },
                  { value: 'Khăn mặt', label: 'Khăn mặt' },
                  { value: 'Áo choàng tắm', label: 'Áo choàng tắm' },
                  { value: 'Bàn chải đánh răng', label: 'Bàn chải đánh răng' },
                  { value: 'Sữa tắm', label: 'Sữa tắm' },
                  { value: 'Dầu gội', label: 'Dầu gội' },
                  { value: 'Nước suối (Minibar)', label: 'Nước suối (Minibar)' },
                  { value: 'Bia (Minibar)', label: 'Bia (Minibar)' },
                  { value: 'Nước ngọt (Minibar)', label: 'Nước ngọt (Minibar)' },
                  { value: 'Snack (Minibar)', label: 'Snack (Minibar)' }
                ]}
              />
            </Form.Item>
            <Form.Item name="unit" label="ĐVT (VD: Cái, Chai)" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}><InputNumber min={1} className="w-full" /></Form.Item>
            <Form.Item name="penaltyPrice" label="Giá đền bù (VNĐ)"><InputNumber min={0} className="w-full" /></Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentView === 'list' && renderRoomList()}
      {currentView !== 'list' && <RoomForm />}
    </div>
  );
}