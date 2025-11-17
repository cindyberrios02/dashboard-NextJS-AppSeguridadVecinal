// lib/api/users.js
import apiClient from '../apiClient';

export const usersService = {
  // ========== OBTENER USUARIOS ==========
  getRecentUsers: async (page = 0, size = 10, sortBy = 'fechaRegistro', sortDir = 'desc') => {
    const response = await apiClient.get('/api/admin/users/recent', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  searchUsers: async (query, page = 0, size = 20) => {
    const response = await apiClient.get('/api/admin/users/search-global', {
      params: { query, page, size }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  // ========== CREAR/ACTUALIZAR ==========
  createUser: async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  // ========== VERIFICACIÓN CON SECTOR ==========
  toggleVerification: async (id, sector = null) => {
    const response = await apiClient.put(`/api/admin/users/${id}/verification`, 
      sector ? { sector } : {}
    );
    return response.data;
  },

  // ========== CAMBIOS DE ESTADO ==========
  toggleAccountStatus: async (id) => {
    const response = await apiClient.put(`/api/admin/users/${id}/status`);
    return response.data;
  },

  changeUserRole: async (id, role) => {
    const response = await apiClient.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  // ========== ELIMINAR ==========
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  // ========== SECTORES ==========
  getSectores: async () => {
    const response = await apiClient.get('/api/admin/sectores');
    return response.data;
  },
};