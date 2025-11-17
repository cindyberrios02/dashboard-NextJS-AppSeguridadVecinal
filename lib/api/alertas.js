// lib/api/alertas.js
import apiClient from './client';

export const alertasService = {
  getRecientes: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/api/alertas/recientes', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/alertas/${id}`);
    return response.data;
  },

  create: async (alertaData) => {
    const response = await apiClient.post('/api/alertas', alertaData);
    return response.data;
  },

  updateEstado: async ({ id, estado, notasAtencion }) => {
    const response = await apiClient.put(`/api/alertas/${id}/estado`, {
      estado,
      notasAtencion,
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/api/admin/dashboard/stats');
    return response.data;
  },
};