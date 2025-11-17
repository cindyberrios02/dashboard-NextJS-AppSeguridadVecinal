// lib/api/dashboard.js
import apiClient from '../apiClient';

export const dashboardService = {
  // ========== ESTADÍSTICAS ==========
  getStats: async () => {
    const response = await apiClient.get('/api/admin/dashboard/stats');
    return response.data;
  },

  // ========== TEST ==========
  testConnection: async () => {
    const response = await apiClient.get('/api/admin/test');
    return response.data;
  },
};