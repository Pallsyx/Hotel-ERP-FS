import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, message, Input, Select, Form, Switch, Tooltip, Row, Col, Modal } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ClearOutlined, CheckCircleOutlined } from '@ant-design/icons';
import userApi from '../../api/userApi';

const { Option } = Select;

// MAPPING QUYỀN HẠN TỪ DATABASE (Đồng bộ 100% với file SQL)
const ROLE_PERMISSIONS_MAP = {
  'Admin': [
    'Xem Dashboard (VIEW_DASHBOARD)', 'Quản lý người dùng (MANAGE_USERS)', 'Quản lý phân quyền (MANAGE_ROLES)',
    'Quản lý phòng (MANAGE_ROOMS)', 'Quản lý đặt phòng (MANAGE_BOOKINGS)', 'Quản lý hóa đơn (MANAGE_INVOICES)',
    'Quản lý dịch vụ (MANAGE_SERVICES)', 'Xem báo cáo (VIEW_REPORTS)', 'Quản lý nội dung (MANAGE_CONTENT)', 'Quản lý kho/vật tư (MANAGE_INVENTORY)'
  ],
  'Manager': [
    'Xem Dashboard (VIEW_DASHBOARD)', 'Quản lý phòng (MANAGE_ROOMS)', 'Quản lý đặt phòng (MANAGE_BOOKINGS)',
    'Quản lý hóa đơn (MANAGE_INVOICES)', 'Quản lý dịch vụ (MANAGE_SERVICES)', 'Xem báo cáo (VIEW_REPORTS)', 'Quản lý kho/vật tư (MANAGE_INVENTORY)'
  ],
  'Receptionist': [
    'Xem Dashboard (VIEW_DASHBOARD)', 'Quản lý phòng (MANAGE_ROOMS)', 'Quản lý đặt phòng (MANAGE_BOOKINGS)',
    'Quản lý hóa đơn (MANAGE_INVOICES)', 'Quản lý dịch vụ (MANAGE_SERVICES)'
  ],
  'Accountant': [
    'Xem Dashboard (VIEW_DASHBOARD)', 'Quản lý hóa đơn (MANAGE_INVOICES)', 'Xem báo cáo (VIEW_REPORTS)'
  ],
  'Housekeeping': [
    'Quản lý phòng (MANAGE_ROOMS)', 'Quản lý kho/vật tư (MANAGE_INVENTORY)'
  ]
};

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm(); 

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  
  const [isViewRoleOpen, setIsViewRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 1. TẢI DỮ LIỆU TỪ DATABASE
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      const data = response.data?.data || response.data;
      setAllUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. LỌC DỮ LIỆU
  const handleSearch = (values) => {
    let result = [...allUsers];
    if (values.keyword) {
      const kw = values.keyword.toLowerCase();
      result = result.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
        (u.email && u.email.toLowerCase().includes(kw)) ||
        (u.phone && u.phone.toLowerCase().includes(kw))
      );
    }
    if (values.roleName) {
      result = result.filter(u => u.roleName === values.roleName);
    }
    if (values.status !== undefined) {
      result = result.filter(u => u.status === values.status);
    }
    setFilteredUsers(result);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredUsers(allUsers);
  };

  // 3. KHÓA TÀI KHOẢN
  const handleToggleStatus = async (user, checked) => {
    if (!checked) {
      try {
        await userApi.delete(user.id);
        message.success('Đã vô hiệu hóa tài khoản!');
        fetchUsers();
      } catch (err) {
        message.error('Lỗi khi khóa tài khoản!');
      }
    } else {
      message.warning('Backend chưa có API mở khóa riêng!');
    }
  };

  // 4. GỌI API THÊM NHÂN VIÊN
  const handleAddSubmit = async (values) => {
    try {
      message.loading({ content: 'Đang lưu vào Database...', key: 'add_user' });
      
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || "",
        roleId: Number(values.roleId) 
      };

      await userApi.create(payload); 
      
      message.success({ content: 'Tạo tài khoản thành công!', key: 'add_user' });
      setIsAddModalOpen(false); 
      addForm.resetFields();    
      
      fetchUsers(); 
    } catch (error) {
      let errorMsg = 'Có lỗi xảy ra khi tạo tài khoản!';
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.code === "VALIDATION_ERROR" && data.details) {
            errorMsg = data.details.map(err => `${err.field}: ${err.errors.join(', ')}`).join(' | ');
        } else if (data.message) {
            errorMsg = data.message;
        }
      }
      message.error({ content: errorMsg, key: 'add_user', duration: 5 });
    }
  };

  // 5. CẤU HÌNH CỘT
  const columns = [
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', fontWeight: 'bold' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (phone) => phone ? phone : <span style={{color: '#ccc', fontStyle: 'italic'}}>Chưa cập nhật</span>
    },
    {
      title: 'Vai trò', dataIndex: 'roleName', key: 'roleName',
      render: (role) => {
        let color = 'default';
        if (role === 'Admin') color = 'red';
        else if (role === 'Manager') color = 'green';
        else if (role === 'Receptionist') color = 'orange';
        else if (role === 'Accountant') color = 'purple';
        else if (role === 'Housekeeping') color = 'cyan';
        else if (role === 'Security') color = 'blue';
        return <Tag color={color}>{role || 'Chưa phân quyền'}</Tag>;
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center',
      render: (status, record) => (
        <Switch
          checked={status}
          checkedChildren="Hoạt động" unCheckedChildren="Đã khóa"
          style={{ backgroundColor: status ? '#52c41a' : '#ff4d4f' }}
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    {
      title: 'Hành động', key: 'action', align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết quyền hạn">
            <Button type="default" icon={<EyeOutlined />} size="small" onClick={() => { setSelectedUser(record); setIsViewRoleOpen(true); }} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="primary" icon={<EditOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="keyword" label="Tìm kiếm (Tên, Email, SĐT)">
                <Input placeholder="Nhập từ khóa..." prefix={<SearchOutlined />} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="roleName" label="Vai trò">
                <Select placeholder="Tất cả vai trò" allowClear>
                  <Option value="Admin">Admin</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Receptionist">Receptionist</Option>
                  <Option value="Accountant">Accountant</Option>
                  <Option value="Housekeeping">Housekeeping</Option>
                  <Option value="Security">Security</Option>
                  <Option value="Chef">Chef</Option>
                  <Option value="Waiter">Waiter</Option>
                  <Option value="IT Support">IT Support</Option>
                  <Option value="Guest">Guest</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Tất cả trạng thái" allowClear>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Ngừng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '24px' }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Lọc</Button>
                <Button onClick={handleReset} icon={<ClearOutlined />}>Xóa lọc</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="DANH SÁCH NHÂN SỰ" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>Thêm nhân viên</Button>}>
        <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
      </Card>

      {/* MODAL THÊM NHÂN VIÊN */}
      <Modal title="THÊM NHÂN VIÊN MỚI" open={isAddModalOpen} onCancel={() => { setIsAddModalOpen(false); addForm.resetFields(); }} footer={null}>
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Nhập họ và tên..." />
          </Form.Item>
          <Form.Item name="email" label="Email đăng nhập" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
            <Input placeholder="Nhập địa chỉ email..." />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password placeholder="Nhập mật khẩu..." />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại (SĐT)">
            <Input placeholder="Nhập số điện thoại..." />
          </Form.Item>
          <Form.Item name="roleId" label="Phân quyền (Vai trò)" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder="Chọn vai trò cho nhân viên">
              <Option value={1}>Admin</Option>
              <Option value={2}>Manager</Option>
              <Option value={3}>Receptionist</Option>
              <Option value={4}>Accountant</Option>
              <Option value={5}>Housekeeping</Option>
              <Option value={6}>Security</Option>
              <Option value={7}>Chef</Option>
              <Option value={8}>Waiter</Option>
              <Option value={9}>IT Support</Option>
              <Option value={10}>Guest</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => { setIsAddModalOpen(false); addForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu vào Database</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT QUYỀN HẠN (Đã sửa để render động) */}
      <Modal 
        title={`DANH SÁCH QUYỀN HẠN: ${selectedUser?.roleName || 'CHƯA CÓ'}`} 
        open={isViewRoleOpen} 
        onCancel={() => setIsViewRoleOpen(false)} 
        footer={[<Button key="close" type="primary" onClick={() => setIsViewRoleOpen(false)}>Đóng</Button>]}
      >
        {selectedUser && (
          <div style={{ fontSize: '15px', lineHeight: '2.5', padding: '10px 0' }}>
            {ROLE_PERMISSIONS_MAP[selectedUser.roleName] ? (
               ROLE_PERMISSIONS_MAP[selectedUser.roleName].map(perm => (
                 <div key={perm}>
                   <CheckCircleOutlined style={{color: '#52c41a', marginRight: '8px'}}/> {perm}
                 </div>
               ))
            ) : (
              <div style={{ color: 'red' }}>Vai trò này chưa được thiết lập quyền hạn đặc biệt trong hệ thống.</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;