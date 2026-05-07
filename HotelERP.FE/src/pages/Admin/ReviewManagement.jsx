import React, { useState } from 'react';
import { Table, Button, Space, Modal, Input, Tag, message } from 'antd';
import { CheckOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
// import axiosClient from '../../api/axiosClient';

const { TextArea } = Input;
const { Option } = Select;

const STATUS_COLORS = {
  APPROVED: { color: 'success',  label: 'Đã duyệt' },
  PENDING:  { color: 'warning',  label: 'Chờ duyệt' },
  HIDDEN:   { color: 'error',    label: 'Đã ẩn'     },
};

export default function ReviewManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [hideReason, setHideReason] = useState('');
  
  // Mock Data
  const [reviews, setReviews] = useState([
    { id: 1, guestName: 'Nguyễn Văn A', rating: 5, comment: 'Khách sạn rất tuyệt!', status: 'Pending' },
    { id: 2, guestName: 'Trần Thị B', rating: 1, comment: 'Phòng ồn ào.', status: 'Pending' }
  ]);

  const handleApprove = async (id) => {
    try {
      // await axiosClient.post('/api/reviews/moderate', { reviewId, action: 'Approve' });
      message.success('Đã duyệt đánh giá!');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'Approved' } : r));
    } catch (error) {
      message.error('Lỗi khi duyệt.');
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
      // await axiosClient.post('/api/reviews/moderate', { reviewId: selectedReview.id, action: 'Hide', reason: hideReason });
      message.success('Đã ẩn đánh giá!');
      setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, status: 'Hidden' } : r));
      setIsModalVisible(false);
    } catch (error) {
      message.error('Lỗi khi ẩn đánh giá.');
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
        if(status === 'Approved') return <Tag color="success">Đã Duyệt</Tag>;
        if(status === 'Hidden') return <Tag color="error">Đã Ẩn</Tag>;
        return <Tag color="warning">Chờ Duyệt</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'Pending' && (
            <>
              <Button 
                type="text" 
                icon={<CheckOutlined style={{ color: 'green' }}/>} 
                onClick={() => handleApprove(record.id)}
              >Duyệt</Button>
              <Button 
                type="text" 
                danger 
                icon={<EyeInvisibleOutlined />} 
                onClick={() => showHideModal(record)}
              >Ẩn</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <h2>Quản lý Đánh giá Khách hàng</h2>
      <Table columns={columns} dataSource={reviews} rowKey="id" />

      {/* Modal nhập lý do ẩn */}
      <Modal 
        title="Xác nhận ẩn đánh giá" 
        open={isModalVisible} 
        onOk={handleConfirmHide} 
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận Ẩn"
        okButtonProps={{ danger: true }}
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