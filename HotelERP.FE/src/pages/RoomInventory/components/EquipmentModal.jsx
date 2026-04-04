import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { equipmentApi } from '../../../api/equipmentApi';
import axios from 'axios';

const EquipmentModal = ({ open, onCancel, editingItem, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingItem && open) {
      form.setFieldsValue({
        itemCode: editingItem.itemCode,
        name: editingItem.name,
        category: editingItem.category,
        unit: editingItem.unit,
        totalQuantity: editingItem.totalQuantity,
        basePrice: editingItem.basePrice || 0,
        defaultPriceIfLost: editingItem.defaultPriceIfLost || 0,
      });
      setImageUrl(editingItem.imageUrl || '');
    } else {
      form.resetFields();
      setImageUrl('');
    }
  }, [editingItem, open, form]);

  const handleUpload = async (info) => {
    const file = info.file;
    if (!file) return;
    
    // Simulate upload or setup your cloudinary/imgur handling
    // For this demo context, we can just use a fake URL or base64
    const reader = new FileReader();
    setUploading(true);
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      setUploading(false);
      message.success('Tải ảnh thành công!');
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto POST
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        imageUrl: imageUrl,
      };

      if (editingItem) {
        await equipmentApi.updateEquipment(editingItem.id, payload);
        message.success('Cập nhật vật tư thành công!');
      } else {
        await equipmentApi.createEquipment(payload);
      }

      onSuccess();
      onCancel();
    } catch (error) {
      if (error.errorFields) return;
      const apiMsg = error?.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingItem ? 'Sửa thông tin vật tư' : 'Thêm vật tư mới'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item label="Ảnh vật tư">
          <Upload
            beforeUpload={() => false}
            showUploadList={false}
            onChange={handleUpload}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh</Button>
          </Upload>
          {imageUrl && (
            <div style={{ marginTop: 10 }}>
              <img src={imageUrl} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              <Button type="link" danger onClick={() => setImageUrl('')}>Xóa ảnh</Button>
            </div>
          )}
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="itemCode"
            label="Mã vật tư"
            rules={[{ required: true, message: 'Nhập mã vật tư!' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="VD: HH001" disabled={!!editingItem} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: 'Nhập tên vật tư!' }]}
            style={{ flex: 2 }}
          >
            <Input placeholder="Tên thiết bị / đồ dùng" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Chọn danh mục!' }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Chọn danh mục"
              options={[
                { value: 'Trang thiết bị', label: 'Trang thiết bị' },
                { value: 'Đồ uống', label: 'Đồ uống' },
                { value: 'Đồ ăn', label: 'Đồ ăn' },
                { value: 'Khác', label: 'Khác' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị tính (ĐVT)"
            rules={[{ required: true, message: 'Nhập đơn vị tính!' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Cái, Chai, Lon..." />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="totalQuantity"
            label="Tổng số lượng (Kho)"
            rules={[{ required: true, message: 'Nhập tổng lượng!' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="defaultPriceIfLost"
            label="Giá đền bù (VND)"
            rules={[{ required: true, message: 'Nhập giá đền bù!' }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default EquipmentModal;
