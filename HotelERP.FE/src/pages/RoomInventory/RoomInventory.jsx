import React, { useState, useEffect } from 'react';
import {
  Table,
  Select,
  Button,
  Space,
  Typography,
  Card,
  ConfigProvider,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import InventoryModal from './components/InventoryModal';
import { roomInventoryApi } from '../../api/roomInventoryApi';

const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const fetchRooms = async () => {
    try {
      const res = await roomInventoryApi.getRooms();

      let roomList = [];
      if (Array.isArray(res?.data?.data)) roomList = res.data.data;
      else if (Array.isArray(res?.data)) roomList = res.data;
      else if (Array.isArray(res)) roomList = res;

      setRooms(roomList);

      if (roomList.length > 0 && !selectedRoom) {
        setSelectedRoom(roomList[0].id);
      }
    } catch (e) {
      console.error('Lỗi tải phòng:', e);
      message.error('Không tải được danh sách phòng!');
    }
  };

  const fetchInventory = async (roomId) => {
    if (!roomId) {
      setInventory([]);
      return;
    }

    setLoading(true);
    try {
      const res = await roomInventoryApi.getInventoryByRoom(roomId);

      let invList = [];
      if (Array.isArray(res?.data?.data)) invList = res.data.data;
      else if (Array.isArray(res?.data)) invList = res.data;
      else if (Array.isArray(res)) invList = res;

      setInventory(invList);
    } catch (e) {
      console.error('Lỗi tải vật tư:', e);
      const apiMessage =
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        'Lỗi tải vật tư!';
      message.error(apiMessage);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchInventory(selectedRoom);
    } else {
      setInventory([]);
    }
  }, [selectedRoom]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(inventory.length / pagination.pageSize));

    if (pagination.current > maxPage) {
      setPagination((prev) => ({
        ...prev,
        current: maxPage,
      }));
    }
  }, [inventory.length, pagination.pageSize, pagination.current]);

  const handleDelete = async (id) => {
    try {
      await roomInventoryApi.deleteInventory(selectedRoom, id);
      message.success('Đã xóa vật tư!');
      fetchInventory(selectedRoom);
    } catch (e) {
      console.error('Lỗi xóa vật tư:', e);
      const apiMessage =
e?.response?.data?.message ||
        e?.response?.data?.title ||
        'Xóa vật tư thất bại!';
      message.error(apiMessage);
    }
  };

  const columns = [
    {
      title: 'Tên vật tư',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Giá đền bù',
      dataIndex: 'priceIfLost',
      key: 'priceIfLost',
      render: (v) => (
        <b style={{ color: '#b91c1c' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(v || 0)}
        </b>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
    },
    {
      title: 'Xử lý',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa vật tư này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#d4af37' } }}>
      <div style={{ padding: '24px', background: '#fcfbf7', minHeight: '80vh' }}>
        <Card
          title={
            <Typography.Title
              level={3}
              style={{ textAlign: 'center', fontFamily: 'serif', marginBottom: 0 }}
            >
              KIỂM KÊ VẬT TƯ
            </Typography.Title>
          }
        >
          <Space style={{ marginBottom: 20 }}>
            <Select
              placeholder="Chọn phòng..."
              style={{ width: 250 }}
              value={selectedRoom}
              onChange={setSelectedRoom}
              size="large"
              options={rooms.map((r) => ({
                value: r.id,
                label: `Phòng ${r.roomNumber}`,
              }))}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              disabled={!selectedRoom}
              size="large"
              style={{ backgroundColor: '#0f172a', color: '#d4af37' }}
            >
              Thêm Vật Tư
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={inventory}
            rowKey="id"
            loading={loading}
            bordered
            pagination={{
              current: pagination.current,
pageSize: pagination.pageSize,
              total: inventory.length,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              position: ['bottomCenter'],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} vật tư`,
              onChange: (page, pageSize) => {
                setPagination({
                  current: page,
                  pageSize,
                });
              },
            }}
          />
        </Card>

        <InventoryModal
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          roomId={selectedRoom}
          editingItem={editingItem}
          onSuccess={() => fetchInventory(selectedRoom)}
        />
      </div>
    </ConfigProvider>
  );
};

export default RoomInventory;