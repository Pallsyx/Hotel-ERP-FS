import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, Tag, message } from 'antd';
import { CheckOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { TextArea } = Input;

export default function ReviewManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [hideReason, setHideReason] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/Review/admin-all');
      setReviews(response.data || response);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      await axiosClient.put(`/Review/${reviewId}/approve`);
      message.success('Đã duyệt đánh giá!');
      fetchReviews();
    } catch (error) {
      message.error('Lỗi khi duyệt.');
    }
  };

  const showHideModal = (review) => {
    setSelectedReview(review);
    setHideReason('');
    setIsModalVisible(true);
  };

  const handleConfirmHide = async () => {
    if (!hideReason.trim()) {
      message.warning('Vui lòng nhập lý do ẩn!');
      return;
    }
    try {
      await axiosClient.put(`/Review/${selectedReview.id}/hide`, null, {
        headers: {
          'X-Audit-Reason': encodeURIComponent(hideReason)
        }
      });
      message.success('Đã ẩn đánh giá!');
      setIsModalVisible(false);
      fetchReviews();
    } catch (error) {
      message.error('Lỗi khi ẩn đánh giá.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Khách Hàng', dataIndex: 'guestName', key: 'guestName' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: val => `${val} Sao` },
    { title: 'Nội dung', dataIndex: 'comment', key: 'comment' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: status => {
        if(status === 'APPROVED') return <Tag color="success">Đã Duyệt</Tag>;
        if(status === 'HIDDEN') return <Tag color="error">Đã Ẩn</Tag>;
        return <Tag color="warning">Chờ Duyệt</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'PENDING' && (
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
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#fff' }}>
      <h2>Quản lý Đánh giá Khách hàng</h2>
      <Table columns={columns} dataSource={reviews} rowKey="id" loading={loading} />

      {/* Modal nhập lý do ẩn */}
      <Modal 
        title="Xác nhận ẩn đánh giá" 
        open={isModalVisible} 
        onOk={handleConfirmHide} 
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận Ẩn"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn đang ẩn đánh giá của khách <b>{selectedReview?.guestName}</b>.</p>
        <p>Vui lòng cung cấp lý do (Bắt buộc):</p>
        <TextArea 
          rows={4} 
          value={hideReason} 
          onChange={(e) => setHideReason(e.target.value)} 
          placeholder="Ví dụ: Nội dung chứa từ ngữ không phù hợp..."
        />
      </Modal>
    </div>
  );
}