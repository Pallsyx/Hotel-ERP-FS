import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  InputNumber,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import InvoiceActionButtons from './components/InvoiceActionButtons';

const { Title, Paragraph, Text } = Typography;

const money = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);

const normalizePayload = (payload = {}, oldRecord = {}) => ({
  key: payload.bookingId ?? payload.BookingId ?? oldRecord.key,
  bookingId: payload.bookingId ?? payload.BookingId ?? oldRecord.bookingId,
  bookingCode: payload.bookingCode ?? payload.BookingCode ?? oldRecord.bookingCode ?? '',
  invoiceId: payload.invoiceId ?? payload.InvoiceId ?? oldRecord.invoiceId,
  invoiceCode: payload.invoiceCode ?? payload.InvoiceCode ?? oldRecord.invoiceCode ?? '',
  invoiceStatus: payload.invoiceStatus ?? payload.InvoiceStatus ?? oldRecord.invoiceStatus ?? 'Draft',
  bookingStatus: payload.bookingStatus ?? payload.BookingStatus ?? oldRecord.bookingStatus ?? '-',
  paymentStatus: payload.paymentStatus ?? payload.PaymentStatus ?? oldRecord.paymentStatus ?? '-',
  finalTotal: payload.finalTotal ?? payload.FinalTotal ?? oldRecord.finalTotal ?? 0,
  updatedAt: payload.updatedAt ?? payload.UpdatedAt ?? new Date().toISOString(),
});

const statusColor = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return 'green';
  if (s === 'DRAFT' || s === 'UNPAID') return 'gold';
  if (s === 'REFUNDED') return 'blue';
  return 'default';
};

const InvoiceManagement = () => {
  const [inputBookingId, setInputBookingId] = useState(null);
  const [rows, setRows] = useState([]);

  const handleAddBooking = () => {
    if (!inputBookingId || inputBookingId <= 0) {
      message.warning('Nhập bookingId hợp lệ trước đã.');
      return;
    }

    const exists = rows.some((x) => x.bookingId === inputBookingId);
    if (exists) {
      message.info('Booking này đã có trong danh sách thao tác.');
      return;
    }

    setRows((prev) => [
      {
        key: inputBookingId,
        bookingId: inputBookingId,
        bookingCode: '',
        invoiceId: null,
        invoiceCode: '',
        invoiceStatus: 'Draft',
        bookingStatus: '-',
        paymentStatus: '-',
        finalTotal: 0,
        updatedAt: null,
      },
      ...prev,
    ]);

    setInputBookingId(null);
  };

  const handleRefresh = () => {
    setRows([]);
    setInputBookingId(null);
  };

  const updateRow = (bookingId, payload) => {
    setRows((prev) =>
      prev.map((item) =>
        item.bookingId === bookingId ? normalizePayload(payload, item) : item
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        title: 'Booking ID',
        dataIndex: 'bookingId',
        key: 'bookingId',
        width: 110,
      },
      {
        title: 'Mã booking',
        dataIndex: 'bookingCode',
        key: 'bookingCode',
        render: (value) => value || <Text type="secondary">Chưa có</Text>,
      },
      {
        title: 'Mã hóa đơn',
        dataIndex: 'invoiceCode',
        key: 'invoiceCode',
        render: (value) => value || <Text type="secondary">Chưa có</Text>,
      },
      {
        title: 'Trạng thái hóa đơn',
        dataIndex: 'invoiceStatus',
        key: 'invoiceStatus',
        render: (value) => <Tag color={statusColor(value)}>{value || 'Draft'}</Tag>,
      },
      {
        title: 'Trạng thái booking',
        dataIndex: 'bookingStatus',
        key: 'bookingStatus',
        render: (value) => value || '-',
      },
      {
        title: 'Thanh toán',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        render: (value) => value || '-',
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'finalTotal',
        key: 'finalTotal',
        render: (value) => <b>{money(value)}</b>,
      },
      {
        title: 'Lần cập nhật cuối',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value) =>
          value ? new Date(value).toLocaleString('vi-VN') : <Text type="secondary">Chưa có</Text>,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 340,
        render: (_, record) => (
          <InvoiceActionButtons
            bookingId={record.bookingId}
            invoiceStatus={record.invoiceStatus}
            onChanged={(payload) => updateRow(record.bookingId, payload)}
          />
        ),
      },
    ],
    [rows]
  );

  return (
    <div style={{ padding: '0 24px 24px', minHeight: '80vh', background: '#f5f5f5' }}>
      <Title level={4} style={{ marginBottom: 12 }}>
        Quản lý hóa đơn • Gói 2
      </Title>

      <Paragraph style={{ marginBottom: 20 }}>
        Trang này là <b>bàn thao tác cho Gói 2</b>. Nó giúp test nhanh 2 luồng:
        thêm phụ phí và chốt hóa đơn. Phần bảng hóa đơn hoàn chỉnh, tìm kiếm, lọc,
        modal draft chi tiết là đất diễn của Gói 1.
      </Paragraph>

      <Card bordered={false} style={{ borderRadius: 8, marginBottom: 20 }}>
        <Space wrap>
          <InputNumber
            min={1}
            value={inputBookingId}
            onChange={setInputBookingId}
            placeholder="Nhập bookingId"
            style={{ width: 180 }}
          />

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
            Thêm booking vào danh sách
          </Button>

          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Xóa danh sách test
          </Button>
        </Space>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Gợi ý seed DB hiện tại có thể test nhanh với bookingId: 2, 3, 4, 7, 8, 10.
          </Text>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Table
          rowKey="bookingId"
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default InvoiceManagement;