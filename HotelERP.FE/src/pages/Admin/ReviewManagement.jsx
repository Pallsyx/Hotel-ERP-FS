import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Input, Tag, message,
  Rate, Avatar, Tooltip, Badge, Popconfirm, Select
} from 'antd';
import {
  CheckOutlined, EyeInvisibleOutlined, DeleteOutlined,
  ReloadOutlined, StarFilled, UserOutlined, FilterOutlined
} from '@ant-design/icons';
import reviewApi from '../../api/reviewApi';

const { TextArea } = Input;
const { Option } = Select;

const STATUS_COLORS = {
  APPROVED: { color: 'success',  label: 'Đã duyệt' },
  PENDING:  { color: 'warning',  label: 'Chờ duyệt' },
  HIDDEN:   { color: 'error',    label: 'Đã ẩn'     },
};

export default function ReviewManagement() {
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Hide modal state
  const [hideModal, setHideModal]     = useState(false);
  const [hideTarget, setHideTarget]   = useState(null);
  const [hideReason, setHideReason]   = useState('');
  const [hideLoading, setHideLoading] = useState(false);

  // Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [detailReview, setDetailReview] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllForAdmin();
      setReviews(res.data || []);
    } catch {
      message.error('Không thể tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      await reviewApi.approve(id);
      message.success('Đã duyệt đánh giá!');
      setReviews(prev => prev.map(r => r.id === id
        ? { ...r, isApproved: true, status: 'APPROVED' } : r));
    } catch {
      message.error('Lỗi khi duyệt đánh giá!');
    }
  };

  const openHideModal = (review) => {
    setHideTarget(review);
    setHideReason('');
    setHideModal(true);
  };

  const handleConfirmHide = async () => {
    if (!hideReason.trim()) {
      message.warning('Vui lòng nhập lý do ẩn!');
      return;
    }
    setHideLoading(true);
    try {
      await reviewApi.hide(hideTarget.id, hideReason);
      message.success('Đã ẩn đánh giá và ghi log kiểm toán!');
      setReviews(prev => prev.map(r => r.id === hideTarget.id
        ? { ...r, isApproved: false, status: 'HIDDEN' } : r));
      setHideModal(false);
    } catch {
      message.error('Lỗi khi ẩn đánh giá!');
    } finally {
      setHideLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewApi.delete(id);
      message.success('Đã xoá vĩnh viễn đánh giá!');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      message.error('Lỗi khi xoá đánh giá!');
    }
  };

  // Stats
  const stats = {
    total:    reviews.length,
    pending:  reviews.filter(r => r.status === 'PENDING').length,
    approved: reviews.filter(r => r.status === 'APPROVED').length,
    hidden:   reviews.filter(r => r.status === 'HIDDEN').length,
  };

  // Filter
  const filtered = filterStatus === 'ALL'
    ? reviews
    : reviews.filter(r => r.status === filterStatus);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: v => <span style={{ color: '#8c8c8c', fontSize: 12 }}>#{v}</span>
    },
    {
      title: 'Khách hàng',
      key: 'user',
      width: 160,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<UserOutlined />} size={32}
            style={{ background: r.userId ? '#1890ff' : '#d9d9d9', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>
              {r.user?.fullName || `Khách #${r.userId || '?'}`}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.user?.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại phòng',
      key: 'roomType',
      width: 140,
      render: (_, r) => (
        <span style={{ fontSize: 13 }}>{r.roomType?.name || `ID ${r.roomTypeId}`}</span>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      sorter: (a, b) => a.rating - b.rating,
      render: v => (
        <Rate disabled value={v} character={<StarFilled />}
          style={{ fontSize: 14, color: v >= 4 ? '#fadb14' : v >= 3 ? '#fa8c16' : '#ff4d4f' }} />
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (v, r) => (
        <div>
          <div style={{
            maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', fontSize: 13, cursor: 'pointer', color: '#1890ff'
          }} onClick={() => { setDetailReview(r); setDetailModal(true); }}>
            {v || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Không có nội dung</span>}
          </div>
          {r.imageUrl && (
            <img src={r.imageUrl} alt="review" style={{
              width: 48, height: 48, objectFit: 'cover', borderRadius: 4, marginTop: 4
            }} />
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => {
        const cfg = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      render: (_, r) => (
        <Space size={4}>
          {r.status !== 'APPROVED' && (
            <Tooltip title="Duyệt">
              <Button type="text" size="small" icon={<CheckOutlined />}
                style={{ color: '#52c41a' }} onClick={() => handleApprove(r.id)} />
            </Tooltip>
          )}
          {r.status !== 'HIDDEN' && (
            <Tooltip title="Ẩn (kèm lý do)">
              <Button type="text" size="small" icon={<EyeInvisibleOutlined />}
                style={{ color: '#fa8c16' }} onClick={() => openHideModal(r)} />
            </Tooltip>
          )}
          <Popconfirm
            title="Xoá vĩnh viễn đánh giá này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(r.id)}
            okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xoá vĩnh viễn">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Kiểm duyệt Đánh giá Khách hàng</h2>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 13 }}>
            Duyệt, ẩn hoặc xoá các đánh giá từ khách lưu trú
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReviews} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng', value: stats.total, color: '#1890ff', bg: '#e6f7ff' },
          { label: 'Chờ duyệt', value: stats.pending, color: '#fa8c16', bg: '#fff7e6' },
          { label: 'Đã duyệt', value: stats.approved, color: '#52c41a', bg: '#f6ffed' },
          { label: 'Đã ẩn', value: stats.hidden, color: '#ff4d4f', bg: '#fff1f0' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.color}33`,
            borderRadius: 8, padding: '10px 20px', minWidth: 110,
          }}>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FilterOutlined style={{ color: '#8c8c8c' }} />
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }} size="small">
          <Option value="ALL">Tất cả trạng thái</Option>
          <Option value="PENDING">Chờ duyệt</Option>
          <Option value="APPROVED">Đã duyệt</Option>
          <Option value="HIDDEN">Đã ẩn</Option>
        </Select>
        {stats.pending > 0 && (
          <Badge count={stats.pending} style={{ backgroundColor: '#fa8c16' }}>
            <span style={{ fontSize: 12, color: '#fa8c16', fontWeight: 500 }}>
              review đang chờ duyệt
            </span>
          </Badge>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 15, showTotal: (t) => `${t} đánh giá` }}
        rowClassName={r => r.status === 'PENDING' ? 'review-row-pending' : ''}
        scroll={{ x: 900 }}
      />

      {/* Hide Modal */}
      <Modal
        title={<span><EyeInvisibleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />Ẩn đánh giá</span>}
        open={hideModal}
        onOk={handleConfirmHide}
        onCancel={() => setHideModal(false)}
        okText="Xác nhận ẩn"
        okButtonProps={{ danger: true, loading: hideLoading }}
        cancelText="Huỷ"
      >
        <p>Bạn đang ẩn đánh giá của khách <b>{hideTarget?.user?.fullName || `#${hideTarget?.userId}`}</b>.</p>
        <p style={{ color: '#8c8c8c', fontSize: 12 }}>Lý do sẽ được ghi vào Audit Log hệ thống.</p>
        <TextArea
          rows={3}
          value={hideReason}
          onChange={e => setHideReason(e.target.value)}
          placeholder="Ví dụ: Nội dung không phù hợp, vi phạm quy định..."
          showCount maxLength={300}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={520}
      >
        {detailReview && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar icon={<UserOutlined />} size={48}
                style={{ background: detailReview.userId ? '#1890ff' : '#d9d9d9' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{detailReview.user?.fullName || `Khách #${detailReview.userId}`}</div>
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>{detailReview.user?.email}</div>
              </div>
            </div>
            <Rate disabled value={detailReview.rating} style={{ marginBottom: 12 }} />
            <p style={{ background: '#fafafa', padding: 12, borderRadius: 6, fontSize: 14 }}>
              {detailReview.comment || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Không có nội dung</span>}
            </p>
            {detailReview.imageUrl && (
              <img src={detailReview.imageUrl} alt="review"
                style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
            )}
            <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 12 }}>
              Gửi lúc: {detailReview.createdAt ? new Date(detailReview.createdAt).toLocaleString('vi-VN') : '—'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}