import React, { useState, useEffect } from 'react';
import {
  Modal,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Descriptions,
  Button,
  message,
  Space,
} from 'antd';
import {
  HomeOutlined,
  AppstoreAddOutlined,
  WarningOutlined,
  GiftOutlined,
  PlusCircleOutlined,
  PercentageOutlined,
  UserOutlined,
  IdcardOutlined,
  HomeFilled,
} from '@ant-design/icons';
import invoiceApi from '../../../api/invoiceApi';
import InvoiceActionButtons from '../../Invoices/components/InvoiceActionButtons';

const { Title, Text } = Typography;

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

const DraftInvoiceModal = ({
  bookingId,
  bookingDetailId,
  invoiceId,
  invoiceStatus,
  initialCustomerName,
  initialBookingCode,
  initialRoomNumber,
  visible,
  onClose,
  onChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(invoiceId || null);

  useEffect(() => {
    if (!visible) return;
    setActiveInvoiceId(invoiceId || null);
  }, [visible, invoiceId]);

  useEffect(() => {
    if (!visible) return;
    loadData();
  }, [visible, bookingId, bookingDetailId, activeInvoiceId]);

  const loadData = async () => {
    try {
      setLoading(true);

      let payload = null;

      if (activeInvoiceId) {
        const res = await invoiceApi.getInvoiceDetail(activeInvoiceId);
        payload = res?.data?.data || res?.data || {};
      } else if (bookingId && bookingDetailId) {
        const res = await invoiceApi.getEligibleBookingDetails(bookingId);
        const rows = res?.data?.data || res?.data || [];
        const selected = Array.isArray(rows)
          ? rows.find((x) => (x?.bookingDetailId ?? x?.BookingDetailId) === bookingDetailId)
          : null;

        if (!selected) {
          throw new Error('Không tìm thấy phòng cần xem tạm tính.');
        }

        const roomCharge = getValue(selected, 'roomCharge', 'RoomCharge') || 0;
        const serviceCharge = getValue(selected, 'serviceCharge', 'ServiceCharge') || 0;
        const damageCharge = getValue(selected, 'damageCharge', 'DamageCharge') || 0;
        const roomNumber = getValue(selected, 'roomNumber', 'RoomNumber') || initialRoomNumber || '-';
        const subTotal = roomCharge + serviceCharge + damageCharge;

        payload = {
          bookingId,
          bookingCode: initialBookingCode || '',
          customerName: initialCustomerName || 'Khách lẻ',
          roomNumbers: [roomNumber],
          bookingDetailIds: [bookingDetailId],
          totalRoomAmount: roomCharge,
          totalServiceAmount: serviceCharge,
          totalDamageAmount: damageCharge,
          manualAdjustmentAmount: 0,
          discountAmount: 0,
          taxAmount: 0,
          subTotal,
          finalTotal: subTotal,
          invoiceStatus: 'DRAFT',
        };
      } else if (bookingId) {
        const res = await invoiceApi.getDraftInvoice(bookingId);
        payload = res?.data?.data || res?.data || {};
      }

      setData(payload);
    } catch (error) {
      console.error('Draft/Invoice API Error:', error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Lỗi khi lấy thông tin hóa đơn';

      message.error(errorMsg);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const totalRoomAmount = getValue(data, 'totalRoomAmount', 'TotalRoomAmount') || 0;
  const totalServiceAmount = getValue(data, 'totalServiceAmount', 'TotalServiceAmount') || 0;
  const totalDamageAmount = getValue(data, 'totalDamageAmount', 'TotalDamageAmount') || 0;
  const manualAdjustmentAmount = getValue(data, 'manualAdjustmentAmount', 'ManualAdjustmentAmount') || 0;
  const discountAmount = getValue(data, 'discountAmount', 'DiscountAmount') || 0;
  const taxAmount = getValue(data, 'taxAmount', 'TaxAmount') || 0;
  const finalTotal = getValue(data, 'finalTotal', 'FinalTotal') || 0;

  const subTotal =
    getValue(data, 'subTotal', 'SubTotal') ??
    (totalRoomAmount + totalServiceAmount + totalDamageAmount + manualAdjustmentAmount);

  const bookingCode = getValue(data, 'bookingCode', 'BookingCode') || initialBookingCode || '';
  const customerName = getValue(data, 'customerName', 'CustomerName') || initialCustomerName || 'Khách lẻ';
  const roomNumbers = getValue(data, 'roomNumbers', 'RoomNumbers') || [];
  const currentRoomNumber = roomNumbers.length ? roomNumbers.join(', ') : (initialRoomNumber || '-');

  const currentInvoiceStatus =
    getValue(data, 'invoiceStatus', 'InvoiceStatus', 'status', 'Status') || invoiceStatus;

  return (
    <Modal
      title={<Title level={3} style={{ marginBottom: 0 }}>Hóa đơn tạm tính</Title>}
      open={visible}
      onCancel={onClose}
      width={920}
      centered
      destroyOnHidden
      footer={[
        <div
          key="footer-wrap"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Space wrap>
            <InvoiceActionButtons
              bookingId={bookingId}
              bookingDetailId={bookingDetailId}
              invoiceId={activeInvoiceId}
              invoiceStatus={currentInvoiceStatus}
              onInvoiceCreated={(newInvoiceId) => {
                setActiveInvoiceId(newInvoiceId);
              }}
              onChanged={async () => {
                await loadData();
                await onChanged?.();
              }}
            />
          </Space>

          <Button key="close" onClick={onClose} size="large">
            Đóng cửa sổ
          </Button>
        </div>,
      ]}
    >
      <Spin spinning={loading} tip="Đang tải hóa đơn...">
        {data ? (
          <div style={{ padding: '10px 0' }}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Tên khách hàng">
                <Text strong>{customerName}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã Booking">
                <Text strong>{bookingCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Booking ID">
                <Text strong>{bookingId}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Phòng">
                <Text strong>{initialRoomNumber || '-'}</Text>
              </Descriptions.Item>

              {activeInvoiceId ? (
                <Descriptions.Item label="Invoice ID">
                  <Text strong>{activeInvoiceId}</Text>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
              <Title level={5}>
                <HomeOutlined /> Tiền phòng
              </Title>
              <Row justify="space-between">
                <Col>
                  <Text>Tổng tiền các phòng đã đặt:</Text>
                </Col>
                <Col>
                  <Text strong>{formatVND(totalRoomAmount)}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />

              <Title level={5}>
                <AppstoreAddOutlined style={{ color: '#1890ff' }} /> Dịch vụ sử dụng
              </Title>
              <Row justify="space-between">
                <Col>
                  <Text>Tổng chi phí dịch vụ thêm:</Text>
                </Col>
                <Col>
                  <Text strong>{formatVND(totalServiceAmount)}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />

              <Title level={5}>
                <WarningOutlined style={{ color: '#f5222d' }} /> Phí đền bù hư hỏng
              </Title>
              <Row justify="space-between">
                <Col>
                  <Text>Tổng phí phạt/đền bù:</Text>
                </Col>
                <Col>
                  <Text strong type="danger">{formatVND(totalDamageAmount)}</Text>
                </Col>
              </Row>

              {manualAdjustmentAmount > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>
                    <PlusCircleOutlined style={{ color: '#722ed1' }} /> Phụ phí thêm
                  </Title>
                  <Row justify="space-between">
                    <Col>
                      <Text>Phụ phí / điều chỉnh thêm:</Text>
                    </Col>
                    <Col>
                      <Text strong style={{ color: '#722ed1' }}>{formatVND(manualAdjustmentAmount)}</Text>
                    </Col>
                  </Row>
                </>
              )}

              <Divider style={{ margin: '12px 0' }} />

              <Row justify="space-between" style={{ marginTop: 20 }}>
                <Col>
                  <Title level={5}>Tạm Tính (Subtotal):</Title>
                </Col>
                <Col>
                  <Title level={5}>{formatVND(subTotal)}</Title>
                </Col>
              </Row>

              {discountAmount > 0 && (
                <Row justify="space-between" style={{ marginTop: 10 }}>
                  <Col>
                    <Text type="success">
                      <GiftOutlined /> Voucher giảm giá:
                    </Text>
                  </Col>
                  <Col>
                    <Text type="success">-{formatVND(discountAmount)}</Text>
                  </Col>
                </Row>
              )}

              {taxAmount > 0 && (
                <Row justify="space-between" style={{ marginTop: 10 }}>
                  <Col>
                    <Text><PercentageOutlined /> VAT:</Text>
                  </Col>
                  <Col>
                    <Text strong>+{formatVND(taxAmount)}</Text>
                  </Col>
                </Row>
              )}
            </div>

            <div
              style={{
                background: '#e6f7ff',
                padding: 20,
                borderRadius: 8,
                marginTop: 20,
                border: '1px solid #91d5ff',
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={4} style={{ margin: 0, color: '#0050b3' }}>
                    Tổng Cộng Cần Thanh Toán
                  </Title>
                </Col>
                <Col>
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    {formatVND(finalTotal)}
                  </Title>
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          !loading && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Text type="secondary">
                Không có dữ liệu hóa đơn. Vui lòng kiểm tra lại Booking ID.
              </Text>
            </div>
          )
        )}
      </Spin>
    </Modal>
  );
};

export default DraftInvoiceModal;
