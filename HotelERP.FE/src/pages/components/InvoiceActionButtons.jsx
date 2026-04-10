import React from 'react';

// Đây là cái linh kiện mà thằng Long sẽ lo phần ruột logic
const InvoiceActionButtons = ({ bookingId, invoiceStatus, onChanged }) => {
  
  // Tạm thời để một cái nút đại diện để mày nhìn thấy trên bảng
  // Khi nào thằng Long đưa code xịn (có nút Thêm phụ phí, Chốt hóa đơn) thì dán đè vào đây
  return (
    <div className="flex gap-2">
      <button 
        className="bg-orange-500 text-white px-2 py-1 rounded text-sm"
        onClick={() => {
            // Giả lập việc cập nhật để mày test cái hàm onChanged
            console.log("Thao tác với booking:", bookingId);
            // onChanged({ invoiceStatus: 'Paid', finalTotal: 999999 }); 
        }}
      >
        Thao tác nhanh
      </button>
    </div>
  );
};

export default InvoiceActionButtons;