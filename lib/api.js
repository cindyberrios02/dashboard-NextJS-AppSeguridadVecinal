import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

export const dashboardAPI = {
  getStats: () => apiClient.get('/api/admin/dashboard/stats'),
  getAllUsers: () => apiClient.get('/api/users/all'),
  grantAccess: (rut) => apiClient.get(`/api/users/grantaccess?rut=${rut}`),
};