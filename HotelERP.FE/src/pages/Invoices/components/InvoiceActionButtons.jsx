import React, { useState } from 'react';
import { Button, Space, Tag, message } from 'antd';
import {
  ThunderboltOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import invoiceApi from '../../../api/invoiceApi';
import QuickActionModal from './QuickActionModal';
import FinalizeInvoiceModal from './FinalizeInvoiceModal';

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

const buildPrintableHtml = (payload) => {
  const bookingId = getValue(payload, 'bookingId', 'BookingId') || '';
  const bookingCode = getValue(payload, 'bookingCode', 'BookingCode') || '';
  const invoiceId = getValue(payload, 'invoiceId', 'InvoiceId') || '';
  const invoiceCode = getValue(payload, 'invoiceCode', 'InvoiceCode') || '';
  const finalTotal = getValue(payload, 'finalTotal', 'FinalTotal') || 0;
  const invoiceStatus = getValue(payload, 'invoiceStatus', 'InvoiceStatus') || '';
  const totalRoomAmount = getValue(payload, 'totalRoomAmount', 'TotalRoomAmount') || 0;
  const totalServiceAmount = getValue(payload, 'totalServiceAmount', 'TotalServiceAmount') || 0;
  const totalDamageAmount = getValue(payload, 'totalDamageAmount', 'TotalDamageAmount') || 0;
  const manualAdjustmentAmount = getValue(payload, 'manualAdjustmentAmount', 'ManualAdjustmentAmount') || 0;
  const discountAmount = getValue(payload, 'discountAmount', 'DiscountAmount') || 0;
  const taxAmount = getValue(payload, 'taxAmount', 'TaxAmount') || 0;
  const roomNumbers = getValue(payload, 'roomNumbers', 'RoomNumbers') || [];
  const bookingDetailIds = getValue(payload, 'bookingDetailIds', 'BookingDetailIds') || [];
  const notes = getValue(payload, 'notes', 'Notes') || '';

  const money = (val) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);

  return `
    <html>
      <head>
        <title>In bản nháp hóa đơn</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin-bottom: 8px; }
          .meta { margin-bottom: 20px; }
          .meta div { margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          th { background: #f3f4f6; }
          .final { font-size: 20px; font-weight: bold; color: #dc2626; margin-top: 12px; }
          .note { margin-top: 18px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>HÓA ĐƠN TẠM TÍNH</h1>
        <div class="meta">
          <div><b>Invoice ID:</b> ${invoiceId}</div>
          <div><b>Booking ID:</b> ${bookingId}</div>
          <div><b>Mã booking:</b> ${bookingCode}</div>
          <div><b>Mã hóa đơn:</b> ${invoiceCode}</div>
          <div><b>Trạng thái:</b> ${invoiceStatus}</div>
          <div><b>Phòng:</b> ${(roomNumbers || []).join(', ') || 'Không có'}</div>
          <div><b>BookingDetailIds:</b> ${(bookingDetailIds || []).join(', ') || 'Không có'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Khoản mục</th>
              <th>Số tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Tiền phòng</td><td>${money(totalRoomAmount)}</td></tr>
            <tr><td>Tiền dịch vụ</td><td>${money(totalServiceAmount)}</td></tr>
            <tr><td>Tiền đền bù</td><td>${money(totalDamageAmount)}</td></tr>
            <tr><td>Phụ phí thêm tay</td><td>${money(manualAdjustmentAmount)}</td></tr>
            <tr><td>Giảm giá</td><td>${money(discountAmount)}</td></tr>
            <tr><td>VAT</td><td>${money(taxAmount)}</td></tr>
          </tbody>
        </table>

        <div class="final">TỔNG THANH TOÁN: ${money(finalTotal)}</div>

        <div class="note">
          <b>Ghi chú:</b><br/>
          ${notes || 'Không có'}
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
};

const InvoiceActionButtons = ({ invoiceId, invoiceStatus, onChanged }) => {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  const normalizedStatus = (invoiceStatus || '').toUpperCase();
  const isPaid = normalizedStatus === 'PAID';

  const handlePrintDraft = async () => {
    try {
      setPrinting(true);

      const res = await invoiceApi.getInvoiceDetail(invoiceId);
      const payload = res?.data?.data || res?.data || {};

      const html = buildPrintableHtml(payload);
      const printWindow = window.open('', '_blank', 'width=900,height=700');

      if (!printWindow) {
        message.error('Trình duyệt đang chặn popup in.');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error('Print draft error:', error);
      message.error(error?.response?.data?.message || 'Không in được bản nháp.');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <Space wrap>
        <Button
          icon={<PrinterOutlined />}
          onClick={handlePrintDraft}
          loading={printing}
          disabled={!invoiceId}
        >
          In bản nháp
        </Button>

        <Button
          icon={<ThunderboltOutlined />}
          onClick={() => setQuickActionOpen(true)}
          disabled={!invoiceId || isPaid}
        >
          Thao tác nhanh
        </Button>

        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => setFinalizeOpen(true)}
          disabled={!invoiceId || isPaid}
        >
          Chốt & Xuất
        </Button>

        {isPaid && <Tag color="green">Đã thanh toán</Tag>}
      </Space>

      <QuickActionModal
        open={quickActionOpen}
        invoiceId={invoiceId}
        onCancel={() => setQuickActionOpen(false)}
        onSuccess={onChanged}
      />

      <FinalizeInvoiceModal
        open={finalizeOpen}
        invoiceId={invoiceId}
        onCancel={() => setFinalizeOpen(false)}
        onSuccess={onChanged}
      />
    </>
  );
};

export default InvoiceActionButtons;