import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Card,
  Tooltip,
  message,
  Alert,
} from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import invoiceApi from '../../../api/invoiceApi';
import DraftInvoiceModal from './DraftInvoiceModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const statusMeta = {
  PAID: { text: 'Đã thanh toán', color: 'green' },
  DRAFT: { text: 'Dự thảo', color: 'orange' },
  UNPAID: { text: 'Chưa thanh toán', color: 'gold' },
  PARTIALLY_PAID: { text: 'Thanh toán một phần', color: 'blue' },
  REFUNDED: { text: 'Đã hoàn tiền', color: 'volcano' },
  CANCELLED: { text: 'Đã hủy', color: 'red' },
  PENDING: { text: 'Chờ xử lý', color: 'gold' },
  COMPLETED: { text: 'Hoàn thành', color: 'cyan' },
};

const InvoiceDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const presetBookingId = searchParams.get('bookingId') || '';

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    setSearchTerm(presetBookingId || '');
    fetchInvoices({ bookingIdOverride: presetBookingId || null, searchTermOverride: presetBookingId || '' });
  }, [presetBookingId]);

  const fetchInvoices = async ({ bookingIdOverride, searchTermOverride } = {}) => {
    try {
      setLoading(true);
      const params = {};

      const effectiveSearchTerm = searchTermOverride !== undefined ? searchTermOverride : searchTerm;
      const effectiveBookingId = bookingIdOverride !== undefined ? bookingIdOverride : presetBookingId;

      if (effectiveSearchTerm) params.searchTerm = effectiveSearchTerm;
      if (status) params.status = status;
      if (effectiveBookingId) params.bookingId = Number(effectiveBookingId);
      if (dateRange && dateRange.length === 2) {
        params.fromDate = dateRange[0].format('YYYY-MM-DD');
        params.toDate = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await invoiceApi.getAllInvoices(params);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);

      if (rows.length === 0) {
        message.info('Không tìm thấy booking/hóa đơn nào khớp với bộ lọc.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      message.error('Không thể kết nối với máy chủ để lấy danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInvoices();
  };

  const handleReset = () => {
    setSearchTerm('');
    setDateRange(null);
    setStatus(undefined);
    if (presetBookingId) {
      setSearchParams({});
      return;
    }
    setTimeout(() => fetchInvoices({ searchTermOverride: '' }), 0);
  };

  const openDraftModal = (record) => {
    const bookingId = record?.bookingId ?? record?.BookingId ?? null;
    const rawInvoiceId = record?.invoiceId ?? record?.InvoiceId ?? null;
    const invoiceId = rawInvoiceId && Number(rawInvoiceId) > 0 ? Number(rawInvoiceId) : null;

    if (!bookingId) {
      message.warning('Bản ghi này không có Booking ID hợp lệ.');
      return;
    }

    setSelectedRecord({
      bookingId,
      bookingDetailId: null,
      invoiceId,
      invoiceStatus: record?.status ?? record?.Status ?? null,
      customerName: record?.customerName ?? record?.CustomerName ?? 'Khách lẻ',
      bookingCode: record?.bookingCode ?? record?.BookingCode ?? '',
      roomNumber: record?.roomNumber ?? record?.RoomNumber ?? '-',
    });
    setModalVisible(true);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Booking ID',
        dataIndex: 'bookingId',
        key: 'bookingId',
        width: 120,
        render: (value) => <Text strong>{value || '-'}</Text>,
      },
      {
        title: 'Mã Booking / Hóa đơn',
        key: 'codes',
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{record?.bookingCode || '-'}</Text>
            <Text
              type="secondary"
              style={{
                color: String(record?.status || '').toUpperCase() === 'PAID' ? '#2f54eb' : undefined,
              }}
            >
              {record?.invoiceCode || '(Tạm tính)'}
            </Text>
          </Space>
        ),
      },
      {
        title: 'Tên khách hàng',
        dataIndex: 'customerName',
        key: 'customerName',
        render: (text) => <Text>{text || 'Khách lẻ'}</Text>,
      },
      {
        title: 'Các phòng trong booking',
        dataIndex: 'roomNumber',
        key: 'roomNumber',
        render: (text) => <Text strong>{text || '-'}</Text>,
      },
      {
        title: 'Số tiền cần xử lý',
        dataIndex: 'finalTotal',
        key: 'finalTotal',
        render: (val, record) => {
          const normalizedStatus = String(record?.status || '').toUpperCase();
          if (normalizedStatus === 'DRAFT' && !Number(val)) {
            return <Text type="secondary">Đang tính toán...</Text>;
          }

          return (
            <Text strong>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(val || 0)}
            </Text>
          );
        },
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value) => {
          const meta = statusMeta[String(value || '').toUpperCase()] || {
            text: value || 'Chưa xác định',
            color: 'default',
          };
          return <Tag color={meta.color}>{String(meta.text).toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 110,
        render: (_, record) => (
          <Tooltip title="Xem hóa đơn tạm tính theo booking">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => openDraftModal(record)}
            />
          </Tooltip>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh', borderRadius: 8 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý Hóa Đơn
      </Title>

      {presetBookingId ? (
        <Alert
          style={{ marginBottom: 16 }}
          type="info"
          showIcon
          message={`Đang hiển thị riêng Booking ID #${presetBookingId} sau thao tác trả phòng.`}
        />
      ) : null}

      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#8c8c8c' }}>Tìm kiếm:</div>
            <Input
              placeholder="Booking ID, mã booking, tên khách, mã hóa đơn, số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#8c8c8c' }}>Trạng thái:</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn trạng thái"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="PAID">Đã thanh toán</Option>
              <Option value="UNPAID">Chưa thanh toán</Option>
              <Option value="PARTIALLY_PAID">Thanh toán một phần</Option>
              <Option value="DRAFT">Dự thảo</Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#8c8c8c' }}>Thời gian tạo:</div>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>

          <Col xs={24} sm={24} md={4}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Lọc
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.rowId || `booking-${record.bookingId}`}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} booking`,
          showSizeChanger: true,
        }}
        className="invoice-table"
      />

      <DraftInvoiceModal
        bookingId={selectedRecord?.bookingId}
        bookingDetailId={selectedRecord?.bookingDetailId}
        invoiceId={selectedRecord?.invoiceId}
        invoiceStatus={selectedRecord?.invoiceStatus}
        initialCustomerName={selectedRecord?.customerName}
        initialBookingCode={selectedRecord?.bookingCode}
        initialRoomNumber={selectedRecord?.roomNumber}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedRecord(null);
        }}
        onChanged={async () => {
          await fetchInvoices();
        }}
      />
    </div>
  );
};

export default InvoiceDashboard;
