import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Table, Button, Input, Select,
  Space, Form, Upload, message, Tabs, Checkbox,
  Modal, InputNumber, Row, Col, Card, Steps
} from 'antd';
const { Step } = Steps;
import {
  AppstoreOutlined, PlusOutlined, UploadOutlined,
  CopyOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, TableOutlined, ToolOutlined, SettingOutlined
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
  const [isAmenitiesModalVisible, setIsAmenitiesModalVisible] = useState(false);
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentRoomInventory, setCurrentRoomInventory] = useState([]);
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // GỌI API KHI COMPONENT ĐƯỢC RENDER LẦN ĐẦU
  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchAmenities(); // Gọi thêm API lấy tiện ích
    fetchEquipments();
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

  const fetchRoomTypeAmenities = async (typeId) => {
    if (!typeId) return;
    try {
      // Thử endpoint chuẩn của project
      const response = await axiosClient.get(`/RoomTypes/${typeId}/amenities`);
      setRoomAmenities(response.data.data || []);
    } catch (error) {
       console.error("fetchRoomTypeAmenities error:", error);
    }
  };

  const fetchRoomInventory = async (roomId) => {
    try {
      const response = await axiosClient.get(`/rooms/${roomId}/inventories`);
      setCurrentRoomInventory(response.data.data || []);
    } catch (error) {
      console.error("fetchRoomInventory error:", error);
    }
  };

  const fetchEquipments = async () => {
    try {
      const res = await axiosClient.get('/Equipments');
      setEquipments(res.data.data || []);
    } catch (error) {
      console.error("fetchEquipments error:", error);
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
          <Space>
            <Button
              type="text"
              className="text-purple-600 hover:text-purple-800"
              icon={<AppstoreOutlined />}
              title="Xem tiện ích"
              onClick={() => {
                setSelectedRoom(record);
                fetchRoomTypeAmenities(record.roomTypeId);
                setIsAmenitiesModalVisible(true);
              }}
            />
            <Button
              type="text"
              className="text-orange-600 hover:text-orange-800"
              icon={<TableOutlined />}
              title="Quản lý vật tư"
              onClick={() => {
                setSelectedRoom(record);
                fetchRoomInventory(record.id);
                setIsInventoryModalVisible(true);
              }}
            />
            <Button
              type="text"
              className="text-blue-600 hover:text-blue-800"
              icon={<EditOutlined />}
              title="Sửa phòng"
              onClick={() => {
                setSelectedRoom(record);
                setCurrentView('edit');
              }}
            />
          </Space>
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
    const [equipments, setEquipments] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
    const [isAddSupplyModalVisible, setIsAddSupplyModalVisible] = useState(false);
    const [supplyForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const isEdit = currentView === 'edit';

    useEffect(() => {
      if (isEdit && selectedRoom) {
        form.setFieldsValue({
          roomNumber: selectedRoom.roomNumber,
          floor: selectedRoom.floor,
          typeId: selectedRoom.roomTypeId
        });
        
        // Find and set initial image from room type
        const type = roomTypes.find(t => t.id === selectedRoom.roomTypeId);
        setImageUrl(type?.imageUrl || "");
        
        // Load inventory for the room
        (async () => {
          try {
            const res = await axiosClient.get(`/rooms/${selectedRoom.id}/inventories`);
            const mappedInventories = (res.data.data || []).map((item, idx) => ({
              id: item.id || Date.now() + idx,
              equipmentId: item.equipmentId,
              name: item.itemName,
              unit: item.unit || 'Cái',
              quantity: item.quantity,
              penaltyPrice: item.priceIfLost
            }));
            setInventoryData(mappedInventories);
          } catch (e) {
            console.error("fetch inventories for edit error:", e);
          }
        })();
      }
    }, [isEdit, selectedRoom]);


    // Tính năng: Clone từ phòng mẫu gọi API Backend
    const handleCloneRoom = async (sampleRoomId) => {
      try {
        message.loading({ content: 'Đang tải dữ liệu phòng mẫu...', key: 'clone' });

        const response = await axiosClient.get(`/rooms/${sampleRoomId}/inventories`);

        const allAmenityNames = amenitiesList.map(a => a.name || a);
        form.setFieldsValue({ amenities: allAmenityNames });

        const mappedInventories = (response.data.data || []).map((item, idx) => ({
          id: item.id || Date.now() + idx,
          equipmentId: item.equipmentId,
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
        if (isEdit) {
          // Chỉ cập nhật hạng phòng (và các thông tin cho phép)
          await axiosClient.put(`/Rooms/${selectedRoom.id}`, {
            roomNumber: selectedRoom.roomNumber,
            floor: selectedRoom.floor,
            roomTypeId: values.typeId
          });
          message.success("Cập nhật hạng phòng thành công!");
        } else {
          // Tạo phòng mới và lưu inventory
          const submitData = {
            roomNumber: values.roomNumber,
            floor: values.floor,
            roomTypeId: values.typeId,
            status: 'AVAILABLE',
            cleaningStatus: 'CLEAN',
          };

          const res = await axiosClient.post('/Rooms', submitData);
          const newRoomId = res.data?.roomId || res.data?.data?.roomId;

          if (newRoomId && inventoryData.length > 0) {
            for (const item of inventoryData) {
              await axiosClient.post(`/rooms/${newRoomId}/inventories`, {
                equipmentId: item.equipmentId,
                quantity: item.quantity,
                condition: item.condition || "Tốt",
                isMinibar: item.name.toLowerCase().includes("minibar"),
                priceIfLost: item.penaltyPrice || 0
              });
            }
          }
          message.success("Tạo phòng mới thành công!");
        }

        setCurrentView('list');
        fetchRooms();
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Lỗi khi xử lý! Vui lòng kiểm tra lại.";
        message.error(errorMsg);
        console.error("onFinish error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const inventoryColumns = [
      { title: 'Mã VT', dataIndex: 'code' },
      { title: 'Tên vật tư', dataIndex: 'name' },
      { title: 'ĐVT', dataIndex: 'unit' },
      { 
        title: 'Số lượng', 
        dataIndex: 'quantity', 
        render: (val, record) => (
          <InputNumber 
            min={1} 
            value={val} 
            onChange={(newVal) => {
              setInventoryData(prev => prev.map(item => 
                item.id === record.id ? { ...item, quantity: newVal } : item
              ));
            }} 
          />
        ) 
      },
      { title: 'Giá đền bù (VNĐ)', dataIndex: 'penaltyPrice', render: (val) => val?.toLocaleString() + ' đ' },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={async () => {
              if (isEdit && record.id > 1000000000) { // New item not yet in DB
                setInventoryData(prev => prev.filter(item => item.id !== record.id));
              } else if (isEdit) {
                try {
                  await axiosClient.delete(`/rooms/${selectedRoom.id}/inventories/${record.id}`);
                  message.success(`Đã xóa ${record.name}`);
                  setInventoryData(prev => prev.filter(item => item.id !== record.id));
                } catch (e) {
                  message.error("Lỗi khi xóa vật tư.");
                }
              } else {
                setInventoryData(prev => prev.filter(item => item.id !== record.id));
              }
            }}
          />
        )
      }
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
              <Row gutter={24} align="middle">
                <Col span={12}>
                  {!isEdit && (
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
                  )}
                  {/* Hạng phòng Dropdown gọi từ API */}
                  <Form.Item name="typeId" label="Hạng phòng" rules={[{ required: true }]}>
                    <Select 
                      placeholder="Chọn hạng phòng"
                      onChange={(id) => {
                        const type = roomTypes.find(t => t.id === id);
                        setImageUrl(type?.imageUrl || "");
                      }}
                    >
                      {roomTypes.map(type => (
                        <Option key={type.id} value={type.id}>{type.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="border rounded bg-gray-50 flex items-center justify-center h-40 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Hạng phòng" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-gray-400 italic text-sm text-center">
                        <AppstoreOutlined className="text-2xl mb-1 block" />
                        Chưa chọn hạng phòng / <br/> Hạng phòng chưa có ảnh
                      </div>
                    )}
                  </div>
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
          <Form form={supplyForm} layout="vertical" onFinish={async (vals) => {
            const eq = equipments.find(e => e.id === vals.equipmentId);
            
            if (isEdit) {
              try {
                const res = await axiosClient.post(`/rooms/${selectedRoom.id}/inventories`, {
                  equipmentId: vals.equipmentId,
                  quantity: vals.quantity,
                  condition: vals.condition || "Tốt",
                  isMinibar: eq?.name.toLowerCase().includes("minibar"),
                  priceIfLost: vals.penaltyPrice || 0
                });
                
                const newItem = {
                  ...vals,
                  id: res.data.inventoryId || Date.now(),
                  name: eq?.name || 'Unknown',
                  code: eq?.id || 'N/A'
                };
                setInventoryData(prev => [...prev, newItem]);
                message.success(`Đã thêm ${eq?.name} vào phòng.`);
              } catch (e) {
                message.error(e.response?.data?.message || "Lỗi khi thêm vật tư vào phòng.");
                return;
              }
            } else {
              setInventoryData(prev => [...prev, { 
                ...vals, 
                name: eq?.name || 'Unknown', 
                id: Date.now(), 
                code: eq?.id || 'N/A' 
              }]);
            }
            
            setIsAddSupplyModalVisible(false);
            supplyForm.resetFields();
            setSelectedEquipment(null);
          }}>
            <Form.Item name="equipmentId" label="Tên vật tư (từ kho)" rules={[{ required: true, message: 'Vui lòng chọn vật tư từ kho' }]}>
              <Select
                showSearch
                allowClear
                placeholder="Tìm vật tư trong kho..."
                onChange={(id) => {
                  const eq = equipments.find(e => e.id === id);
                  setSelectedEquipment(eq);
                  if (eq) {
                    supplyForm.setFieldsValue({
                      unit: eq.unit,
                      penaltyPrice: eq.defaultPriceIfLost,
                      quantity: 1
                    });
                  }
                }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={equipments.map(e => ({
                  value: e.id,
                  label: `${e.name} (Tồn: ${e.inStockQuantity} ${e.unit})`,
                  disabled: e.inStockQuantity <= 0
                }))}
              />
            </Form.Item>
            <Form.Item name="unit" label="ĐVT" rules={[{ required: true }]}><Input disabled /></Form.Item>
            <Form.Item 
              name="quantity" 
              label={selectedEquipment ? `Số lượng (Tối đa: ${selectedEquipment.inStockQuantity})` : "Số lượng"} 
              rules={[
                { required: true },
                { 
                  validator: (_, value) => {
                    if (selectedEquipment && value > selectedEquipment.inStockQuantity) {
                      return Promise.reject(new Error(`${selectedEquipment.name} không đủ số lượng`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber min={1} max={selectedEquipment?.inStockQuantity} className="w-full" />
            </Form.Item>
            <Form.Item name="penaltyPrice" label="Giá đền bù mặc định (VNĐ)"><InputNumber min={0} className="w-full" /></Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentView === 'list' && renderRoomList()}
      {currentView !== 'list' && <RoomForm />}
      {/* Modal Xem Tiện ích */}
      <Modal
        title={selectedRoom ? `Tiện ích hạng phòng: ${selectedRoom.roomTypeName}` : "Tiện ích"}
        open={isAmenitiesModalVisible}
        onCancel={() => setIsAmenitiesModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsAmenitiesModalVisible(false)}>Đóng</Button>]}
      >
        <div className="grid grid-cols-2 gap-2">
          {roomAmenities.length > 0 ? roomAmenities.map(am => (
            <div key={am.id} className="p-2 bg-purple-50 rounded border border-purple-100 flex items-center">
              <PlusOutlined className="mr-2 text-purple-400 text-xs" /> {am.name}
            </div>
          )) : <p className="text-gray-500 italic">Hạng phòng chưa được thiết lập tiện ích.</p>}
        </div>
      </Modal>

      {/* Modal Quản lý Vật tư nhanh */}
      <Modal
        title={selectedRoom ? `Vật tư trong phòng: ${selectedRoom.roomNumber}` : "Vật tư"}
        open={isInventoryModalVisible}
        width={800}
        onCancel={() => setIsInventoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsInventoryModalVisible(false)}>Đóng</Button>
        ]}
      >
        <Table 
          dataSource={currentRoomInventory} 
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: 'Tên vật tư', dataIndex: 'itemName' },
            { 
              title: 'Số lượng', 
              dataIndex: 'quantity', 
              render: (val, record) => {
                const eq = equipments.find(e => e.id === record.equipmentId);
                const stock = eq ? (eq.inStockQuantity || 0) : 0;
                const maxAllowed = val + stock;

                return (
                  <InputNumber 
                    min={1} 
                    defaultValue={val} 
                    onChange={async (newVal) => {
                      if (newVal > maxAllowed) {
                        message.error(`${record.itemName} không đủ số lượng`);
                        return;
                      }
                      try {
                        await axiosClient.put(`/rooms/${selectedRoom.id}/inventories/${record.id}`, {
                          equipmentId: record.equipmentId,
                          quantity: newVal,
                          condition: record.status || "Tốt",
                          isMinibar: record.itemName.toLowerCase().includes("minibar"),
                          priceIfLost: record.priceIfLost
                        });
                        message.success(`Đã cập nhật ${record.itemName}`);
                        fetchRoomInventory(selectedRoom.id);
                        fetchEquipments(); // Refresh stock info
                      } catch (e) {
                        message.error(e.response?.data?.message || "Lỗi khi cập nhật số lượng.");
                      }
                    }} 
                  />
                );
              }
            },
            { 
              title: 'Tồn kho khả dụng', 
              key: 'stock',
              render: (_, record) => {
                const eq = equipments.find(e => e.id === record.equipmentId);
                const stock = eq ? (eq.inStockQuantity || 0) : 0;
                return <span className={stock > 0 ? "text-green-600" : "text-red-500"}>{stock} {record.unit}</span>;
              }
            },
            { title: 'ĐVT', dataIndex: 'unit' },
            { title: 'Giá đền bù', dataIndex: 'priceIfLost', render: (val) => val?.toLocaleString() + ' đ' },
          ]}
        />
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-xs">
          💡 Bạn có thể thay đổi số lượng trực tiếp trên bảng. Để thêm vật tư mới hoặc xóa, hãy sử dụng chức năng <b>Sửa phòng</b>.
        </div>
      </Modal>
    </div>
  );
}