import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Upload,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import roomTypeApi from '../../api/roomTypeApi';
import amenityApi from '../../api/amenityApi';
import './roomTypeManagement.css';


const { TextArea } = Input;

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.title ||
  fallbackMessage;

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [roomTypeKeyword, setRoomTypeKeyword] = useState('');
  const [amenityKeyword, setAmenityKeyword] = useState('');

  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);

  const [editingRoomType, setEditingRoomType] = useState(null);
  const [editingAmenity, setEditingAmenity] = useState(null);

  const [roomTypeForm] = Form.useForm();
  const [amenityForm] = Form.useForm();

  const [imageFileList, setImageFileList] = useState([]);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const [roomTypeData, amenityData] = await Promise.all([
        roomTypeApi.getAll(),
        amenityApi.getAll(),
      ]);

      setRoomTypes(roomTypeData || []);
      setAmenities(amenityData || []);
    } catch (error) {
      message.error(getErrorMessage(error, 'Không thể tải dữ liệu loại phòng và tiện ích.'));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoomTypes = useMemo(() => {
    const keyword = roomTypeKeyword.trim().toLowerCase();
    if (!keyword) return roomTypes;

    return roomTypes.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      return name.includes(keyword) || description.includes(keyword);
    });
  }, [roomTypes, roomTypeKeyword]);

  const filteredAmenities = useMemo(() => {
    const keyword = amenityKeyword.trim().toLowerCase();
    if (!keyword) return amenities;

    return amenities.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const iconUrl = item.iconUrl?.toLowerCase() || '';
      return name.includes(keyword) || iconUrl.includes(keyword);
    });
  }, [amenities, amenityKeyword]);

  const stats = useMemo(() => {
    const totalRoomTypes = roomTypes.length;
    const totalAmenities = amenities.length;
    const averagePrice =
      totalRoomTypes === 0
        ? 0
        : roomTypes.reduce((sum, item) => sum + Number(item.basePrice || 0), 0) / totalRoomTypes;
    const totalRoomTypesWithImage = roomTypes.filter((item) => !!item.imageUrl).length;

    return {
      totalRoomTypes,
      totalAmenities,
      averagePrice,
      totalRoomTypesWithImage,
    };
  }, [roomTypes, amenities]);

  const resetRoomTypeModal = () => {
    setEditingRoomType(null);
    setImageFileList([]);
    roomTypeForm.resetFields();
    roomTypeForm.setFieldsValue({
      capacityAdults: 1,
      capacityChildren: 0,
      amenityIds: [],
    });
  };

  const resetAmenityModal = () => {
    setEditingAmenity(null);
    amenityForm.resetFields();
  };

  const openCreateRoomTypeModal = () => {
    resetRoomTypeModal();
    setIsRoomTypeModalOpen(true);
  };

  const openEditRoomTypeModal = (record) => {
    setEditingRoomType(record);
    setImageFileList([]);
    roomTypeForm.setFieldsValue({
      name: record.name,
      basePrice: Number(record.basePrice || 0),
      capacityAdults: Number(record.capacityAdults || 0),
      capacityChildren: Number(record.capacityChildren || 0),
      description: record.description,
      amenityIds: (record.amenities || []).map((item) => item.id),
    });
    setIsRoomTypeModalOpen(true);
  };

  const openCreateAmenityModal = () => {
    resetAmenityModal();
    setIsAmenityModalOpen(true);
  };

  const openEditAmenityModal = (record) => {
    setEditingAmenity(record);
    amenityForm.setFieldsValue({
      name: record.name,
      icon: record.iconUrl,
    });
    setIsAmenityModalOpen(true);
  };

  const handleCloseRoomTypeModal = () => {
    setIsRoomTypeModalOpen(false);
    resetRoomTypeModal();
  };

  const handleCloseAmenityModal = () => {
    setIsAmenityModalOpen(false);
    resetAmenityModal();
  };

  const handleSubmitRoomType = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('description', values.description?.trim() || '');
      formData.append('basePrice', values.basePrice);
      formData.append('capacityAdults', values.capacityAdults);
      formData.append('capacityChildren', values.capacityChildren);

      if (imageFileList[0]?.originFileObj) {
        formData.append('image', imageFileList[0].originFileObj);
      }

      let roomTypeId = editingRoomType?.id;

      if (editingRoomType) {
        await roomTypeApi.update(editingRoomType.id, formData);
      } else {
        const response = await roomTypeApi.create(formData);
        roomTypeId = response?.roomTypeId;
      }

      await roomTypeApi.updateAmenities(roomTypeId, values.amenityIds || []);

      message.success(
        editingRoomType
          ? 'Cập nhật loại phòng thành công.'
          : 'Tạo loại phòng thành công.'
      );

      handleCloseRoomTypeModal();
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error, 'Lưu loại phòng thất bại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAmenity = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        icon: values.icon?.trim() || '',
      };

      if (editingAmenity) {
        await amenityApi.update(editingAmenity.id, payload);
        message.success('Cập nhật tiện ích thành công.');
      } else {
        await amenityApi.create(payload);
        message.success('Tạo tiện ích thành công.');
      }

      handleCloseAmenityModal();
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error, 'Lưu tiện ích thất bại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoomType = async (id) => {
    try {
      await roomTypeApi.remove(id);
      message.success('Đã xóa loại phòng.');
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error, 'Xóa loại phòng thất bại.'));
    }
  };

  const handleDeleteAmenity = async (id) => {
    try {
      await amenityApi.remove(id);
      message.success('Đã xóa tiện ích.');
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error, 'Xóa tiện ích thất bại.'));
    }
  };

  const roomTypeColumns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 110,
      render: (imageUrl) =>
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="room-type"
            width={88}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 12 }}
          />
        ) : (
          <div className="room-type-empty-image">Chưa có ảnh</div>
        ),
    },
    {
      title: 'Tên loại phòng',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (value) => <span style={{ fontWeight: 700 }}>{value}</span>,
    },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 160,
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Sức chứa',
      key: 'capacity',
      width: 160,
      render: (_, record) => (
        <div>
          <div>Người lớn: {record.capacityAdults}</div>
          <div>Trẻ em: {record.capacityChildren}</div>
        </div>
      ),
    },
    {
      title: 'Tiện ích',
      dataIndex: 'amenities',
      key: 'amenities',
      width: 260,
      render: (items) =>
        items?.length ? (
          <Space size={[0, 8]} wrap>
            {items.map((item) => (
              <Tag key={item.id} color="gold" className="room-type-amenity-tag">
                {item.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <span className="room-type-muted">Chưa gán tiện ích</span>
        ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value) => value || <span className="room-type-muted">Chưa có mô tả</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditRoomTypeModal(record)}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa loại phòng"
            description={`Bạn chắc chắn muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteRoomType(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const amenityColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tên tiện ích',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <span style={{ fontWeight: 700 }}>{value}</span>,
    },
    {
      title: 'Icon / Tên file icon',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      render: (value) =>
        value ? <Tag color="blue">{value}</Tag> : <span className="room-type-muted">Không có</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 170,
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditAmenityModal(record)}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa tiện ích"
            description={`Bạn chắc chắn muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteAmenity(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roomTypeTabContent = (
    <Card className="room-type-module-card">
      <div className="room-type-toolbar">
        <div className="room-type-toolbar__left">
          <Input
            value={roomTypeKeyword}
            onChange={(e) => setRoomTypeKeyword(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên loại phòng hoặc mô tả..."
            allowClear
            style={{ width: 320 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Tải lại
          </Button>
        </div>

        <div className="room-type-toolbar__right">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRoomTypeModal}>
            Thêm loại phòng
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={pageLoading}
        columns={roomTypeColumns}
        dataSource={filteredRoomTypes}
        bordered
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} loại phòng`,
        }}
      />
    </Card>
  );

  const amenityTabContent = (
    <Card className="room-type-module-card">
      <div className="room-type-toolbar">
        <div className="room-type-toolbar__left">
          <Input
            value={amenityKeyword}
            onChange={(e) => setAmenityKeyword(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên tiện ích hoặc icon..."
            allowClear
            style={{ width: 320 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Tải lại
          </Button>
        </div>

        <div className="room-type-toolbar__right">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAmenityModal}>
            Thêm tiện ích
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={pageLoading}
        columns={amenityColumns}
        dataSource={filteredAmenities}
        bordered
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} tiện ích`,
        }}
      />
    </Card>
  );

  return (
    <div className="room-type-page">
      <div className="room-type-hero">
        <div className="room-type-hero__eyebrow">Hotel ERP • Room Types & Amenities</div>
        <div className="room-type-hero__title">Quản lý Loại phòng & Tiện ích</div>
        <p className="room-type-hero__subtitle">
          Giao diện này được làm theo tinh thần của trang mẫu: nền xanh đậm, điểm nhấn vàng,
          card bo tròn và cảm giác “grand hotel”. Một sảnh lễ tân thu nhỏ nhưng dành cho dữ liệu.
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="room-type-stat-card">
            <Statistic title="Tổng loại phòng" value={stats.totalRoomTypes} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="room-type-stat-card">
            <Statistic title="Tổng tiện ích" value={stats.totalAmenities} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="room-type-stat-card">
            <Statistic title="Giá trung bình" value={formatCurrency(stats.averagePrice)} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="room-type-stat-card">
            <Statistic title="Loại phòng có ảnh" value={stats.totalRoomTypesWithImage} />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="room-types"
        items={[
          {
            key: 'room-types',
            label: (
              <span>
                <AppstoreOutlined /> Loại phòng
              </span>
            ),
            children: roomTypeTabContent,
          },
          {
            key: 'amenities',
            label: (
              <span>
                <AppstoreOutlined /> Tiện ích
              </span>
            ),
            children: amenityTabContent,
          },
        ]}
      />

      <Modal
        title={editingRoomType ? 'Cập nhật loại phòng' : 'Thêm loại phòng'}
        open={isRoomTypeModalOpen}
        onCancel={handleCloseRoomTypeModal}
        footer={null}
        destroyOnHidden
        width={860}
      >
        <Form form={roomTypeForm} layout="vertical" onFinish={handleSubmitRoomType}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên loại phòng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên loại phòng.' },
                  { min: 3, message: 'Tên loại phòng phải từ 3 ký tự.' },
                ]}
              >
                <Input placeholder="Ví dụ: Deluxe hướng biển" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="basePrice"
                label="Giá cơ bản"
                rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản.' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập giá cơ bản"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="capacityAdults"
                label="Sức chứa người lớn"
                rules={[{ required: true, message: 'Vui lòng nhập số người lớn.' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="capacityChildren"
                label="Sức chứa trẻ em"
                rules={[{ required: true, message: 'Vui lòng nhập số trẻ em.' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả loại phòng..." />
          </Form.Item>

          <Form.Item
            name="amenityIds"
            label="Gán tiện ích cho loại phòng"
            tooltip="Chức năng này dùng Select Multiple để đáp ứng yêu cầu Checkbox/Select Multiple trong PDF."
          >
            <Select
              mode="multiple"
              allowClear
              maxTagCount="responsive"
              placeholder="Chọn các tiện ích áp dụng cho loại phòng"
              options={amenities.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>

          <div className="room-type-section-label">Ảnh loại phòng</div>
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            fileList={imageFileList}
            onChange={({ fileList }) => setImageFileList(fileList.slice(-1))}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh từ máy</Button>
          </Upload>

          {editingRoomType?.imageUrl && imageFileList.length === 0 && (
            <div className="room-type-current-image">
              <div className="room-type-section-label">Ảnh hiện tại</div>
              <img
                src={editingRoomType.imageUrl}
                alt={editingRoomType.name}
                className="room-type-preview-image"
              />
            </div>
          )}

          <div className="room-type-modal-footer">
            <Button onClick={handleCloseRoomTypeModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingRoomType ? 'Lưu cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingAmenity ? 'Cập nhật tiện ích' : 'Thêm tiện ích'}
        open={isAmenityModalOpen}
        onCancel={handleCloseAmenityModal}
        footer={null}
        destroyOnHidden
      >
        <Form form={amenityForm} layout="vertical" onFinish={handleSubmitAmenity}>
          <Form.Item
            name="name"
            label="Tên tiện ích"
            rules={[
              { required: true, message: 'Vui lòng nhập tên tiện ích.' },
              { min: 2, message: 'Tên tiện ích phải từ 2 ký tự.' },
            ]}
          >
            <Input placeholder="Ví dụ: Wifi miễn phí" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon URL / tên file icon"
            tooltip="BE hiện lưu vào icon_url. Có thể nhập tên file như wifi.png hoặc URL."
          >
            <Input placeholder="Ví dụ: wifi.png hoặc https://..." />
          </Form.Item>

          <div className="room-type-modal-footer">
            <Button onClick={handleCloseAmenityModal}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingAmenity ? 'Lưu cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomTypeManagement;