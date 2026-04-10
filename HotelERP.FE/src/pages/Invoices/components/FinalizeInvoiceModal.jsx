import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Descriptions,
  Divider,
  Row,
  Col,
  Card,
  Spin,
  Button,
  Tag,
} from 'antd';
import invoiceApi from '../../../api/invoiceApi';

const { Title, Text } = Typography;

const paymentOptions = [
  { value: 'Cash', label: 'Tiền mặt' },
  { value: 'Bank Transfer', label: 'Chuyển khoản' },
  { value: 'VNPay', label: 'VNPay' },
  { value: 'Momo', label: 'Momo' },
  { value: 'Credit Card', label: 'Thẻ tín dụng' },
];

const money = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

const FinalizeInvoiceModal = ({ open, invoiceId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  useEffect(() => {
    if (!open || !invoiceId) return;

    form.setFieldsValue({
      paymentMethod: 'Cash',
      transactionCode: '',
      note: '',
    });

    fetchInvoiceDetail();
  }, [open, invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoadingDetail(true);
      const res = await invoiceApi.getInvoiceDetail(invoiceId);
      const payload = res?.data?.data || res?.data || {};
      setInvoiceDetail(payload);
    } catch (error) {
      console.error('Load invoice detail error:', error);
      message.error(error?.response?.data?.message || 'Không tải được chi tiết hóa đơn.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const res = await invoiceApi.finalizeInvoice(invoiceId, {
        paymentMethod: values.paymentMethod,
        transactionCode: values.transactionCode || '',
        note: values.note || '',
      });

      message.success(res?.data?.message || 'Thanh toán và chốt hóa đơn thành công.');
      onSuccess?.(res?.data?.data || res?.data);
      onCancel?.();
    } catch (error) {
      if (error?.errorFields) return;

      console.error('Finalize invoice error:', error);
      message.error(error?.response?.data?.message || 'Không chốt được hóa đơn.');
    } finally {
      setSubmitting(false);
    }
  };

  const bookingId =
    getValue(invoiceDetail, 'bookingId', 'BookingId') || '-';

  const customerName =
    getValue(invoiceDetail, 'customerName', 'CustomerName', 'guestName', 'GuestName') || 'Khách lẻ';

  const invoiceCode =
    getValue(invoiceDetail, 'invoiceCode', 'InvoiceCode') || `INV-${invoiceId}`;

  const bookingCode =
    getValue(invoiceDetail, 'bookingCode', 'BookingCode') || '-';

  const invoiceStatus =
    getValue(invoiceDetail, 'invoiceStatus', 'InvoiceStatus') || 'DRAFT';

  const paymentStatus =
    getValue(invoiceDetail, 'paymentStatus', 'PaymentStatus') || 'UNPAID';

  const roomNumbers =
    getValue(invoiceDetail, 'roomNumbers', 'RoomNumbers') || [];

  const totalRoomAmount = getValue(invoiceDetail, 'totalRoomAmount', 'TotalRoomAmount') || 0;
  const totalServiceAmount = getValue(invoiceDetail, 'totalServiceAmount', 'TotalServiceAmount') || 0;
  const totalDamageAmount = getValue(invoiceDetail, 'totalDamageAmount', 'TotalDamageAmount') || 0;
  const manualAdjustmentAmount = getValue(invoiceDetail, 'manualAdjustmentAmount', 'ManualAdjustmentAmount') || 0;
  const discountAmount = getValue(invoiceDetail, 'discountAmount', 'DiscountAmount') || 0;
  const taxAmount = getValue(invoiceDetail, 'taxAmount', 'TaxAmount') || 0;
  const grossTotal =
    getValue(invoiceDetail, 'grossTotal', 'GrossTotal') ??
    (getValue(invoiceDetail, 'finalTotal', 'FinalTotal') || 0);
  const depositAmount = getValue(invoiceDetail, 'depositAmount', 'DepositAmount') || 0;
  const finalTotal = getValue(invoiceDetail, 'finalTotal', 'FinalTotal') || 0;

  return (
    <Modal
      title={`Thanh toán hóa đơn • Invoice #${invoiceId || ''}`}
      open={open}
      onCancel={onCancel}
      width={900}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
        >
          Thanh toán
        </Button>,
      ]}
    >
      <Spin spinning={loadingDetail} tip="Đang tải chi tiết hóa đơn...">
        {invoiceDetail ? (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Booking ID">
                <Text strong>{bookingId}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Tên khách hàng">
                <Text strong>{customerName}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã booking">
                <Text strong>{bookingCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã hóa đơn">
                <Text strong>{invoiceCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Phòng">
                {roomNumbers.length ? roomNumbers.join(', ') : 'Không có'}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái hóa đơn">
                <Tag color={String(invoiceStatus).toUpperCase() === 'PAID' ? 'green' : 'orange'}>
                  {String(invoiceStatus).toUpperCase()}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag color={String(paymentStatus).toUpperCase() === 'PAID' ? 'green' : 'gold'}>
                  {String(paymentStatus).toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Chi tiết hóa đơn" size="small" style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text>Tiền phòng</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(totalRoomAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text>Tiền dịch vụ</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(totalServiceAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text>Phí đền bù</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(totalDamageAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text>Phụ phí thêm</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(manualAdjustmentAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text>Giảm giá</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong type="success">-{money(discountAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text>VAT</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(taxAmount)}</Text>
                </Col>

                <Col span={12}>
                  <Text strong>Tổng tiền hóa đơn</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>{money(grossTotal)}</Text>
                </Col>

                <Col span={12}>
                  <Text strong type="warning">Tiền cọc đã thu</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong type="warning">-{money(depositAmount)}</Text>
                </Col>
              </Row>

              <Divider />

              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4} style={{ margin: 0 }}>
                    Số tiền cần thanh toán
                  </Title>
                </Col>
                <Col>
                  <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
                    {money(finalTotal)}
                  </Title>
                </Col>
              </Row>
            </Card>

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
                <Input placeholder="Ví dụ: VNPAY-20260410-001" />
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú thanh toán"
                rules={[{ max: 1000, message: 'Ghi chú tối đa 1000 ký tự.' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Ví dụ: khách đã thanh toán đủ, xác nhận xuất hóa đơn."
                />
              </Form.Item>
            </Form>
          </>
        ) : (
          !loadingDetail && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Text type="secondary">Không tải được chi tiết hóa đơn.</Text>
            </div>
          )
        )}
      </Spin>
    </Modal>
  );
};

export default FinalizeInvoiceModal;
