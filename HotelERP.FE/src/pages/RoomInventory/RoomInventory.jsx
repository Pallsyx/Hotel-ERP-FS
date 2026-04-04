import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Typography,
  Card,
  ConfigProvider,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { equipmentApi } from '../../api/equipmentApi';
import EquipmentModal from './components/EquipmentModal';

const RoomInventory = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await equipmentApi.getEquipments({ search: searchText, category });
      let dataList = [];
      if (Array.isArray(res?.data?.data)) dataList = res.data.data;
      else if (Array.isArray(res?.data)) dataList = res.data;
      else if (Array.isArray(res)) dataList = res;

      setEquipments(dataList);
    } catch (e) {
      console.error('Lỗi tải vật tư:', e);
      message.error('Không tải được dữ liệu vật tư!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, category]);

  const handleRefresh = () => {
    setSearchText('');
    setCategory(null);
    fetchEquipments();
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      align: 'center',
      render: (img) => (
        img ? <img src={img} alt="vật tư" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> 
            : <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'inline-block' }} />
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (t, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{t}</div>
          <div style={{ fontSize: 12, color: 'gray' }}>{r.itemCode}</div>
        </div>
      )
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center',
    },
    {
      title: 'Tổng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'center',
      render: (v) => <b style={{ color: '#1890ff' }}>{v}</b>
    },
    {
      title: 'Sẵn kho',
      dataIndex: 'inStockQuantity',
      key: 'inStockQuantity',
      align: 'center',
      render: (v) => <b style={{ color: '#52c41a' }}>{v}</b>
    },
    {
      title: 'Đang dùng',
      dataIndex: 'inUseQuantity',
      key: 'inUseQuantity',
      align: 'center',
      render: (v) => <b style={{ color: '#faad14' }}>{v}</b>
    },
    {
      title: 'Hỏng/Mất',
      dataIndex: 'damagedQuantity',
      key: 'damagedQuantity',
      align: 'center',
      render: (v) => (
        <span style={{ color: v > 0 || v < 0 ? '#ff4d4f' : '#d9d9d9', fontWeight: v > 0 || v < 0 ? 'bold' : 'normal' }}>
          {v}
        </span>
      )
    },
    {
      title: 'Giá đền bù',
      dataIndex: 'defaultPriceIfLost',
      key: 'defaultPriceIfLost',
      render: (v) => (
        <span style={{ color: '#595959' }}>
          {new Intl.NumberFormat('vi-VN', {
             style: 'currency',
             currency: 'VND',
          }).format(v || 0)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
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
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ 
      token: { 
        colorPrimary: '#1677ff',
        colorBgContainer: '#fff',
        borderRadius: 8
      } 
    }}>
      <div style={{ padding: '0 24px 24px', minHeight: '80vh', background: '#f5f5f5' }}>
        <Typography.Title level={4} style={{ color: '#1f2937', marginBottom: 20 }}>
          Danh mục Quản lý Kho vật tư
        </Typography.Title>

        <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space size="middle">
              <Input
                placeholder="Tìm theo tên, mã..."
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Lọc Danh mục"
                style={{ width: 150 }}
                allowClear
                value={category}
                onChange={(v) => setCategory(v)}
                options={[
                  { value: 'Trang thiết bị', label: 'Trang thiết bị' },
                  { value: 'Đồ uống', label: 'Đồ uống' },
                  { value: 'Đồ ăn', label: 'Đồ ăn' },
                  { value: 'Khác', label: 'Khác' },
                ]}
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              style={{ background: '#1677ff' }}
            >
              Thêm vật tư
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={equipments}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: equipments.length,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize });
              },
            }}
          />
        </Card>

        {modalOpen && (
          <EquipmentModal
            open={modalOpen}
            onCancel={() => {
              setModalOpen(false);
              setEditingItem(null);
            }}
            editingItem={editingItem}
            onSuccess={fetchEquipments}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default RoomInventory;