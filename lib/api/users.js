// lib/api/users.js
import apiClient from './client';

export const usersService = {
  // Obtener usuarios recientes con paginación
  getRecentUsers: async ({ page = 0, size = 10, sortBy = 'fechaRegistro', sortDir = 'desc' }) => {
    const response = await apiClient.get('/api/admin/users/recent', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  // Buscar usuarios
  searchUsers: async ({ query, page = 0, size = 20 }) => {
    const response = await apiClient.get('/api/admin/users/search-global', {
      params: { query, page, size },
    });
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  // Crear usuario
  createUser: async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async ({ id, userData }) => {
    const response = await apiClient.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  // Cambiar rol del usuario
  updateUserRole: async ({ id, role }) => {
    const response = await apiClient.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle verificación
  toggleVerification: async (id) => {
    const response = await apiClient.put(`/api/admin/users/${id}/verification`);
    return response.data;
  },

  // Toggle estado
  toggleStatus: async (id) => {
    const response = await apiClient.put(`/api/admin/users/${id}/status`);
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  // Obtener todos los sectores
  getSectores: async () => {
    const response = await apiClient.get('/api/admin/sectores');
    return response.data;
  },

  // Asignar sector
  assignSector: async ({ id, sector }) => {
    const response = await apiClient.put(`/api/admin/usuarios/${id}/sector`, { sector });
    return response.data;
  },


  
};