import React, { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, DEFAULT_API_URL } from '@constants/config.js';

export const useMultipleRealtimeStatus = (apiConfig, defaultUrl) => {
  const [data, setData] = useState({});
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [sockets, setSockets] = useState({});

  useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const newSockets = {};
      const uniqueUrls = new Set();

      Object.entries(apiConfig).forEach(([platform, config]) => {
        const url = config.useDefaultApi ? defaultUrl : config.url || defaultUrl;
        uniqueUrls.add(url);
      });

      uniqueUrls.forEach((url) => {
        const socket = io(url, {
          path: '/api1/socket.io',
          transports: ['polling'],
          upgrade: false,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        });

        socket.on('connect', () => {
          setConnectionStatuses((prev) => ({
            ...prev,
            [url]: 'Connected',
          }));
        });

        socket.on('disconnect', () => {
          setConnectionStatuses((prev) => ({
            ...prev,
            [url]: 'Disconnected',
          }));
        });

        socket.on('connect_error', (error) => {
          setConnectionStatuses((prev) => ({
            ...prev,
            [url]: 'Error',
          }));
        });

        socket.on('progress_update', (message) => {
          try {
            if (message.success && message.data) {
              setData((prev) => ({
                ...prev,
                [url]: message.data,
              }));
            }
          } catch (e) {
            // ...
          }
        });

        newSockets[url] = socket;
      });

      setSockets(newSockets);

      return () => {
        Object.values(newSockets).forEach((socket) => socket.disconnect());
      };
    });
  }, [apiConfig, defaultUrl]);

  // MEMOIZA AQUÍ 👇

  const getDataForPlatform = useCallback(
    (platform) => {
      const config = apiConfig[platform];
      const url = config?.useDefaultApi ? defaultUrl : config?.url || defaultUrl;
      return data[url];
    },
    [apiConfig, defaultUrl, data]
  );

  const getConnectionStatusForPlatform = useCallback(
    (platform) => {
      const config = apiConfig[platform];
      const url = config?.useDefaultApi ? defaultUrl : config?.url || defaultUrl;
      return connectionStatuses[url] || 'Connecting';
    },
    [apiConfig, defaultUrl, connectionStatuses]
  );

  return {
    getDataForPlatform,
    getConnectionStatusForPlatform,
    allConnectionStatuses: connectionStatuses,
  };
};
