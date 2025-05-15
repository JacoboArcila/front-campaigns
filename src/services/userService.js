import api from './api/api';
import endpoints from './api/endpoints';

export const login = async (credentials) => {
  try {
    const res = await api.post(endpoints.login, credentials);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};
