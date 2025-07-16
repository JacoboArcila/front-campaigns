// hooks/useRealtimeStatus.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useRealtimeStatus = (url) => {
  const [data, setData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');

  useEffect(() => {
    // Crear conexión Socket.IO
    const socket = io(url, {
      path: '/api1/socket.io',
      transports: ['polling'], // Solo polling por ahora
      upgrade: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnectionStatus('Error');
    });

    // Escuchar actualizaciones de progreso
    socket.on('progress_update', (message) => {
      try {
        if (message.success && message.data) {
          setData(message.data);
        }
      } catch (e) {
        console.error('Error parsing progress update:', e);
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [url]);

  return { data, connectionStatus };
};

export default useRealtimeStatus;