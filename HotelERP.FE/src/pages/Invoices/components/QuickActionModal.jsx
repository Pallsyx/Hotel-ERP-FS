import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import invoiceApi from '../../../api/invoiceApi';

const QuickActionModal = ({ open, bookingId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const res = await invoiceApi.addExtraFee(bookingId, {
        amount: values.amount,
        reason: values.reason || '',
      });

      const payload = res?.data?.data || {};
      message.success(res?.data?.message || 'Thêm phụ phí thành công.');

      onSuccess?.(payload);
      onCancel?.();
    } catch (error) {
      if (error?.errorFields) return;

      console.error('Add extra fee error:', error);
      message.error(error?.response?.data?.message || 'Không thêm được phụ phí.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Thao tác nhanh • Booking #${bookingId}`}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Lưu phụ phí"
      cancelText="Đóng"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label="Số tiền phụ phí"
          rules={[
            { required: true, message: 'Nhập số tiền phụ phí.' },
            { type: 'number', min: 1, message: 'Phụ phí phải lớn hơn 0.' },
          ]}
        >
          <InputNumber
            min={1}
            className="w-full"
            style={{ width: '100%' }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            }
            parser={(value) => value.replace(/\./g, '')}
            addonAfter="VND"
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do"
          rules={[{ max: 500, message: 'Lý do tối đa 500 ký tự.' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: phụ thu check-out trễ, phụ thu vệ sinh đặc biệt..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickActionModal;