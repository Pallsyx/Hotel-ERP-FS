import React, { useState, useEffect } from 'react';
import { List, Checkbox, Button, message, Spin, Empty, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axiosClient';

const { Text } = Typography;

const InventoryChecklist = ({ roomId, roomNumber, onFinishCleaning }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (roomId) fetchInventory();
  }, [roomId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/rooms/${roomId}/inventories`);
      setItems(res.data);
      
      const initialChecked = {};
      res.data.forEach(item => initialChecked[item.id] = false);
      setCheckedItems(initialChecked);
    } catch (error) {
      message.error("Lỗi khi tải danh sách vật tư!");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllChecked = items.length === 0 || items.every(item => checkedItems[item.id]);

  return (
    <Spin spinning={loading}>
      <Text strong>Kiểm tra Minibar & Vật tư phòng {roomNumber}:</Text>
      {items.length > 0 ? (
        <List
          style={{ marginTop: 10, marginBottom: 20 }}
          dataSource={items}
          renderItem={item => (
            <List.Item>
              <Checkbox 
                checked={checkedItems[item.id]} 
                onChange={() => handleToggle(item.id)}
              >
                {item.itemName} - Số lượng: {item.quantity}
              </Checkbox>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Phòng này không cấu hình vật tư" style={{ margin: '20px 0' }} />
      )}

      <Button 
        type="primary" 
        block 
        size="large" 
        icon={<CheckOutlined />}
        disabled={!isAllChecked} 
        onClick={() => onFinishCleaning(roomId)}
      >
        XÁC NHẬN & HOÀN TẤT DỌN PHÒNG
      </Button>
    </Spin>
  );
};

export default InventoryChecklist;