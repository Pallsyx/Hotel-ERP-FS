import React, { useState, useEffect, useMemo } from 'react';
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
  InputNumber,
} from 'antd';
import {
  HomeOutlined,
  AppstoreAddOutlined,
  WarningOutlined,
  GiftOutlined,
  PlusCircleOutlined,
  PercentageOutlined,
  SaveOutlined,
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
  const [savingDamage, setSavingDamage] = useState(false);
  const [data, setData] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(invoiceId || null);
  const [editedDamageAmount, setEditedDamageAmount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setActiveInvoiceId(invoiceId || null);
  }, [visible, invoiceId]);

  useEffect(() => {
    if (!visible) return;
    loadData();
  }, [visible, bookingId, bookingDetailId, activeInvoiceId]);

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const loadData = async () => {
    try {
      setLoading(true);

      let payload = null;

      if (activeInvoiceId) {
        const res = await invoiceApi.getInvoiceDetail(activeInvoiceId);
        payload = res?.data?.data || res?.data || {};
      } else if (bookingId && bookingDetailId) {
        const [eligibleRes, draftRes] = await Promise.all([
          invoiceApi.getEligibleBookingDetails(bookingId),
          invoiceApi.getDraftInvoice(bookingId),
        ]);

        const rows = eligibleRes?.data?.data || eligibleRes?.data || [];
        const bookingDraft = draftRes?.data?.data || draftRes?.data || {};
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

        const bookingSubTotal = getValue(bookingDraft, 'subTotal', 'SubTotal') || 0;
        const bookingRoomTotal = getValue(bookingDraft, 'totalRoomAmount', 'TotalRoomAmount') || 0;
        const bookingDiscount = getValue(bookingDraft, 'discountAmount', 'DiscountAmount') || 0;
        const bookingDeposit = getValue(bookingDraft, 'depositAmount', 'DepositAmount') || 0;

        const discountShare = bookingSubTotal > 0
          ? (bookingDiscount * subTotal) / bookingSubTotal
          : 0;

        const depositShare = bookingRoomTotal > 0
          ? (bookingDeposit * roomCharge) / bookingRoomTotal
          : bookingDeposit;

        const grossTotal = Math.max(0, subTotal - discountShare);

        payload = {
          bookingId,
          bookingCode: initialBookingCode || getValue(bookingDraft, 'bookingCode', 'BookingCode') || '',
          customerName: initialCustomerName || getValue(bookingDraft, 'customerName', 'CustomerName') || 'Khách lẻ',
          roomNumbers: [roomNumber],
          bookingDetailIds: [bookingDetailId],
          totalRoomAmount: roomCharge,
          totalServiceAmount: serviceCharge,
          totalDamageAmount: damageCharge,
          manualAdjustmentAmount: 0,
          discountAmount: discountShare,
          taxAmount: 0,
          subTotal,
          grossTotal,
          depositAmount: depositShare,
          finalTotal: Math.max(0, grossTotal - depositShare),
          invoiceStatus: 'DRAFT',
        };
      } else if (bookingId) {
        const res = await invoiceApi.getDraftInvoice(bookingId);
        payload = res?.data?.data || res?.data || {};
      }

      setData(payload);
      setEditedDamageAmount(getValue(payload, 'totalDamageAmount', 'TotalDamageAmount') || 0);
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

  const handleSaveDamage = async () => {
    if (!activeInvoiceId) {
      message.warning('Cần tạo hóa đơn nháp trước khi cập nhật phí đền bù.');
      return;
    }

    try {
      setSavingDamage(true);
      await invoiceApi.updateDamageCharge(activeInvoiceId, {
        amount: Number(editedDamageAmount || 0),
        reason: 'Cập nhật từ màn hình hóa đơn tạm tính',
      });

      message.success('Đã cập nhật phí đền bù hư hỏng.');
      await loadData();
      await onChanged?.();
    } catch (error) {
      console.error('Update damage charge error:', error);
      message.error(error?.response?.data?.message || 'Không cập nhật được phí đền bù.');
    } finally {
      setSavingDamage(false);
    }
  };

  const totalRoomAmount = getValue(data, 'totalRoomAmount', 'TotalRoomAmount') || 0;
  const totalServiceAmount = getValue(data, 'totalServiceAmount', 'TotalServiceAmount') || 0;
  const totalDamageAmount = getValue(data, 'totalDamageAmount', 'TotalDamageAmount') || 0;
  const manualAdjustmentAmount = getValue(data, 'manualAdjustmentAmount', 'ManualAdjustmentAmount') || 0;
  const discountAmount = getValue(data, 'discountAmount', 'DiscountAmount') || 0;
  const taxAmount = getValue(data, 'taxAmount', 'TaxAmount') || 0;
  const grossTotalFromApi = getValue(data, 'grossTotal', 'GrossTotal');
  const depositAmount = getValue(data, 'depositAmount', 'DepositAmount') || 0;
  const finalTotal = getValue(data, 'finalTotal', 'FinalTotal') || 0;

  const subTotal =
    getValue(data, 'subTotal', 'SubTotal') ??
    (totalRoomAmount + totalServiceAmount + totalDamageAmount + manualAdjustmentAmount);

  const grossTotal = useMemo(() => {
    if (grossTotalFromApi !== undefined && grossTotalFromApi !== null) return grossTotalFromApi;
    return Math.max(0, subTotal - discountAmount + taxAmount);
  }, [grossTotalFromApi, subTotal, discountAmount, taxAmount]);

  const bookingCode = getValue(data, 'bookingCode', 'BookingCode') || initialBookingCode || '';
  const customerName = getValue(data, 'customerName', 'CustomerName') || initialCustomerName || 'Khách lẻ';
  const resolvedBookingId = getValue(data, 'bookingId', 'BookingId') || bookingId;
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
          key='footer-wrap'
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

          <Button key='close' onClick={onClose} size='large'>
            Đóng cửa sổ
          </Button>
        </div>,
      ]}
    >
      <Spin spinning={loading} tip='Đang tải hóa đơn...'>
        {data ? (
          <div style={{ padding: '10px 0' }}>
            <Descriptions bordered column={1} size='small' style={{ marginBottom: 20 }}>
              <Descriptions.Item label='Tên khách hàng'>
                <Text strong>{customerName}</Text>
              </Descriptions.Item>

              <Descriptions.Item label='Mã Booking'>
                <Text strong>{bookingCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label='Booking ID'>
                <Text strong>{resolvedBookingId}</Text>
              </Descriptions.Item>

              <Descriptions.Item label='Phòng'>
                <Text strong>{currentRoomNumber}</Text>
              </Descriptions.Item>

              {activeInvoiceId ? (
                <Descriptions.Item label='Invoice ID'>
                  <Text strong>{activeInvoiceId}</Text>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
              <Title level={5}>
                <HomeOutlined /> Tiền phòng
              </Title>
              <Row justify='space-between'>
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
              <Row justify='space-between'>
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
              <Row justify='space-between' align='middle' gutter={[12, 12]}>
                <Col>
                  <Text>Tổng phí phạt/đền bù:</Text>
                </Col>
                <Col>
                  <Space wrap>
                    <InputNumber
                      min={0}
                      precision={0}
                      value={editedDamageAmount}
                      onChange={(value) => setEditedDamageAmount(value || 0)}
                      style={{ width: 180 }}
                      formatter={(value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`}
                      parser={(value) => Number(String(value || '').replace(/[₫\s,.]/g, '').replace(/[^\d-]/g, '')) || 0}
                      disabled={!activeInvoiceId || savingDamage}
                    />
                    <Button
                      type='primary'
                      icon={<SaveOutlined />}
                      onClick={handleSaveDamage}
                      loading={savingDamage}
                      disabled={!activeInvoiceId}
                    >
                      Lưu
                    </Button>
                  </Space>
                </Col>
              </Row>
              {!activeInvoiceId && (
                <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
                  Tạo hóa đơn nháp trước để cập nhật phí đền bù trực tiếp.
                </Text>
              )}

              {manualAdjustmentAmount > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>
                    <PlusCircleOutlined style={{ color: '#722ed1' }} /> Phụ phí thêm
                  </Title>
                  <Row justify='space-between'>
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

              <Row justify='space-between' style={{ marginTop: 20 }}>
                <Col>
                  <Title level={5}>Tạm Tính (Subtotal):</Title>
                </Col>
                <Col>
                  <Title level={5}>{formatVND(subTotal)}</Title>
                </Col>
              </Row>

              {discountAmount > 0 && (
                <Row justify='space-between' style={{ marginTop: 10 }}>
                  <Col>
                    <Text type='success'>
                      <GiftOutlined /> Voucher giảm giá:
                    </Text>
                  </Col>
                  <Col>
                    <Text type='success'>-{formatVND(discountAmount)}</Text>
                  </Col>
                </Row>
              )}

              {taxAmount > 0 && (
                <Row justify='space-between' style={{ marginTop: 10 }}>
                  <Col>
                    <Text><PercentageOutlined /> VAT:</Text>
                  </Col>
                  <Col>
                    <Text strong>+{formatVND(taxAmount)}</Text>
                  </Col>
                </Row>
              )}

              <Row justify='space-between' style={{ marginTop: 10 }}>
                <Col>
                  <Text strong>Tổng tiền hóa đơn:</Text>
                </Col>
                <Col>
                  <Text strong>{formatVND(grossTotal)}</Text>
                </Col>
              </Row>

              <Row justify='space-between' style={{ marginTop: 10 }}>
                <Col>
                  <Text strong type='warning'>Tiền cọc đã thu:</Text>
                </Col>
                <Col>
                  <Text strong type='warning'>-{formatVND(depositAmount)}</Text>
                </Col>
              </Row>
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
              <Row justify='space-between' align='middle'>
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
              <Text type='secondary'>
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
