import React, { useState, useMemo, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

// --- MOCK DATA (Thay thế bằng dữ liệu gọi từ API Backend của bạn) ---
const mockBookings = [
  { id: 'BK001', roomName: 'Phòng 101' },
  { id: 'BK002', roomName: 'Phòng 205 (VIP)' },
];

const mockRoomItems = [
  { id: 'IT01', name: 'Khăn tắm', price: 150000 },
  { id: 'IT02', name: 'Cốc thủy tinh', price: 50000 },
  { id: 'IT03', name: 'Điều khiển TV', price: 300000 },
  { id: 'IT04', name: 'Bình siêu tốc', price: 500000 },
];

const LossAndDamages = () => {
  // State 1: Bảng lịch sử đền bù
  const [historyList, setHistoryList] = useState([
    { id: 1, bookingId: 'BK001', itemName: 'Khăn tắm', quantity: 1, total: 150000, date: '2026-04-01' }
  ]);

  // State 2: Form dữ liệu
  const [formData, setFormData] = useState({
    bookingId: '',
    itemId: '',
    quantity: 1,
  });

  // State 3: Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Hàm hiển thị thông báo
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- KẾT NỐI SIGNALR ĐỂ LÀM REAL-TIME ---
  useEffect(() => {
    // 1. Khởi tạo kết nối tới Hub của Backend C#
    const connection = new signalR.HubConnectionBuilder()
      // Chú ý: Đổi URL này thành URL chạy API backend C# thực tế của bạn
      .withUrl("https://localhost:7100/damageHub") 
      .withAutomaticReconnect()
      .build();

    // 2. Lắng nghe sự kiện "ReceiveNewDamage" từ Backend đẩy về
    connection.on("ReceiveNewDamage", (newRecord) => {
      setHistoryList(prevList => [newRecord, ...prevList]);
      showToast(`Có báo cáo đền bù mới cho phòng ${newRecord.bookingId}!`, 'success');
    });

    // 3. Bắt đầu kết nối
    connection.start()
      .then(() => console.log("Đã kết nối Realtime với SignalR!"))
      .catch(err => console.error("Lỗi kết nối SignalR: ", err));

    // Cleanup khi đóng trang
    return () => {
      connection.stop();
    };
  }, []);

  // Logic: Tính tự động Tổng tiền = Số lượng * Giá đền bù
  const calculateTotal = useMemo(() => {
    if (!formData.itemId || formData.quantity <= 0) return 0;
    const selectedItem = mockRoomItems.find(item => item.id === formData.itemId);
    return selectedItem ? selectedItem.price * formData.quantity : 0;
  }, [formData.itemId, formData.quantity]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Form (Tích hợp API POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bookingId || !formData.itemId || formData.quantity <= 0) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    const selectedItem = mockRoomItems.find(item => item.id === formData.itemId);
    const newRecord = {
      id: Date.now(),
      bookingId: formData.bookingId,
      itemName: selectedItem.name,
      quantity: Number(formData.quantity),
      total: calculateTotal,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      // TODO: Khi BE xong API, mở comment dòng dưới và xóa setTimeout
      // await axios.post('/api/damages', newRecord);
      
      // Giả lập delay gọi API
      await new Promise(resolve => setTimeout(resolve, 500)); 

      // Tạm thời tự cập nhật UI máy mình (khi có Backend thật thì Backend sẽ dùng SignalR báo lại)
      setHistoryList([newRecord, ...historyList]);
      
      // Reset Form
      setFormData({ bookingId: '', itemId: '', quantity: 1 });
      
      showToast('Lưu biên bản đền bù thành công!', 'success');

    } catch (error) {
      showToast('Có lỗi xảy ra khi lưu dữ liệu!', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-lg text-white transition-opacity z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Thất Thoát & Đền Bù</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- FORM GHI NHẬN THẤT THOÁT --- */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-1">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ghi nhận đền bù mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Dropdown 1: Chọn Booking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking đang ở</label>
              <select name="bookingId" value={formData.bookingId} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- Chọn Booking --</option>
                {mockBookings.map(bk => (
                  <option key={bk.id} value={bk.id}>{bk.id} - {bk.roomName}</option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Chọn Vật tư (Phụ thuộc Booking) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vật tư hỏng/mất</label>
              <select name="itemId" value={formData.itemId} onChange={handleInputChange} disabled={!formData.bookingId} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                <option value="">-- Chọn vật tư --</option>
                {mockRoomItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.price.toLocaleString('vi-VN')}đ)</option>
                ))}
              </select>
            </div>

            {/* Nhập số lượng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* Tự động tính tiền */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <span className="text-sm text-gray-500">Tổng tiền phạt:</span>
              <div className="text-xl font-bold text-red-600 mt-1">
                {calculateTotal.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Lưu Biên Bản
            </button>
          </form>
        </div>

        {/* --- BẢNG LỊCH SỬ ĐỀN BÙ --- */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Lịch sử Đền bù</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 border-b">Mã Booking</th>
                  <th className="p-3 border-b">Tên đồ hỏng</th>
                  <th className="p-3 border-b text-center">Số lượng</th>
                  <th className="p-3 border-b text-right">Tổng tiền phạt</th>
                  <th className="p-3 border-b text-center">Ngày ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  historyList.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-blue-600">{record.bookingId}</td>
                      <td className="p-3">{record.itemName}</td>
                      <td className="p-3 text-center">{record.quantity}</td>
                      <td className="p-3 text-right font-semibold text-red-600">{record.total.toLocaleString('vi-VN')}đ</td>
                      <td className="p-3 text-center text-sm text-gray-600">{record.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LossAndDamages;