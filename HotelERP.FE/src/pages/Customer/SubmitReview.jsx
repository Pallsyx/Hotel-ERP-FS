import React, { useState } from 'react';
import { Form, Input, Rate, Button, Upload, message, Card, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
// import axiosClient from '../../api/axiosClient'; // Bỏ comment khi tích hợp API

const { TextArea } = Input;
const { Dragger } = Upload;
const { Title } = Typography;

export default function SubmitReview({ bookingId }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleUploadChange = (info) => {
    setFileList(info.fileList);
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Logic gửi dữ liệu lên Backend
      // const formData = new FormData();
      // formData.append('BookingId', bookingId);
      // formData.append('Rating', values.rating);
      // formData.append('Comment', values.comment);
      // fileList.forEach(file => {
      //    if(file.originFileObj) formData.append('Images', file.originFileObj);
      // });
      // await axiosClient.post('/api/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' }});

      message.success('Cảm ơn bạn đã gửi đánh giá!');
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 20 }}>
      <Title level={4}>Gửi Đánh Giá Của Bạn</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        
        <Form.Item 
          name="rating" 
          label="Chất lượng dịch vụ" 
          rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
        >
          <Rate style={{ fontSize: 32 }} />
        </Form.Item>

        <Form.Item 
          name="comment" 
          label="Nhận xét" 
          rules={[{ required: true, message: 'Vui lòng nhập nhận xét của bạn!' }]}
        >
          <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." />
        </Form.Item>

        <Form.Item label="Đính kèm hình ảnh (Tùy chọn)">
          <Dragger
            multiple
            listType="picture"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // Ngăn Ant Design tự động upload ngay lập tức
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Kéo thả hoặc nhấp để chọn ảnh</p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Gửi Đánh Giá
          </Button>
        </Form.Item>

      </Form>
    </Card>
  );
}