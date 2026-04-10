import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import invoiceApi from '../../../api/invoiceApi';
import DraftInvoiceModal from './DraftInvoiceModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoiceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm) params.searchTerm = searchTerm;
      if (status) params.status = status;
      if (dateRange && dateRange.length === 2) {
        params.fromDate = dateRange[0].format('YYYY-MM-DD');
        params.toDate = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await invoiceApi.getAllInvoices(params);
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);

      if (rows.length === 0) {
        message.info('Không tìm thấy hóa đơn nào khớp với bộ lọc.');
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
    setTimeout(() => fetchInvoices(), 0);
  };

  const openDraftModal = (record) => {
    const bookingId = record?.bookingId ?? record?.BookingId ?? null;
    const bookingDetailId = record?.bookingDetailId ?? record?.BookingDetailId ?? null;

    const rawId =
      record?.invoiceId ??
      record?.InvoiceId ??
      record?.id ??
      record?.Id ??
      null;

    const invoiceId = rawId && Number(rawId) > 0 ? Number(rawId) : null;

    const invoiceStatus =
      record?.invoiceStatus ??
      record?.InvoiceStatus ??
      record?.status ??
      null;

    const customerName = record?.customerName ?? record?.CustomerName ?? 'Khách lẻ';
    const bookingCode = record?.bookingCode ?? record?.BookingCode ?? '';
    const roomNumber = record?.roomNumber ?? record?.RoomNumber ?? '-';

    if (!bookingId) {
      message.warning('Bản ghi này không có Booking ID hợp lệ.');
      return;
    }

    setSelectedRecord({
      bookingId,
      bookingDetailId,
      invoiceId,
      invoiceStatus,
      customerName,
      bookingCode,
      roomNumber,
    });
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      render: (text, record) => (
        <Text
          strong
          style={{
            color: String(record?.status || '').toUpperCase() === 'PAID' ? '#2f54eb' : '#faad14',
          }}
        >
          {text || '(Dự thảo)'}
        </Text>
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => <Text>{text || 'Khách lẻ'}</Text>,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text) => <Text strong>{text || '-'}</Text>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalTotal',
      key: 'finalTotal',
      render: (val, record) => {
        const normalizedStatus = String(record?.status || '').toUpperCase();
        if (normalizedStatus === 'DRAFT') {
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
      render: (status) => {
        let color = 'blue';
        let text = status || 'CHƯA XÁC ĐỊNH';

        const statusMap = {
          PAID: { text: 'Đã thanh toán', color: 'green' },
          DRAFT: { text: 'Dự thảo', color: 'orange' },
          UNPAID: { text: 'Chưa thanh toán', color: 'orange' },
          REFUNDED: { text: 'Đã hoàn tiền', color: 'volcano' },
          CANCELLED: { text: 'Đã hủy', color: 'red' },
          PENDING: { text: 'Chờ xử lý', color: 'gold' },
          COMPLETED: { text: 'Hoàn thành', color: 'cyan' },
        };

        const key = String(status || '').toUpperCase();
        if (statusMap[key]) {
          text = statusMap[key].text;
          color = statusMap[key].color;
        }

        return <Tag color={color}>{String(text).toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="Xem hóa đơn tạm tính">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => openDraftModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh', borderRadius: 8 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý Hóa Đơn
      </Title>

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
              placeholder="Mã HĐ, tên khách hàng, mã booking, số phòng..."
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
        rowKey={(record) => record.rowId || record.id || `${record.bookingId}-${record.bookingDetailId}-${record.invoiceCode || 'draft'}`}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng cộng ${total} kết quả`,
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
