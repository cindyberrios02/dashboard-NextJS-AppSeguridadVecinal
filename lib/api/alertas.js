// lib/api/alertas.js
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

class AlertasService {
  
  async getHeaders() {
    const token = Cookies.get('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Obtener estadísticas de alertas
  async getStats(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.villaId) params.append('villaId', filters.villaId);
    if (filters.sector) params.append('sector', filters.sector);
    if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);

    const queryString = params.toString();
    const url = `${API_URL}/api/alertas/stats${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas: ${response.status}`);
    }

    return await response.json();
  }

  // Obtener alertas recientes
  async getRecientes(limit = 10) {
    const response = await fetch(
      `${API_URL}/api/alertas/recientes-dashboard?limit=${limit}`,  // ✅ CAMBIAR AQUÍ
      {
        method: 'GET',
        headers: await this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener alertas recientes: ${response.status}`);
    }

    return await response.json();
  }

  // Obtener todas las alertas con paginación
  async getAll(page = 0, size = 20, sortBy = 'fechaHora', sortDir = 'desc') {
    const response = await fetch(
      `${API_URL}/api/alertas?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
      {
        method: 'GET',
        headers: await this.getHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener alertas: ${response.status}`);
    }

    return await response.json();
  }
}

export const alertasService = new AlertasService();