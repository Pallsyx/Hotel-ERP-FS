import React, { useState, useEffect } from 'react';
import { Card, Input, Button, message, Spin, Empty, Typography, Modal, Form, InputNumber, Upload } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, SearchOutlined, WarningOutlined, CameraOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const InventoryChecklist = () => {
  const { id } = useParams();
  const roomId = id;
  const navigate = useNavigate();
  const location = useLocation();
  const roomNumber = location.state?.roomNumber || 'Unknown';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (roomId) fetchInventory();
  }, [roomId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/rooms/${roomId}/inventories`);
      setItems(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách vật tư!");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFinishCleaning = async () => {
    try {
      await axiosClient.patch(`/rooms/${roomId}/cleaning-status`, { 
        NewCleaningStatus: 'CLEAN' 
      });
      message.success("Đã hoàn tất dọn phòng!");
      navigate('/admin/housekeeping');
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái phòng.");
    }
  };

  const openDamageModal = (item) => {
    setSelectedItem(item);
    form.setFieldsValue({
      ItemName: item.itemName,
      Quantity: 1,
      PenaltyAmount: 0,
      Reason: ''
    });
    setIsModalOpen(true);
  };

  const handleReportDamage = async (values) => {
    try {
      const formData = new FormData();
      formData.append('ItemName', values.ItemName);
      formData.append('Quantity', values.Quantity);
      formData.append('PenaltyAmount', values.PenaltyAmount);
      formData.append('Description', values.Reason || ''); 
      
      if (values.EvidenceImage?.fileList?.[0]?.originFileObj) {
        formData.append('EvidenceImage', values.EvidenceImage.fileList[0].originFileObj);
      }

      await axiosClient.post(`/rooms/${roomId}/damages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success("Đã gửi biên bản báo hỏng thành công!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi gửi báo cáo!";
      message.error(errorMsg);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/housekeeping')} style={{ fontSize: '18px' }} />
        <Title level={4} style={{ margin: 0, marginLeft: 8, fontSize: '18px' }}>Checklist: {roomNumber}</Title>
      </div>

      <div style={{ marginBottom: '16px', paddingLeft: '8px' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>Trạng thái: </Text>
        <Text strong style={{ color: '#d46b08', fontSize: '14px' }}>Đang kiểm tra</Text>
      </div>

      <Button 
        type="primary" 
        block 
        size="large" 
        icon={<CheckCircleOutlined />}
        style={{ 
          backgroundColor: '#52c41a', 
          borderColor: '#52c41a', 
          marginBottom: '24px', 
          height: '48px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '8px'
        }}
        onClick={handleFinishCleaning}
      >
        Hoàn tất (Sạch sẽ)
      </Button>

      <Title level={5} style={{ marginBottom: '12px', paddingLeft: '8px', fontSize: '15px' }}>Danh sách đồ đạc:</Title>
      
      <Input 
        placeholder="Tìm nhanh vật tư..." 
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        style={{ marginBottom: '16px', borderRadius: '8px', height: '40px' }}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
      />

      <Spin spinning={loading}>
        <div style={{ paddingBottom: '40px' }}>
          {filteredItems.map(item => (
            <Card 
              key={item.id} 
              size="small" 
              style={{ 
                marginBottom: '12px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: '1px solid #e8e8e8'
              }}
              styles={{ body: { padding: '12px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '14px', color: '#1f1f1f' }}>{item.itemName}</Text>
                <Text style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '13px' }}>SL: {item.quantity}</Text>
              </div>
              <Button 
                danger 
                block 
                icon={<WarningOutlined />}
                style={{ 
                  backgroundColor: '#a8071a', 
                  borderColor: '#a8071a', 
                  color: '#fff', 
                  fontWeight: '600',
                  borderRadius: '6px',
                  height: '36px'
                }}
                onClick={() => openDamageModal(item)}
              >
                Báo hỏng / Mất
              </Button>
            </Card>
          ))}
          {filteredItems.length === 0 && !loading && (
            <Empty description="Không tìm thấy vật tư" style={{ marginTop: '30px' }} />
          )}
        </div>
      </Spin>

      <Modal
        title={`Báo hỏng: ${selectedItem?.itemName}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleReportDamage}>
          <Form.Item label="Tên vật tư hỏng/mất" name="ItemName" rules={[{ required: true }]}>
            <Input placeholder="Vd: Vỡ cốc, rách khăn..." disabled />
          </Form.Item>
          <Form.Item label="Số lượng" name="Quantity" rules={[{ required: true }]} initialValue={1}>
            <InputNumber min={1} max={selectedItem?.quantity || 1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Phạt tiền dự kiến (VNĐ)" name="PenaltyAmount" rules={[{ required: true }]} initialValue={0}>
            <InputNumber min={0} step={10000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Ghi chú" name="Reason">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Ảnh hiện trường" name="EvidenceImage">
            <Upload beforeUpload={() => false} maxCount={1} listType="picture-card">
              <div><CameraOutlined /><div style={{ marginTop: 8 }}>Chụp ảnh</div></div>
            </Upload>
          </Form.Item>
          <Button type="primary" danger block htmlType="submit" style={{ height: '40px', fontWeight: 'bold', borderRadius: '6px' }}>
            Gửi Biên Bản
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryChecklist;