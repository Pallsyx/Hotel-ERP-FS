import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';
import { useAuthStore } from '../store/authStore';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7100/api').replace(/\/api\/?$/, '');

export const useSignalR = () => {
  const [connection, setConnection] = useState(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnection(null);
      return undefined;
    }

    let isDisposed = false;
    let hubConnection = null;

    const startConnection = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_ROOT}/notificationHub`, {
          accessTokenFactory: () => localStorage.getItem('token') || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      hubConnection.on('ReceiveNotification', (data) => {
        const title = data?.title || data?.Title || 'Thông báo mới';
        const content = data?.content || data?.Content || data?.message || data?.Message || '';
        const type = (data?.type || data?.Type || 'info').toLowerCase();
        const safeType = ['success', 'info', 'warning', 'error'].includes(type) ? type : 'info';

        notification[safeType]({
          title: title, 
          description: content,
          placement: 'topRight',
          duration: 5,
        });
      });

      hubConnection.onreconnecting(() => {
        console.warn('SignalR đang reconnect...');
      });

      hubConnection.onreconnected(() => {
        console.log('SignalR reconnect thành công.');
      });

      hubConnection.onclose((error) => {
        if (error) {
          console.warn('SignalR đã đóng kết nối:', error.message || error);
        }
        if (!isDisposed) {
          setConnection(null);
        }
      });

      try {
        await hubConnection.start();
        if (!isDisposed) {
          console.log('🟢 Đã kết nối SignalR thành công!');
          setConnection(hubConnection);
        }
      } catch (err) {
        console.warn('SignalR hiện chưa khả dụng:', err?.message || err);
        if (!isDisposed) {
          setConnection(null);
        }
      }
    };

    startConnection();

    return () => {
      isDisposed = true;
      if (hubConnection) {
        hubConnection.off('ReceiveNotification');
        hubConnection.stop().catch(() => {});
      }
      setConnection(null);
    };
  }, [isAuthenticated]);

  return { connection };
};

export default useSignalR;