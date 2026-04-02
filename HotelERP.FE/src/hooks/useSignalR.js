import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';
import { useAuthStore } from '../store/authStore';

export const useSignalR = () => {
  // 👉 1. Dùng useState thay vì useRef để Component biết khi nào đã kết nối xong
  const [connection, setConnection] = useState(null);
  
  // Theo dõi trạng thái đăng nhập
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Nếu chưa đăng nhập thì không mở kết nối WebSocket
    if (!isAuthenticated) return;

    // Lấy token từ LocalStorage để đính kèm vào WebSocket
    const token = localStorage.getItem('token');

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7100/notificationHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // Lắng nghe sự kiện để bắn Popup nhỏ ở góc màn hình
    newConnection.on("ReceiveNotification", (data) => {
      // 👉 1. In thẳng ra Console xem C# đang giấu cái gì bên trong
      console.log("📥 Dữ liệu từ Backend gửi về:", data);

      // 👉 2. Bắt lỗi chữ Hoa/Chữ Thường từ C# (JSON Serialization)
      const title = data.title || data.Title || "Thông báo mới";
      const content = data.content || data.Content || data.message || data.Message || "";
      const type = (data.type || data.Type)?.toLowerCase() || 'info';
      
      // Bắn Toast thông báo của Ant Design
      notification[type]({  
        title: title, // 👉 ĐỔI TỪ 'message' THÀNH 'title' ĐỂ HẾT BÁO VÀNG
        description: content,
        placement: 'topRight',
        duration: 5,
      });
    });

    // Bắt đầu kết nối
    newConnection.start()
      .then(() => {
        console.log("🟢 Đã kết nối SignalR thành công!");
        setConnection(newConnection); // 👉 2. Lưu vào State sau khi kết nối thành công
      })
      .catch(err => console.error("🔴 Lỗi kết nối SignalR:", err));

    // Cleanup: Ngắt kết nối khi đăng xuất
    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [isAuthenticated]);

  // 👉 3. BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ FIX LỖI UNDEFINED
  return { connection }; 
};

export default useSignalR;