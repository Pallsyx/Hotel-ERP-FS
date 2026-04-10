import React, { useState, useEffect } from 'react';
import { Modal, Spin, Typography, Divider, Row, Col, Descriptions, Button, message } from 'antd';
import { 
    HomeOutlined,
    AppstoreAddOutlined, 
    WarningOutlined,
    GiftOutlined
} from '@ant-design/icons';
import { invoiceApi } from '../../../api/invoiceApi';

const { Title, Text } = Typography;

const DraftInvoiceModal = ({ bookingId, visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (visible) {
            console.log("Opening DraftInvoiceModal with bookingId:", bookingId);
            if (bookingId) {
                fetchDraft();
            } else {
                console.warn("bookingId is null or undefined when modal is visible!");
                setData(null);
            }
        }
    }, [visible, bookingId]);

    const fetchDraft = async () => {
        try {
            setLoading(true);
            const res = await invoiceApi.getDraftInvoice(bookingId);
            console.log("Draft API Response:", res.data);
            setData(res.data);
        } catch (error) {
            console.error("Draft API Error:", error);
            const errorMsg = error.response?.data?.message || error.response?.data || "Lỗi khi lấy thông tin hóa đơn tạm tính";
            message.error(errorMsg);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    return (
        <Modal
            title={<Title level={3} style={{ marginBottom: 0 }}>Hóa đơn tạm tính</Title>}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose} size="large" type="primary">
                    Đóng cửa sổ
                </Button>
            ]}
            centered
            destroyOnClose={true}
        >
            <Spin spinning={loading} tip="Đang tính toán hóa đơn...">
                {data ? (
                    <div style={{ padding: '10px 0' }}>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Mã Booking">
                                <Text strong>{data.bookingCode}</Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
                            <Title level={5}><HomeOutlined /> Tiền phòng</Title>
                            <Row justify="space-between">
                                <Col><Text>Tổng tiền các phòng đã đặt:</Text></Col>
                                <Col><Text strong>{formatVND(data.totalRoomAmount)}</Text></Col>
                            </Row>
                            <Divider style={{ margin: '12px 0' }} />

                            <Title level={5}><AppstoreAddOutlined style={{ color: '#1890ff' }}/> Dịch vụ sử dụng</Title>
                            <Row justify="space-between">
                                <Col><Text>Tổng chi phí dịch vụ thêm:</Text></Col>
                                <Col><Text strong>{formatVND(data.totalServiceAmount)}</Text></Col>
                            </Row>
                            <Divider style={{ margin: '12px 0' }} />

                            <Title level={5}><WarningOutlined style={{ color: '#f5222d' }}/> Phí đền bù hư hỏng</Title>
                            <Row justify="space-between">
                                <Col><Text>Tổng phí phạt/đền bù:</Text></Col>
                                <Col><Text strong type="danger">{formatVND(data.totalDamageAmount)}</Text></Col>
                            </Row>
                            <Divider style={{ margin: '12px 0' }} />

                            <Row justify="space-between" style={{ marginTop: 20 }}>
                                <Col><Title level={5}>Tạm Tính (Subtotal):</Title></Col>
                                <Col><Title level={5}>{formatVND(data.subTotal)}</Title></Col>
                            </Row>
                            
                            {data.discountAmount > 0 && (
                                <Row justify="space-between" style={{ marginTop: 10 }}>
                                    <Col><Text type="success"><GiftOutlined /> Voucher giảm giá:</Text></Col>
                                    <Col><Text type="success">-{formatVND(data.discountAmount)}</Text></Col>
                                </Row>
                            )}
                        </div>

                        <div style={{ background: '#e6f7ff', padding: 20, borderRadius: 8, marginTop: 20, border: '1px solid #91d5ff' }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={4} style={{ margin: 0, color: '#0050b3' }}>Tổng Cộng Cần Thanh Toán</Title>
                                </Col>
                                <Col>
                                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{formatVND(data.finalTotal)}</Title>
                                </Col>
                            </Row>
                        </div>
                    </div>
                ) : (
                    !loading && (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <Text type="secondary">Không có dữ liệu hóa đơn. Vui lòng kiểm tra lại Booking ID.</Text>
                        </div>
                    )
                )}
            </Spin>
        </Modal>
    );
};

export default DraftInvoiceModal;
