// lib/api/geografia.js
import apiClient from '../apiClient';

export const geografiaService = {
  // ========== CIUDADES ==========
  getCiudades: async () => {
    const response = await apiClient.get('/api/geografia/ciudades');
    return response.data;
  },

  // ========== COMUNAS ==========
  getComunas: async (ciudadId = null) => {
    const params = ciudadId ? { ciudadId } : {};
    const response = await apiClient.get('/api/geografia/comunas', { params });
    return response.data;
  },

  getComunaById: async (id) => {
    const response = await apiClient.get(`/api/geografia/comunas/${id}`);
    return response.data;
  },

  // ========== VILLAS ==========
  getVillas: async (comunaId = null) => {
    const params = comunaId ? { comunaId } : {};
    const response = await apiClient.get('/api/geografia/villas', { params });
    return response.data;
  },

  getVillaById: async (id) => {
    const response = await apiClient.get(`/api/geografia/villas/${id}`);
    return response.data;
  },

  getSectoresByVilla: async (villaId) => {
    const response = await apiClient.get(`/api/geografia/villas/${villaId}/sectores`);
    return response.data;
  },

  // ========== JERARQUÍA COMPLETA ==========
  getJerarquiaCompleta: async () => {
    const response = await apiClient.get('/api/geografia/jerarquia');
    return response.data;
  },
};