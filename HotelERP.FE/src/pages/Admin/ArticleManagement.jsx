import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, message, Popconfirm, Image, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import articleApi from '../../api/articleApi';
import { useAuthStore } from '../../store/authStore';
const { TextArea } = Input;
const { Option } = Select;

export default function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const { user } = useAuthStore();
  const isAdmin = user?.roleName === 'Admin' || user?.role?.name === 'Admin' || user?.role === 'Admin' || user?.roleId === 1;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await articleApi.getAllForAdmin();
      setArticles(response.data);
    } catch (error) {
      // message.error('Lỗi khi tải danh sách bài viết!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    setLoading(true);
    try {
      // Lấy chi tiết bài viết (để có trường Content)
      const response = await articleApi.getBySlug(record.slug);
      const detail = response.data;
      setEditingId(detail.id);
      
      form.setFieldsValue({
        Title: detail.title,
        CategoryName: detail.category?.name || record.categoryName,
        Summary: detail.summary,
        Content: detail.content,
        Tags: detail.tags ? detail.tags.split(',').map(t => t.trim()) : [],
        Status: detail.status || 'Draft',
        MetaTitle: detail.metaTitle,
        MetaDescription: detail.metaDescription
      });

      if (detail.thumbnailUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'thumbnail.png',
            status: 'done',
            url: detail.thumbnailUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
      
      setIsModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await articleApi.delete(id);
      message.success('Xóa bài viết thành công');
      fetchArticles();
    } catch (error) {
      message.error('Lỗi khi xóa bài viết');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const formData = new FormData();
      formData.append('Title', values.Title);
      if (values.CategoryName) formData.append('CategoryName', values.CategoryName);
      if (values.Summary) formData.append('Summary', values.Summary);
      if (values.Content) formData.append('Content', values.Content);
      if (values.Tags && values.Tags.length > 0) formData.append('Tags', values.Tags.join(', '));
      if (values.Status) formData.append('Status', values.Status);
      if (values.MetaTitle) formData.append('MetaTitle', values.MetaTitle);
      if (values.MetaDescription) formData.append('MetaDescription', values.MetaDescription);
      
      // Handle file upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('Thumbnail', fileList[0].originFileObj);
      }

      setLoading(true);
      if (editingId) {
        await articleApi.update(editingId, formData);
        message.success('Cập nhật bài viết thành công!');
      } else {
        await articleApi.create(formData);
        message.success('Thêm bài viết mới thành công!');
      }
      
      setIsModalVisible(false);
      fetchArticles();
    } catch (error) {
      if (error.errorFields) return; // Validation error
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết!';
      message.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const columns = [
    {
      title: 'Ảnh Bìa',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      render: (text) => text ? <Image src={text} alt="thumbnail" width={80} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <Tag color="default">Chưa có ảnh</Tag>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => text ? <Tag color="blue">{text}</Tag> : <Tag>Chưa phân loại</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Published') color = 'success';
        if (status === 'Pending Review') color = 'warning';
        return <Tag color={color}>{status || 'Draft'}</Tag>;
      }
    },
    {
      title: 'Ngày xuất bản',
      dataIndex: 'publishedAt',
      render: (text) => text ? new Date(text).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Quản lý Bài Viết (CMS)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Thêm Bài Viết Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa Bài Viết" : "Thêm Bài Viết Mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        okText="Lưu Lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="Title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
          >
            <Input placeholder="Nhập tiêu đề..." size="large" />
          </Form.Item>

          <Form.Item
            name="CategoryName"
            label="Chuyên mục"
          >
            <Input placeholder="Ví dụ: Tin Tức, Khuyến Mãi..." />
          </Form.Item>

          <Form.Item
            name="Tags"
            label="Thẻ (Tags)"
          >
            <Select mode="tags" placeholder="Nhập tag và ấn Enter (VD: Ẩm thực, Khám phá)" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="Status"
            label="Trạng thái xuất bản"
            initialValue="Draft"
          >
            <Select>
              <Option value="Draft">Bản nháp (Draft)</Option>
              <Option value="Pending Review">Chờ duyệt (Pending Review)</Option>
              <Option value="Published">Đã xuất bản (Published)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="Summary"
            label="Tóm tắt ngắn (Summary) - Để trống sẽ tự sinh từ nội dung"
          >
            <TextArea rows={2} placeholder="Nhập đoạn tóm tắt ngắn..." />
          </Form.Item>

          <Form.Item
            name="Content"
            label="Nội dung chính"
          >
            <ReactQuill theme="snow" style={{ height: '300px', marginBottom: '50px' }} />
          </Form.Item>

          <Form.Item label="SEO - Meta Title" name="MetaTitle">
            <Input placeholder="Nhập Meta Title..." />
          </Form.Item>

          <Form.Item label="SEO - Meta Description" name="MetaDescription">
            <TextArea rows={2} placeholder="Nhập Meta Description..." />
          </Form.Item>

          <Form.Item label="Ảnh Bìa (Thumbnail)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onUploadChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
