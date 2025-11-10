import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082',
  timeout: 10000,
});

export const dashboardAPI = {
  getStats: () => apiClient.get('/api/admin/dashboard/stats'),
  getAllUsers: () => apiClient.get('/api/users/all'),
  grantAccess: (rut) => apiClient.get(`/api/users/grantaccess?rut=${rut}`),
};