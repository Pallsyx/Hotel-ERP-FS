import React, { useEffect, useMemo, useState } from 'react';
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
  Card,
  Input,
  Tag,
  Alert,
  Empty,
  Checkbox,
} from 'antd';
import {
  HomeOutlined,
  AppstoreAddOutlined,
  WarningOutlined,
  GiftOutlined,
  PlusCircleOutlined,
  PercentageOutlined,
  SaveOutlined,
  ApartmentOutlined,
  TagsOutlined,
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

const normalizeStatus = (value) => String(value || '').trim().toUpperCase();
const normalizeIds = (ids = []) => Array.from(new Set((ids || []).map(Number).filter(Boolean))).sort((a, b) => a - b);
const areSameIds = (left = [], right = []) => {
  const a = normalizeIds(left);
  const b = normalizeIds(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);

const getSelectableAllIds = (rows) => {
  const selectableIds = rows
    .filter((row) => {
      const settlementStatus = getValue(row, 'settlementStatus', 'SettlementStatus');
      const canCreateInvoice = getValue(row, 'canCreateInvoice', 'CanCreateInvoice') === true;
      const hasOpenInvoice = Boolean(getValue(row, 'openInvoiceId', 'OpenInvoiceId'));

      return normalizeStatus(settlementStatus) !== 'PAID' && (canCreateInvoice || hasOpenInvoice);
    })
    .map((row) => getValue(row, 'bookingDetailId', 'BookingDetailId'));

  return normalizeIds(selectableIds);
};

const resolveSelectionView = (preferredView, rows, fallbackInvoiceDetailIds, fallbackBookingDetailId) => {
  const allIds = normalizeIds(rows.map((row) => row.bookingDetailId));

  if (preferredView === 'ALL') return 'ALL';

  if (preferredView?.startsWith('DETAIL-')) {
    const detailId = Number(preferredView.replace('DETAIL-', ''));
    if (allIds.includes(detailId)) return `DETAIL-${detailId}`;
  }

  const invoiceIds = normalizeIds(fallbackInvoiceDetailIds);
  if (invoiceIds.length === 1 && allIds.includes(invoiceIds[0])) {
    return `DETAIL-${invoiceIds[0]}`;
  }

  if (fallbackBookingDetailId && allIds.includes(Number(fallbackBookingDetailId))) {
    return `DETAIL-${Number(fallbackBookingDetailId)}`;
  }

  return 'ALL';
};

const resolveSelectionIds = (view, rows) => {
  if (view === 'ALL') return getSelectableAllIds(rows);
  if (view?.startsWith('DETAIL-')) {
    return normalizeIds([Number(view.replace('DETAIL-', ''))]);
  }
  return [];
};

const resolveExistingInvoiceId = (selectionIds, rows) => {
  const normalizedSelectionIds = normalizeIds(selectionIds);
  if (!normalizedSelectionIds.length) return null;

  const selectedRows = rows.filter((row) => normalizedSelectionIds.includes(row.bookingDetailId));
  if (!selectedRows.length) return null;

  const openInvoiceIds = normalizeIds(selectedRows.map((row) => row.openInvoiceId));
  if (openInvoiceIds.length !== 1) return null;
  if (!selectedRows.every((row) => Number(row.openInvoiceId) === openInvoiceIds[0])) return null;
  return openInvoiceIds[0];
};

const buildLocalPreviewPayload = ({
  bookingId,
  bookingDraft,
  selectedRows,
  customerName,
  bookingCode,
}) => {
  const totalRoomAmount = selectedRows.reduce((sum, row) => sum + (row.roomCharge || 0), 0);
  const totalServiceAmount = selectedRows.reduce((sum, row) => sum + (row.serviceCharge || 0), 0);
  const totalDamageAmount = selectedRows.reduce((sum, row) => sum + (row.damageCharge || 0), 0);
  const subTotal = totalRoomAmount + totalServiceAmount + totalDamageAmount;

  const bookingSubTotal = getValue(bookingDraft, 'subTotal', 'SubTotal') || 0;
  const bookingRoomTotal = getValue(bookingDraft, 'totalRoomAmount', 'TotalRoomAmount') || 0;
  const bookingDiscount = getValue(bookingDraft, 'discountAmount', 'DiscountAmount') || 0;
  const bookingDeposit = getValue(bookingDraft, 'depositAmount', 'DepositAmount') || 0;

  const discountAmount = bookingSubTotal > 0
    ? (bookingDiscount * subTotal) / bookingSubTotal
    : 0;

  const taxableBase = Math.max(0, subTotal - discountAmount);
  const taxAmount = taxableBase * 0.1;
  const grossTotal = Math.max(0, taxableBase + taxAmount);
  const depositAmount = bookingRoomTotal > 0
    ? (bookingDeposit * totalRoomAmount) / bookingRoomTotal
    : bookingDeposit;

  const isPaidSelection = selectedRows.length > 0 && selectedRows.every((row) => normalizeStatus(row.settlementStatus) === 'PAID');
  const hasBlockedSelection = selectedRows.some(
    (row) => !row.canCreateInvoice && !row.openInvoiceId && normalizeStatus(row.settlementStatus) !== 'PAID'
  );

  return {
    bookingId,
    bookingCode,
    customerName,
    roomNumbers: selectedRows.map((row) => row.roomNumber),
    bookingDetailIds: selectedRows.map((row) => row.bookingDetailId),
    totalRoomAmount,
    totalServiceAmount,
    totalDamageAmount,
    manualAdjustmentAmount: 0,
    discountAmount,
    taxAmount,
    subTotal,
    grossTotal,
    depositAmount,
    finalTotal: isPaidSelection ? 0 : Math.max(0, grossTotal - depositAmount),
    invoiceStatus: isPaidSelection ? 'PAID' : hasBlockedSelection ? 'UNPAID' : 'DRAFT',
  };
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
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const [allDetails, setAllDetails] = useState([]);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [explicitSelectedDetailIds, setExplicitSelectedDetailIds] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(invoiceId || null);
  const [editedDamageAmount, setEditedDamageAmount] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');

  const normalizedDetails = useMemo(
    () => allDetails.map((row) => ({
      bookingDetailId: Number(getValue(row, 'bookingDetailId', 'BookingDetailId') || 0),
      bookingId: Number(getValue(row, 'bookingId', 'BookingId') || bookingId || 0),
      roomNumber: getValue(row, 'roomNumber', 'RoomNumber') || '-',
      roomCharge: Number(getValue(row, 'roomCharge', 'RoomCharge') || 0),
      serviceCharge: Number(getValue(row, 'serviceCharge', 'ServiceCharge') || 0),
      damageCharge: Number(getValue(row, 'damageCharge', 'DamageCharge') || 0),
      canCreateInvoice: Boolean(getValue(row, 'canCreateInvoice', 'CanCreateInvoice')),
      blockReason: getValue(row, 'blockReason', 'BlockReason') || '',
      settlementStatus: getValue(row, 'settlementStatus', 'SettlementStatus') || '',
      checkoutStatus: getValue(row, 'checkoutStatus', 'CheckoutStatus') || '',
      openInvoiceId: Number(getValue(row, 'openInvoiceId', 'OpenInvoiceId') || 0) || null,
      openInvoiceCode: getValue(row, 'openInvoiceCode', 'OpenInvoiceCode') || '',
    })),
    [allDetails, bookingId]
  );

  const loadBaseData = async (preferredDetailIds = []) => {
    if (!bookingId) return;

    try {
      setLoading(true);

      const [eligibleRes, draftRes] = await Promise.all([
        invoiceApi.getEligibleBookingDetails(bookingId),
        invoiceApi.getDraftInvoice(bookingId),
      ]);

      const rows = eligibleRes?.data?.data || eligibleRes?.data || [];
      const draftPayload = draftRes?.data?.data || draftRes?.data || {};
      const normalizedRows = rows.map((row) => ({
        bookingDetailId: Number(getValue(row, 'bookingDetailId', 'BookingDetailId') || 0),
        settlementStatus: getValue(row, 'settlementStatus', 'SettlementStatus') || '',
        canCreateInvoice: Boolean(getValue(row, 'canCreateInvoice', 'CanCreateInvoice')),
        openInvoiceId: Number(getValue(row, 'openInvoiceId', 'OpenInvoiceId') || 0) || null,
      }));
      const availableIds = normalizeIds(normalizedRows.map((row) => row.bookingDetailId));
      const nextExplicitIds = normalizeIds(preferredDetailIds).filter((id) => availableIds.includes(id));
      const nextEffectiveIds = nextExplicitIds.length
        ? nextExplicitIds
        : getSelectableAllIds(normalizedRows);

      setAllDetails(rows);
      setBookingDraft(draftPayload);
      setVoucherCode(getValue(draftPayload, 'voucherCode', 'VoucherCode') || '');
      setExplicitSelectedDetailIds(nextExplicitIds);
      setActiveInvoiceId(resolveExistingInvoiceId(nextEffectiveIds, normalizedRows));
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

  useEffect(() => {
    if (!visible) return;
    setInvoiceDetail(null);
    loadBaseData(bookingDetailId ? [bookingDetailId] : []);
  }, [visible, bookingId, bookingDetailId, invoiceId]);

  useEffect(() => {
    if (!visible || !activeInvoiceId) {
      setInvoiceDetail(null);
      return;
    }

    const fetchInvoiceDetail = async () => {
      try {
        const res = await invoiceApi.getInvoiceDetail(activeInvoiceId);
        const payload = res?.data?.data || res?.data || {};
        setInvoiceDetail(payload);
      } catch (error) {
        console.error('Load invoice detail error:', error);
        message.error(error?.response?.data?.message || 'Không tải được chi tiết invoice đã tạo.');
      }
    };

    fetchInvoiceDetail();
  }, [visible, activeInvoiceId]);

  const selectedDetailIds = useMemo(() => {
    const explicitIds = normalizeIds(explicitSelectedDetailIds);
    return explicitIds.length ? explicitIds : getSelectableAllIds(normalizedDetails);
  }, [explicitSelectedDetailIds, normalizedDetails]);

  const usingDefaultAllUnpaid = explicitSelectedDetailIds.length === 0;

  const selectedRows = useMemo(
    () => normalizedDetails.filter((row) => selectedDetailIds.includes(row.bookingDetailId)),
    [normalizedDetails, selectedDetailIds]
  );

  const currentInvoiceSelectionIds = useMemo(
    () => normalizeIds(getValue(invoiceDetail, 'bookingDetailIds', 'BookingDetailIds') || []),
    [invoiceDetail]
  );

  const activeInvoiceMatchesSelection = useMemo(
    () => activeInvoiceId && invoiceDetail && areSameIds(currentInvoiceSelectionIds, selectedDetailIds),
    [activeInvoiceId, invoiceDetail, currentInvoiceSelectionIds, selectedDetailIds]
  );

  const previewData = useMemo(() => {
    if (activeInvoiceMatchesSelection) {
      return invoiceDetail;
    }

    return buildLocalPreviewPayload({
      bookingId,
      bookingDraft,
      selectedRows,
      customerName: initialCustomerName || getValue(bookingDraft, 'customerName', 'CustomerName') || 'Khách lẻ',
      bookingCode: initialBookingCode || getValue(bookingDraft, 'bookingCode', 'BookingCode') || '',
    });
  }, [activeInvoiceMatchesSelection, invoiceDetail, bookingId, bookingDraft, selectedRows, initialCustomerName, initialBookingCode]);

  useEffect(() => {
    setEditedDamageAmount(Number(getValue(previewData, 'totalDamageAmount', 'TotalDamageAmount') || 0));
  }, [previewData]);

  const totalRoomAmount = Number(getValue(previewData, 'totalRoomAmount', 'TotalRoomAmount') || 0);
  const totalServiceAmount = Number(getValue(previewData, 'totalServiceAmount', 'TotalServiceAmount') || 0);
  const totalDamageAmount = Number(getValue(previewData, 'totalDamageAmount', 'TotalDamageAmount') || 0);
  const manualAdjustmentAmount = Number(getValue(previewData, 'manualAdjustmentAmount', 'ManualAdjustmentAmount') || 0);
  const discountAmount = Number(getValue(previewData, 'discountAmount', 'DiscountAmount') || 0);
  const taxAmount = Number(getValue(previewData, 'taxAmount', 'TaxAmount') || 0);
  const grossTotalFromApi = getValue(previewData, 'grossTotal', 'GrossTotal');
  const depositAmount = Number(getValue(previewData, 'depositAmount', 'DepositAmount') || 0);
  const finalTotal = Number(getValue(previewData, 'finalTotal', 'FinalTotal') || 0);

  const subTotal = Number(
    getValue(previewData, 'subTotal', 'SubTotal') ??
      (totalRoomAmount + totalServiceAmount + totalDamageAmount + manualAdjustmentAmount)
  );

  const grossTotal = Number(
    grossTotalFromApi !== undefined && grossTotalFromApi !== null
      ? grossTotalFromApi
      : Math.max(0, subTotal - discountAmount + taxAmount)
  );

  const bookingCode = getValue(previewData, 'bookingCode', 'BookingCode') || initialBookingCode || '';
  const customerName = getValue(previewData, 'customerName', 'CustomerName') || initialCustomerName || 'Khách lẻ';
  const resolvedBookingId = getValue(previewData, 'bookingId', 'BookingId') || bookingId;
  const roomNumbers = getValue(previewData, 'roomNumbers', 'RoomNumbers') || [];
  const currentRoomNumber = roomNumbers.length ? roomNumbers.join(', ') : initialRoomNumber || '-';

  const currentInvoiceStatus =
    getValue(previewData, 'invoiceStatus', 'InvoiceStatus', 'status', 'Status') ||
    invoiceStatus ||
    'DRAFT';

  const actionInvoiceId = activeInvoiceMatchesSelection ? activeInvoiceId : null;

  const blockedSelectedRows = selectedRows.filter(
    (row) => !row.canCreateInvoice && !row.openInvoiceId && normalizeStatus(row.settlementStatus) !== 'PAID'
  );

  const syncSelectionState = (nextExplicitIds = []) => {
    const normalizedExplicitIds = normalizeIds(nextExplicitIds);
    const effectiveIds = normalizedExplicitIds.length
      ? normalizedExplicitIds
      : getSelectableAllIds(normalizedDetails);

    setExplicitSelectedDetailIds(normalizedExplicitIds);
    setActiveInvoiceId(resolveExistingInvoiceId(effectiveIds, normalizedDetails));
    setInvoiceDetail(null);
  };

  const handleToggleDetail = (detail) => {
    if (normalizeStatus(detail.settlementStatus) === 'PAID') {
      message.info(`Phòng ${detail.roomNumber} đã thanh toán, không chọn để lập hóa đơn mới.`);
      return;
    }

    if (!detail.canCreateInvoice && !detail.openInvoiceId) {
      message.warning(`Phòng ${detail.roomNumber}: ${detail.blockReason || 'Chưa trả phòng nên chưa được lập hóa đơn.'}`);
      return;
    }

    const detailId = Number(detail.bookingDetailId);
    const nextIds = explicitSelectedDetailIds.includes(detailId)
      ? explicitSelectedDetailIds.filter((id) => id !== detailId)
      : [...explicitSelectedDetailIds, detailId];

    syncSelectionState(nextIds);
  };

  const handleSelectAllUnpaid = () => {
    syncSelectionState(getSelectableAllIds(normalizedDetails));
  };

  const handleClearSelection = () => {
    syncSelectionState([]);
  };

  const handleSaveDamage = async () => {
    if (!actionInvoiceId) {
      message.warning('Cần tạo hóa đơn nháp đúng nhóm phòng đang chọn trước khi cập nhật phí đền bù.');
      return;
    }

    try {
      setSavingDamage(true);
      await invoiceApi.updateDamageCharge(actionInvoiceId, {
        amount: Number(editedDamageAmount || 0),
        reason: 'Cập nhật từ màn hình hóa đơn tạm tính',
      });

      message.success('Đã cập nhật phí đền bù hư hỏng.');
      await loadBaseData(explicitSelectedDetailIds);
      await onChanged?.();
    } catch (error) {
      console.error('Update damage charge error:', error);
      message.error(error?.response?.data?.message || 'Không cập nhật được phí đền bù.');
    } finally {
      setSavingDamage(false);
    }
  };

  const handleApplyVoucher = async (clearVoucher = false) => {
    if (!bookingId) return;

    try {
      setApplyingVoucher(true);
      await invoiceApi.applyVoucherToBooking(bookingId, {
        code: clearVoucher ? '' : voucherCode,
      });
      message.success(clearVoucher ? 'Đã bỏ voucher khỏi booking.' : 'Áp voucher thành công.');
      await loadBaseData(explicitSelectedDetailIds);
      await onChanged?.();
    } catch (error) {
      console.error('Apply voucher error:', error);
      message.error(error?.response?.data?.message || 'Không áp dụng được voucher.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  return (
    <Modal
      title={<Title level={3} style={{ marginBottom: 0 }}>Hóa đơn tạm tính theo Booking</Title>}
      open={visible}
      onCancel={onClose}
      width={1100}
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
              bookingDetailIds={selectedDetailIds}
              invoiceId={actionInvoiceId}
              invoiceStatus={currentInvoiceStatus}
              onInvoiceCreated={(newInvoiceId) => {
                setActiveInvoiceId(newInvoiceId);
              }}
              onChanged={async () => {
                await loadBaseData(explicitSelectedDetailIds);
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
        {!bookingId ? (
          <Empty description="Không có booking để hiển thị hóa đơn." />
        ) : (
          <div style={{ padding: '10px 0' }}>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Tên khách hàng">
                <Text strong>{customerName}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã Booking">
                <Text strong>{bookingCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Booking ID">
                <Text strong>{resolvedBookingId}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Nhóm phòng đang xem">
                <Text strong>{currentRoomNumber}</Text>
              </Descriptions.Item>

              {actionInvoiceId ? (
                <Descriptions.Item label="Invoice ID hiện tại">
                  <Text strong>{actionInvoiceId}</Text>
                </Descriptions.Item>
              ) : null}

              <Descriptions.Item label="Trạng thái hiện tại">
                <Tag color={normalizeStatus(currentInvoiceStatus) === 'PAID' ? 'green' : normalizeStatus(currentInvoiceStatus) === 'UNPAID' ? 'gold' : 'orange'}>
                  {String(currentInvoiceStatus).toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card
              title={<><ApartmentOutlined /> Danh sách phòng trong booking</>}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical" size={8} style={{ marginBottom: 16, width: '100%' }}>
                <Text type="secondary">
                  Không tick phòng nào = in/chốt hóa đơn cho tất cả phòng đã checkout và chưa thanh toán. Phòng đang nằm trong draft khác vẫn chọn được; khi tạo draft mới hệ thống sẽ tách phòng đó sang nhóm đang chọn.
                </Text>
                <Space wrap>
                  <Button
                    type={usingDefaultAllUnpaid ? 'primary' : 'default'}
                    onClick={handleClearSelection}
                  >
                    Không chọn: lấy tất cả đã checkout/chưa thanh toán
                  </Button>
                  <Button
                    onClick={handleSelectAllUnpaid}
                    disabled={!normalizedDetails.length}
                  >
                    Tick tất cả phòng đủ điều kiện
                  </Button>
                </Space>
              </Space>

              <Row gutter={[12, 12]}>
                {normalizedDetails.map((detail) => {
                  const selected = explicitSelectedDetailIds.includes(detail.bookingDetailId);
                  const detailTotal = detail.roomCharge + detail.serviceCharge + detail.damageCharge;
                  const paid = normalizeStatus(detail.settlementStatus) === 'PAID';
                  const selectable = !paid && (detail.canCreateInvoice || detail.openInvoiceId);

                  return (
                    <Col xs={24} sm={12} lg={8} key={detail.bookingDetailId}>
                      <Card
                        hoverable={selectable}
                        size="small"
                        onClick={() => selectable && handleToggleDetail(detail)}
                        style={{
                          borderColor: selected ? '#1677ff' : '#f0f0f0',
                          boxShadow: selected ? '0 0 0 1px rgba(22,119,255,0.15)' : 'none',
                          cursor: selectable ? 'pointer' : 'not-allowed',
                          opacity: selectable ? 1 : 0.72,
                        }}
                      >
                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Space>
                              <Checkbox
                                checked={selected}
                                disabled={!selectable}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => handleToggleDetail(detail)}
                              />
                              <Text strong>Phòng {detail.roomNumber}</Text>
                            </Space>
                            <Text type="secondary">#{detail.bookingDetailId}</Text>
                          </Space>

                          <Space wrap>
                            {selected ? <Tag color="blue">ĐANG CHỌN</Tag> : null}
                            {paid ? <Tag color="green">ĐÃ THANH TOÁN</Tag> : null}
                            {detail.openInvoiceId ? <Tag color="orange">{detail.openInvoiceCode || `DRAFT #${detail.openInvoiceId}`}</Tag> : null}
                            {!paid && detail.canCreateInvoice ? <Tag color="blue">CÓ THỂ LẬP HĐ</Tag> : null}
                            {!paid && !detail.canCreateInvoice && !detail.openInvoiceId ? <Tag color="red">{detail.blockReason || 'CHƯA ĐỦ ĐIỀU KIỆN'}</Tag> : null}
                          </Space>

                          <Text type="secondary">Check-out: {detail.checkoutStatus || '-'}</Text>
                          <Text type="secondary">Tạm tính phần phòng này: {formatVND(detailTotal)}</Text>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>

            {blockedSelectedRows.length ? (
              <Alert
                style={{ marginBottom: 16 }}
                type="warning"
                showIcon
                message="Nhóm phòng đang chọn có phòng chưa đủ điều kiện lập hóa đơn"
                description={blockedSelectedRows.map((row) => `${row.roomNumber}: ${row.blockReason || 'Chưa checkout'}`).join(' • ')}
              />
            ) : null}

            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
              <Title level={5}>
                <GiftOutlined style={{ color: '#52c41a' }} /> Áp voucher cho booking
              </Title>
              <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    prefix={<TagsOutlined />}
                    placeholder="Nhập mã voucher"
                    allowClear
                  />
                </Col>
                <Col>
                  <Space wrap>
                    <Button type="primary" onClick={() => handleApplyVoucher(false)} loading={applyingVoucher}>
                      Áp dụng voucher
                    </Button>
                    <Button onClick={() => handleApplyVoucher(true)} disabled={!(voucherCode || getValue(bookingDraft, 'voucherCode', 'VoucherCode'))} loading={applyingVoucher}>
                      Bỏ voucher
                    </Button>
                  </Space>
                </Col>
              </Row>

              {getValue(bookingDraft, 'voucherCode', 'VoucherCode') ? (
                <Text type="success">
                  Voucher đang áp dụng: <b>{getValue(bookingDraft, 'voucherCode', 'VoucherCode')}</b>
                </Text>
              ) : (
                <Text type="secondary">Booking hiện chưa áp dụng voucher.</Text>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <Title level={5}>
                <HomeOutlined /> Tiền phòng
              </Title>
              <Row justify="space-between">
                <Col>
                  <Text>Tổng tiền các phòng đang chọn:</Text>
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
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
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
                      disabled={!actionInvoiceId || savingDamage}
                    />
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveDamage}
                      loading={savingDamage}
                      disabled={!actionInvoiceId}
                    >
                      Lưu
                    </Button>
                  </Space>
                </Col>
              </Row>
              {!actionInvoiceId && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  Tạo hóa đơn nháp đúng nhóm phòng đang chọn trước, rồi mới sửa trực tiếp phí đền bù.
                </Text>
              )}

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

              <Row justify="space-between" style={{ marginTop: 10 }}>
                <Col>
                  <Text strong>Tổng tiền hóa đơn:</Text>
                </Col>
                <Col>
                  <Text strong>{formatVND(grossTotal)}</Text>
                </Col>
              </Row>

              <Row justify="space-between" style={{ marginTop: 10 }}>
                <Col>
                  <Text strong type="warning">Tiền cọc đã thu:</Text>
                </Col>
                <Col>
                  <Text strong type="warning">-{formatVND(depositAmount)}</Text>
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
        )}
      </Spin>
    </Modal>
  );
};

export default DraftInvoiceModal;
