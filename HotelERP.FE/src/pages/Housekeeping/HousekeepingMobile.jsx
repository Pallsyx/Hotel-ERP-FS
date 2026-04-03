import React, { useState, useEffect } from 'react';
import { Card, Badge, Drawer, Tabs, Form, Input, InputNumber, Upload, Button, message, Typography, Space, Empty } from 'antd';
import { CameraOutlined, CheckCircleOutlined, WarningOutlined, CoffeeOutlined } from '@ant-design/icons';
import * as signalR from '@microsoft/signalr';
import axiosClient from '../../api/axiosClient';
import InventoryChecklist from './InventoryChecklist';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const HousekeepingMobile = () => {
  const [dirtyRooms, setDirtyRooms] = useState([]);
  const navigate = useNavigate();

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
      const res = await axiosClient.get('/rooms?CleaningStatus=DIRTY'); 
      setDirtyRooms(res.data.data || res.data); 
    } catch (error) {
      message.error("Không thể tải danh sách phòng cần dọn.");
    }
  };

  const openRoomTasks = (room) => {
    navigate(`/admin/housekeeping/room/${room.id}`, { state: { roomNumber: room.roomNumber } });
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f0f2f5', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 16 }}>Phòng Cần Dọn</Title>
      
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
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
    </div>
  );
};

export default HousekeepingMobile;