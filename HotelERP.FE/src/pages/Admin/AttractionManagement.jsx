import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, message, Popconfirm, Image, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import attractionApi from '../../api/attractionApi';
import { useAuthStore } from '../../store/authStore';

const { TextArea } = Input;
const { Option } = Select;

export default function AttractionManagement() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const response = await attractionApi.getAll();
      setAttractions(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách địa điểm!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    setLoading(true);
    try {
      const response = await attractionApi.getById(record.id);
      const detail = response.data;
      setEditingId(detail.id);
      
      form.setFieldsValue({
        Name: detail.name,
        Type: detail.type,
        Description: detail.description,
        Latitude: detail.latitude,
        Longitude: detail.longitude,
        DistanceKm: detail.distanceKm,
        Status: detail.status || 'ACTIVE'
      });

      if (detail.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: detail.imageUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
      
      setIsModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết địa điểm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await attractionApi.delete(id);
      message.success('Xóa địa điểm thành công');
      fetchAttractions();
    } catch (error) {
      message.error('Lỗi khi xóa địa điểm');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const formData = new FormData();
      formData.append('Name', values.Name);
      if (values.Type) formData.append('Type', values.Type);
      if (values.Description) formData.append('Description', values.Description);
      formData.append('Latitude', values.Latitude || 0);
      formData.append('Longitude', values.Longitude || 0);
      if (values.DistanceKm) formData.append('DistanceKm', values.DistanceKm);
      if (values.Status) formData.append('Status', values.Status);
      
      // Handle file upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('ImageFile', fileList[0].originFileObj);
      }

      setLoading(true);
      if (editingId) {
        await attractionApi.update(editingId, formData);
        message.success('Cập nhật địa điểm thành công!');
      } else {
        await attractionApi.create(formData);
        message.success('Thêm địa điểm mới thành công!');
      }
      
      setIsModalVisible(false);
      fetchAttractions();
    } catch (error) {
      if (error.errorFields) return; // Validation error
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu địa điểm!';
      message.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) => text ? <Image src={text} alt="attraction" width={80} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <Tag color="default">Chưa có ảnh</Tag>,
    },
    {
      title: 'Tên địa điểm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại hình',
      dataIndex: 'type',
      key: 'type',
      render: (text) => text ? <Tag color="geekblue">{text}</Tag> : <Tag>Khác</Tag>,
    },
    {
      title: 'Tọa độ (Lat, Lng)',
      key: 'coordinates',
      render: (_, record) => <span>{record.latitude}, {record.longitude}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'ACTIVE' ? 'success' : 'default';
        return <Tag color={color}>{status || 'ACTIVE'}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa địa điểm này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#262b3f' }}>Quản lý Địa điểm (Attractions)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ background: '#3b82f6' }}>
          Thêm Địa điểm Mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={attractions} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa Địa điểm" : "Thêm Địa điểm Mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        width={700}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="Name"
            label="Tên địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập tên địa điểm!' }]}
          >
            <Input placeholder="Ví dụ: Khu du lịch Bửu Long" />
          </Form.Item>

          <Form.Item
            name="Type"
            label="Loại hình"
          >
            <Select placeholder="Chọn loại hình">
              <Option value="Di tích">Di tích</Option>
              <Option value="Ẩm thực">Ẩm thực</Option>
              <Option value="Giải trí">Giải trí</Option>
              <Option value="Thiên nhiên">Thiên nhiên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="Description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả ngắn về địa điểm..." />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="Latitude"
              label="Vĩ độ (Latitude)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Vui lòng nhập Vĩ độ!' }]}
            >
              <InputNumber style={{ width: '100%' }} step={0.000001} placeholder="Ví dụ: 10.948386" />
            </Form.Item>

            <Form.Item
              name="Longitude"
              label="Kinh độ (Longitude)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Vui lòng nhập Kinh độ!' }]}
            >
              <InputNumber style={{ width: '100%' }} step={0.000001} placeholder="Ví dụ: 106.790938" />
            </Form.Item>
          </div>

          <Form.Item
            label="Hình ảnh đại diện"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onUploadChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={1}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {editingId && (
            <Form.Item name="Status" label="Trạng thái">
              <Select>
                <Option value="ACTIVE">Hoạt động (ACTIVE)</Option>
                <Option value="INACTIVE">Ẩn (INACTIVE)</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
