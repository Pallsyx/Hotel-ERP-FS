import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import invoiceApi from '../../../api/invoiceApi';

const paymentOptions = [
  { value: 'Cash', label: 'Tiền mặt' },
  { value: 'Bank Transfer', label: 'Chuyển khoản' },
  { value: 'VNPay', label: 'VNPay' },
  { value: 'Momo', label: 'Momo' },
  { value: 'Credit Card', label: 'Thẻ tín dụng' },
];

const FinalizeInvoiceModal = ({ open, bookingId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        paymentMethod: 'Cash',
        transactionCode: '',
        note: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const res = await invoiceApi.finalizeInvoice(bookingId, {
        paymentMethod: values.paymentMethod,
        transactionCode: values.transactionCode || '',
        note: values.note || '',
      });

      const payload = res?.data?.data || {};
      message.success(res?.data?.message || 'Chốt hóa đơn thành công.');

      onSuccess?.(payload);
      onCancel?.();
    } catch (error) {
      if (error?.errorFields) return;

      console.error('Finalize invoice error:', error);
      message.error(error?.response?.data?.message || 'Không chốt được hóa đơn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Chốt & Xuất hóa đơn • Booking #${bookingId}`}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Chốt hóa đơn"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: 'Chọn phương thức thanh toán.' }]}
        >
          <Select options={paymentOptions} />
        </Form.Item>

        <Form.Item
          name="transactionCode"
          label="Mã giao dịch"
          rules={[{ max: 100, message: 'Mã giao dịch tối đa 100 ký tự.' }]}
        >
          <Input placeholder="Ví dụ: VNPAY-20260409-001" />
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú chốt hóa đơn"
          rules={[{ max: 1000, message: 'Ghi chú tối đa 1000 ký tự.' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ví dụ: khách đã thanh toán đủ, bàn giao phòng hoàn tất..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FinalizeInvoiceModal;