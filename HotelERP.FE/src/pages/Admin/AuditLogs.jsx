import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, Button, Typography, Space, Tag, Modal, message, Badge, Tooltip } from 'antd';
import { DownloadOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import auditLogApi from '../../api/auditLogApi';
import roleApi from '../../api/roleApi';

const { Title, Text } = Typography;
const { Option } = Select;

const actionColors = {
  CREATE: 'blue',
  UPDATE: 'orange',
  DELETE: 'red',
  ADDED: 'green'
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    roleName: null,
    day: null,
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters.roleName, filters.day, filters.month, filters.year]);

  const fetchRoles = async () => {
    try {
      const res = await roleApi.getAllRoles();
      if (res.data?.data) {
        setRoles(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load roles', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogApi.getAuditLogs({
        roleName: filters.roleName,
        day: filters.day,
        month: filters.month,
        year: filters.year,
      });
      setLogs(res.data?.data || []);
    } catch (error) {
      message.error('Không thể tải nhật ký hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      message.loading({ content: 'Đang chuẩn bị file xuất...', key: 'exporting' });
      // type 'all' ignores filters except maybe year initially, but the user requested "Xuất toàn bộ server", so we can send empty params
      const params = type === 'all' 
        ? {} 
        : {
            roleName: filters.roleName,
            day: filters.day,
            month: filters.month,
            year: filters.year,
          };
      
      const res = await auditLogApi.exportToExcel(params);
      
      // Axios response blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AuditLogs_${type}_${dayjs().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success({ content: 'Xuất Excel thành công!', key: 'exporting' });
    } catch (error) {
      message.error({ content: 'Có lỗi xảy ra khi xuất file hoặc bạn không có quyền!', key: 'exporting' });
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      width: '15%'
    },
    {
      title: 'Nhân viên / Vai trò',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Text strong>{record.employeeName}</Text>
          <Tag color="geekblue">{record.roleName || 'System'}</Tag>
        </Space>
      ),
      width: '25%'
    },
    {
      title: 'Tóm tắt hoạt động',
      dataIndex: 'summary',
      key: 'summary',
      render: (text) => <Text type="secondary">{text || 'Không có hoạt động nổi bật'}</Text>
    }
  ];

  const expandedRowRender = (record) => {
    const subColumns = [
      {
        title: 'Giờ',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text) => dayjs(text).format('HH:mm:ss'),
        width: '10%'
      },
      {
        title: 'Hành động',
        dataIndex: 'actionType',
        key: 'actionType',
        render: (text) => <Tag color={actionColors[text] || 'default'}>{text}</Tag>,
        width: '15%'
      },
      {
        title: 'Đối tượng',
        dataIndex: 'entityType',
        key: 'entityType',
        width: '15%'
      },
      {
        title: 'Nội dung',
        dataIndex: 'message',
        key: 'message'
      }
    ];

    return (
      <Table 
        columns={subColumns} 
        dataSource={record.events} 
        pagination={false} 
        size="small" 
        rowKey="eventId"
        style={{ margin: '10px 0' }}
      />
    );
  };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          <ReloadOutlined style={{ marginRight: 8, fontSize: 24, color: '#1890ff' }} spin={loading} onClick={fetchLogs} /> 
          Nhật ký hoạt động
        </Title>
        <Space>
          <Button icon={<FilterOutlined />} onClick={() => handleExport('filtered')}>
            Xuất theo bộ lọc
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleExport('all')}>
            Xuất toàn bộ (server)
          </Button>
        </Space>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, background: '#fafafa', padding: 16, borderRadius: 8 }}>
        <Select
          allowClear
          placeholder="Lọc theo vai trò (Role)"
          style={{ width: 220 }}
          value={filters.roleName}
          onChange={(val) => setFilters({ ...filters, roleName: val })}
        >
          {roles.map(r => (
            <Option key={r.id} value={r.name}>{r.name}</Option>
          ))}
        </Select>

        <DatePicker
          placeholder="Lọc theo ngày"
          format="DD/MM/YYYY"
          onChange={(date) => {
            setFilters({ 
              ...filters, 
              day: date ? date.date() : null,
              month: date ? date.month() + 1 : filters.month,
              year: date ? date.year() : filters.year
            });
          }}
        />

        <Select
          placeholder="Chọn tháng"
          value={filters.month}
          onChange={(val) => setFilters({ ...filters, month: val, day: null })}
          allowClear
          style={{ width: 120 }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <Option key={m} value={m}>Tháng {m}</Option>
          ))}
        </Select>

        <Select
          placeholder="Chọn năm"
          value={filters.year}
          onChange={(val) => setFilters({ ...filters, year: val })}
          allowClear
          style={{ width: 120 }}
        >
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <Option key={y} value={y}>{y}</Option>
          ))}
        </Select>


      </div>

      <Table
        className="components-table-demo-nested"
        columns={columns}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.events && record.events.length > 0,
        }}
        dataSource={logs}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default AuditLogs;
