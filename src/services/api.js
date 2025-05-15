import axios from 'axios';
import { BASE_URL } from '@constants/config';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn('No autorizado. Redirigiendo al login...');
    } else if (status === 500) {
      console.error('Error interno del servidor');
    } else if (!error.response) {
      console.error('Error de red o el servidor no respondió');
    } else {
      console.error(`Error: ${status}`, error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
