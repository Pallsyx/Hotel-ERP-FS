import React, { useState, useEffect } from 'react';
import { Card, Badge, Drawer, Tabs, Form, Input, InputNumber, Upload, Button, message, Typography, Space, Empty } from 'antd';
import { CameraOutlined, CheckCircleOutlined, WarningOutlined, CoffeeOutlined } from '@ant-design/icons';
import * as signalR from '@microsoft/signalr';
import axiosClient from '../../services/axiosClient';
import InventoryChecklist from './InventoryChecklist';

const { Title, Text } = Typography;

const HousekeepingMobile = () => {
  const [dirtyRooms, setDirtyRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDirtyRooms();
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7100/roomHub") // Đảm bảo port này khớp với BE của bạn
      .withAutomaticReconnect()
      .build();

    const startSignalR = async () => {
      try {
        await connection.start();
        if (isMounted) {
          connection.on("ReceiveRoomStatusUpdate", (roomId, status, cleaningStatus) => {
             if (cleaningStatus === 'DIRTY') {
                 message.warning(`Có phòng vừa trả khách, cần dọn dẹp!`);
                 fetchDirtyRooms(); 
             }
          });
        }
      } catch (err) {
        console.log("SignalR Error: ", err);
      }
    };

    startSignalR();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, []);

  const fetchDirtyRooms = async () => {
    try {
      const res = await axiosClient.get('/api/rooms?CleaningStatus=DIRTY'); 
      setDirtyRooms(res.data.data || res.data); 
    } catch (error) {
      message.error("Không thể tải danh sách phòng cần dọn.");
    }
  };

  const openRoomTasks = (room) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  const handleFinishCleaning = async (roomId) => {
    try {
      await axiosClient.patch(`/api/rooms/${roomId}/cleaning-status`, { 
        NewCleaningStatus: 'CLEAN' 
      });
      message.success("Đã hoàn tất dọn phòng!");
      setIsDrawerOpen(false);
      
      setDirtyRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái phòng.");
    }
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

      await axiosClient.post(`/api/rooms/${selectedRoom.id}/damages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success("Đã gửi biên bản báo hỏng thành công!");
      form.resetFields();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi gửi báo cáo!";
      message.error(errorMsg);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: <span><CheckCircleOutlined /> Dọn dẹp</span>,
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card size="small" style={{ backgroundColor: '#fafafa' }}>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>Thay toàn bộ ga giường và vỏ gối</li>
              <li>Lau dọn nhà vệ sinh & bổ sung amenities</li>
              <li>Hút bụi và lau sàn nhà</li>
              <li>Đổ rác</li>
            </ul>
          </Card>
          <Text type="secondary" style={{ fontStyle: 'italic' }}>
            Vui lòng sang tab "Minibar" để kiểm kê vật tư trước khi hoàn thành.
          </Text>
        </Space>
      ),
    },
    {
      key: '2',
      label: <span><CoffeeOutlined /> Minibar</span>,
      children: (
        <InventoryChecklist 
          roomId={selectedRoom?.id} 
          roomNumber={selectedRoom?.roomNumber} 
          onFinishCleaning={handleFinishCleaning}
        />
      ),
    },
    {
      key: '3',
      label: <span style={{ color: 'red' }}><WarningOutlined /> Báo hỏng</span>,
      children: (
        <Form form={form} layout="vertical" onFinish={handleReportDamage}>
          <Form.Item label="Tên vật tư hỏng/mất" name="ItemName" rules={[{ required: true }]}>
            <Input placeholder="Vd: Vỡ cốc, rách khăn..." />
          </Form.Item>
          <Form.Item label="Số lượng" name="Quantity" rules={[{ required: true }]} initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
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
          <Button type="primary" danger block htmlType="submit">Gửi Biên Bản</Button>
        </Form>
      ),
    }
  ];

  return (
    <div style={{ padding: '16px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Phòng Cần Dọn</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {dirtyRooms.map(room => (
          <Badge.Ribbon text="DIRTY" color="volcano" key={room.id}>
            <Card onClick={() => openRoomTasks(room)} hoverable style={{ borderRadius: 12 }}>
              <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>P.{room.roomNumber}</Title>
              <Text type="secondary">Loại: {room.roomTypeName || 'N/A'}</Text>
            </Card>
          </Badge.Ribbon>
        ))}
        {dirtyRooms.length === 0 && (
          <Empty description="Tất cả các phòng đều sạch sẽ!" />
        )}
      </Space>

      <Drawer
        title={`Nghiệp vụ phòng ${selectedRoom?.roomNumber}`}
        placement="bottom"
        height="85%" 
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        styles={{ body: { padding: '10px 16px' } }}
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Drawer>
    </div>
  );
};

export default HousekeepingMobile;