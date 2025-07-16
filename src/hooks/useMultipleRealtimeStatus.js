import React, { useState, useEffect } from 'react';
import { API_CONFIG, DEFAULT_API_URL } from '@constants/config.js';

export const useMultipleRealtimeStatus = (apiConfig, defaultUrl) => {
  const [data, setData] = useState({});
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [sockets, setSockets] = useState({});

  useEffect(() => {
    // Importar Socket.IO dinámicamente
    import('socket.io-client').then(({ io }) => {
      const newSockets = {};
      const uniqueUrls = new Set();

      // Identificar URLs únicas
      Object.entries(apiConfig).forEach(([platform, config]) => {
        const url = config.useDefaultApi ? defaultUrl : config.url || defaultUrl;
        uniqueUrls.add(url);
      });

      // Crear una conexión por cada URL única
      uniqueUrls.forEach(url => {
        const socket = io(url, {
          path: '/api1/socket.io',
          transports: ['polling'],
          upgrade: false,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000
        });

        // Eventos de conexión
        socket.on('connect', () => {
          console.log(`Socket.IO connected to ${url}`);
          setConnectionStatuses(prev => ({
            ...prev,
            [url]: 'Connected'
          }));
        });

        socket.on('disconnect', () => {
          console.log(`Socket.IO disconnected from ${url}`);
          setConnectionStatuses(prev => ({
            ...prev,
            [url]: 'Disconnected'
          }));
        });

        socket.on('connect_error', (error) => {
          console.error(`Socket.IO connection error for ${url}:`, error);
          setConnectionStatuses(prev => ({
            ...prev,
            [url]: 'Error'
          }));
        });

        // Escuchar actualizaciones de progreso
        socket.on('progress_update', (message) => {
          try {
            if (message.success && message.data) {
              setData(prev => ({
                ...prev,
                [url]: message.data
              }));
            }
          } catch (e) {
            console.error('Error parsing progress update:', e);
          }
        });

        newSockets[url] = socket;
      });

      setSockets(newSockets);

      // Cleanup
      return () => {
        Object.values(newSockets).forEach(socket => socket.disconnect());
      };
    });
  }, [apiConfig, defaultUrl]);

  // Función para obtener datos de una plataforma específica
  const getDataForPlatform = (platform) => {
    const config = apiConfig[platform];
    const url = config?.useDefaultApi ? defaultUrl : config?.url || defaultUrl;
    return data[url];
  };

  // Función para obtener el estado de conexión de una plataforma
  const getConnectionStatusForPlatform = (platform) => {
    const config = apiConfig[platform];
    const url = config?.useDefaultApi ? defaultUrl : config?.url || defaultUrl;
    return connectionStatuses[url] || 'Connecting';
  };

  return { 
    getDataForPlatform, 
    getConnectionStatusForPlatform,
    allConnectionStatuses: connectionStatuses 
  };
};