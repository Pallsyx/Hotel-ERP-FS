import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Input, Button, Space, Typography, Tooltip, message,
  Modal, Select, InputNumber, Form, Divider, Tag, Badge, Collapse,
  Empty, Spin, Row, Col, Statistic,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, CopyOutlined, PlusOutlined,
  ShoppingCartOutlined, DeleteOutlined, UserOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import bookingManagementApi from '../../api/bookingManagementApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// ============================================================
// STATUS COLOR MAP
// ============================================================
const ORDER_STATUS_COLOR = {
  Pending: 'orange',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

// ============================================================
// MODAL ĐẶT DỊCH VỤ (dùng chung cho in-house và vãng lai)
// ============================================================
const OrderServiceModal = ({ open, onClose, bookingDetailId, guestName, onSuccess }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [qty, setQty] = useState(1);

  // Flatten services từ categories
  const allServices = categories.flatMap(c => c.services.map(s => ({ ...s, categoryName: c.name })));

  // Load dịch vụ khi modal mở
  useEffect(() => {
    if (!open) return;
    setCartItems([]);
    setSelectedServiceId(null);
    setQty(1);
    form.resetFields();

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await bookingManagementApi.getServices();
        if (res.data?.success) setCategories(res.data.data);
      } catch {
        message.error('Không thể tải danh sách dịch vụ.');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [open, form]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleAddToCart = () => {
    if (!selectedServiceId) {
      message.warning('Vui lòng chọn dịch vụ.');
      return;
    }
    const service = allServices.find(s => s.id === selectedServiceId);
    if (!service) return;

    setCartItems(prev => {
      const existing = prev.find(i => i.serviceId === service.id);
      if (existing) {
        return prev.map(i =>
          i.serviceId === service.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, {
        serviceId: service.id,
        serviceName: service.name,
        unitPrice: service.price,
        unit: service.unit || 'lần',
        quantity: qty,
        categoryName: service.categoryName,
      }];
    });
    setSelectedServiceId(null);
    setQty(1);
  };

  const handleRemoveFromCart = (serviceId) => {
    setCartItems(prev => prev.filter(i => i.serviceId !== serviceId));
  };

  const handleQtyChange = (serviceId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev =>
      prev.map(i => i.serviceId === serviceId ? { ...i, quantity: newQty } : i)
    );
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      message.warning('Giỏ hàng trống, vui lòng thêm ít nhất một dịch vụ.');
      return;
    }

    let notes;
    try {
      const values = await form.validateFields();
      notes = values.notes;
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      const guestNameInput = form.getFieldValue('guestName');
      const payload = {
        bookingDetailId: bookingDetailId ?? null,
        guestName: guestNameInput || null,
        items: cartItems.map(i => ({ serviceId: i.serviceId, quantity: i.quantity })),
        notes: notes || null,
      };

      const res = await bookingManagementApi.createOrder(payload);
      if (res.data?.success) {
        message.success(`✅ ${res.data.message}`);
        onSuccess?.();
        onClose();
      } else {
        message.error(res.data?.message || 'Tạo đơn thất bại.');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn.';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isWalkIn = !bookingDetailId;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <ShoppingCartOutlined style={{ color: '#1890ff' }} />
          <span>
            {isWalkIn
              ? 'Đặt dịch vụ – Khách vãng lai'
              : `Đặt dịch vụ – ${guestName || 'Khách đang lưu trú'}`}
          </span>
        </Space>
      }
      width={760}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loadingServices}>
        {/* Thông tin khách vãng lai */}
        {isWalkIn && (
          <Form form={form} layout="vertical">
            <Form.Item name="guestName" label={<Text type="secondary">Tên khách (tùy chọn)</Text>}>
              <Input prefix={<UserOutlined />} placeholder="Không bắt buộc với dịch vụ lẻ" />
            </Form.Item>
          </Form>
        )}

        {/* Chọn dịch vụ */}
        <div style={{ marginBottom: 8 }}>
          <Text strong>Chọn dịch vụ</Text>
        </div>
        <Row gutter={8} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Select
              showSearch
              placeholder="Tìm và chọn dịch vụ..."
              style={{ width: '100%' }}
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              optionFilterProp="label"
              options={categories.flatMap(c =>
                c.services.map(s => ({
                  label: `${s.name} — ${Number(s.price).toLocaleString('vi-VN')}đ/${s.unit || 'lần'}`,
                  value: s.id,
                  category: c.name,
                }))
              )}
              optionRender={(opt) => (
                <div>
                  <div>{opt.data.label}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{opt.data.category}</Text>
                </div>
              )}
            />
          </Col>
          <Col>
            <InputNumber min={1} max={99} value={qty} onChange={v => setQty(v || 1)} style={{ width: 70 }} />
          </Col>
          <Col>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddToCart}>
              Thêm
            </Button>
          </Col>
        </Row>

        {/* Giỏ hàng */}
        {cartItems.length === 0 ? (
          <Empty description="Chưa có dịch vụ nào trong giỏ" style={{ marginBottom: 16 }} />
        ) : (
          <>
            <Table
              size="small"
              dataSource={cartItems}
              rowKey="serviceId"
              pagination={false}
              style={{ marginBottom: 12 }}
              columns={[
                {
                  title: 'Dịch vụ',
                  dataIndex: 'serviceName',
                  render: (name, r) => (
                    <div>
                      <div>{name}</div>
                      <Text type="secondary" style={{ fontSize: 11 }}>{r.categoryName}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  align: 'right',
                  render: (v, r) => `${Number(v).toLocaleString('vi-VN')}đ/${r.unit}`,
                },
                {
                  title: 'SL',
                  dataIndex: 'quantity',
                  align: 'center',
                  width: 80,
                  render: (qty, r) => (
                    <InputNumber
                      size="small"
                      min={1}
                      max={99}
                      value={qty}
                      onChange={v => handleQtyChange(r.serviceId, v || 1)}
                      style={{ width: 60 }}
                    />
                  ),
                },
                {
                  title: 'Thành tiền',
                  align: 'right',
                  render: (_, r) => (
                    <Text strong style={{ color: '#1890ff' }}>
                      {Number(r.unitPrice * r.quantity).toLocaleString('vi-VN')}đ
                    </Text>
                  ),
                },
                {
                  title: '',
                  width: 40,
                  render: (_, r) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleRemoveFromCart(r.serviceId)}
                    />
                  ),
                },
              ]}
            />

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Statistic
                title="Tổng tiền"
                value={totalAmount}
                suffix="đ"
                formatter={v => Number(v).toLocaleString('vi-VN')}
                valueStyle={{ color: '#cf1322', fontSize: 20, fontWeight: 700 }}
              />
            </div>
          </>
        )}

        {/* Ghi chú */}
        {!isWalkIn ? (
          <Form form={form} layout="vertical">
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={2} placeholder="Ghi chú thêm cho đơn dịch vụ..." />
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={2} placeholder="Ghi chú thêm cho đơn dịch vụ..." />
            </Form.Item>
          </Form>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            loading={submitting}
            disabled={cartItems.length === 0}
            onClick={handleSubmit}
          >
            Xác nhận đặt dịch vụ
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

// ============================================================
// EXPANDED ROW: Lịch sử đơn dịch vụ của 1 phòng
// ============================================================
const OrderHistoryPanel = ({ bookingDetailId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingDetailId) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await bookingManagementApi.getOrdersByBookingDetail(bookingDetailId);
        if (res.data?.success) setOrders(res.data.data);
      } catch {
        message.error('Không thể tải lịch sử dịch vụ.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [bookingDetailId]);

  if (loading) return <Spin size="small" style={{ display: 'block', margin: '16px auto' }} />;
  if (orders.length === 0)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có đơn dịch vụ nào"
        style={{ margin: '12px 0' }}
      />
    );

  return (
    <div style={{ padding: '0 16px 8px' }}>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        Lịch sử đơn dịch vụ ({orders.length} đơn)
      </Text>
      <Collapse size="small" ghost>
        {orders.map(order => (
          <Panel
            key={order.id}
            header={
              <Space>
                <Tag color={ORDER_STATUS_COLOR[order.status] || 'default'}>{order.status}</Tag>
                <Text strong>{order.orderCode}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(order.orderDate).format('DD/MM/YYYY HH:mm')}
                </Text>
                <Text strong style={{ color: '#cf1322' }}>
                  {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                </Text>
              </Space>
            }
          >
            <Table
              size="small"
              dataSource={order.items}
              rowKey="serviceId"
              pagination={false}
              columns={[
                { title: 'Dịch vụ', dataIndex: 'serviceName' },
                { title: 'SL', dataIndex: 'quantity', align: 'center', width: 60 },
                {
                  title: 'Đơn giá', dataIndex: 'unitPrice', align: 'right',
                  render: v => `${Number(v).toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Thành tiền', dataIndex: 'lineTotal', align: 'right',
                  render: v => <Text strong>{Number(v).toLocaleString('vi-VN')}đ</Text>,
                },
              ]}
            />
            {order.notes && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                Ghi chú: {order.notes}
              </Text>
            )}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT: InHouse
// ============================================================
const InHouse = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState({ bookingDetailId: null, guestName: '' });

  // Walk-in POS modal
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);

  const fetchInHouse = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingManagementApi.getInHouseGuests();
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách đang lưu trú:', error);
      message.error('Không thể tải dữ liệu khách đang lưu trú.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInHouse();
  }, [fetchInHouse]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã booking');
  };

  const openOrderModal = (record) => {
    const detail = record.details?.[0];
    setModalTarget({
      bookingDetailId: detail?.id ?? null,
      guestName: record.guestName,
    });
    setModalOpen(true);
  };

  const filteredData = data.filter((item) => {
    const detail = item.details?.[0];
    return (
      item.guestName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      detail?.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Phòng',
      key: 'roomName',
      render: (_, record) => (
        <Typography.Text strong style={{ color: '#1890ff' }}>
          {record.details?.[0]?.roomNumber || 'Chưa xếp phòng'}
        </Typography.Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customerName',
      render: (_, record) => record.guestName,
    },
    {
      title: 'Mã Booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (text) => (
        <Space>
          <Typography.Text>{text}</Typography.Text>
          {text && (
            <Tooltip title="Copy">
              <CopyOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => handleCopy(text)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Hạng phòng',
      key: 'roomType',
      render: (_, record) => record.details?.[0]?.roomTypeName,
    },
    {
      title: 'Giờ Check-in thực tế',
      key: 'actualCheckIn',
      render: (_, record) => {
        const date = record.details?.[0]?.actualCheckInAt;
        return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
      },
    },
    {
      title: 'Dự kiến Check-out',
      key: 'expectedCheckOut',
      render: (_, record) => {
        const date = record.details?.[0]?.checkOutDate;
        return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '';
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết booking">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate('/admin/bookings/' + record.bookingCode)}
            />
          </Tooltip>
          <Tooltip title="Đặt dịch vụ cho khách">
            <Button
              icon={<ShoppingCartOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => openOrderModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xem lịch sử dịch vụ">
            <Button
              icon={<UnorderedListOutlined />}
              size="small"
              onClick={() => {
                // trigger expandedRowKeys bằng cách dùng record key
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Khách đang lưu trú (In-House)</Title>}
        bordered={false}
        style={{ margin: 24, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        extra={
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => setWalkInModalOpen(true)}
          >
            Khách vãng lai – Đặt dịch vụ
          </Button>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo Số phòng, Tên khách, Mã Booking..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có dữ liệu' }}
          expandable={{
            expandedRowRender: (record) => (
              <OrderHistoryPanel bookingDetailId={record.details?.[0]?.id} />
            ),
            rowExpandable: (record) => !!record.details?.[0]?.id,
            expandRowByClick: false,
          }}
        />
      </Card>

      {/* Modal đặt dịch vụ cho khách in-house */}
      <OrderServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        bookingDetailId={modalTarget.bookingDetailId}
        guestName={modalTarget.guestName}
        onSuccess={fetchInHouse}
      />

      {/* Modal đặt dịch vụ POS cho khách vãng lai */}
      <OrderServiceModal
        open={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        bookingDetailId={null}
        guestName={null}
        onSuccess={() => message.success('Đơn vãng lai đã được ghi nhận.')}
      />
    </>
  );
};

export default InHouse;
