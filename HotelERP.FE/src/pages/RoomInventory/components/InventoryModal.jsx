import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message, Switch } from 'antd';
import { roomInventoryApi } from '../../../api/roomInventoryApi';

const InventoryModal = ({ open, onCancel, roomId, onSuccess, editingItem }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    if (editingItem) {
      form.setFieldsValue({
        itemName: editingItem.itemName,
        quantity: editingItem.quantity,
        priceIfLost: editingItem.priceIfLost,
        condition: editingItem.status,
        isMinibar: editingItem.isMinibar || false,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        quantity: 1,
        condition: 'Tốt',
        isMinibar: false,
        priceIfLost: 1000,
      });
    }
  }, [open, editingItem, form]);

  const handleOk = async () => {
    try {
      const v = await form.validateFields();

      const payload = {
        itemName: String(v.itemName).trim(),
        quantity: Number(v.quantity),
        condition: v.condition ? String(v.condition).trim() : 'Tốt',
        isMinibar: v.isMinibar === true,
        priceIfLost: Number(v.priceIfLost),
      };

      if (editingItem) {
        await roomInventoryApi.updateInventory(roomId, editingItem.id, payload);
        message.success('Cập nhật vật tư thành công!');
      } else {
        await roomInventoryApi.addInventory(roomId, payload);
        message.success('Thêm vật tư thành công!');
      }

      form.resetFields();
      onCancel();
      onSuccess?.();
    } catch (e) {
      console.error('Lỗi API:', e);
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        'Lưu vật tư thất bại!';
      message.error(apiMessage);
    }
  };

  return (
    <Modal
      title={editingItem ? 'SỬA VẬT TƯ' : 'THÊM ĐỒ MỚI'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="itemName"
          label="Tên vật tư"
          rules={[{ required: true, message: 'Nhập tên vật tư!' }]}
        >
          <Input placeholder="VD: Tivi Samsung, Khăn tắm..." />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Nhập số lượng!' },
            {
              validator: (_, value) => {
                if (value > 0) return Promise.resolve();
                return Promise.reject(new Error('Số lượng phải lớn hơn 0'));
              },
            },
          ]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="priceIfLost"
          label="Giá đền bù (VNĐ)"
          rules={[
            { required: true, message: 'Nhập giá đền bù!' },
            {
              validator: (_, value) => {
                if (value > 0) return Promise.resolve();
                return Promise.reject(new Error('Giá đền bù phải lớn hơn 0'));
              },
            },
          ]}
        >
          <InputNumber min={1} style={{ width: '100%' }} step={1000} />
        </Form.Item>

        <Form.Item name="condition" label="Tình trạng">
          <Input placeholder="VD: Tốt, Cũ, Xước..." />
        </Form.Item>

        <Form.Item name="isMinibar" label="Là đồ Minibar (tủ lạnh)?" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InventoryModal;