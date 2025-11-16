import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082',
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token de localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.error('Error de autenticación:', error.response.status);
      
      // ✅ Si el token expiró, limpiar y redirigir
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== DASHBOARD ==========
export const dashboardAPI = {
  getStats: () => apiClient.get('/api/admin/dashboard/stats'),
  getAllUsers: () => apiClient.get('/api/users/all'),
  grantAccess: (rut) => apiClient.get(`/api/users/grantaccess?rut=${rut}`),
};

// ========== ALERTAS ==========
export const alertasAPI = {
  // Obtener todas las alertas con paginación
  getAll: (page = 0, size = 20) => 
    apiClient.get(`/api/alertas?page=${page}&size=${size}`),
  
  // Obtener alertas por sector
  getBySector: (sector, page = 0, size = 20) => 
    apiClient.get(`/api/alertas/sector/${sector}?page=${page}&size=${size}`),
  
  // Obtener alertas activas
  getActivas: () => 
    apiClient.get('/api/alertas/activas'),
  
  // Obtener alertas recientes
  getRecientes: () => 
    apiClient.get('/api/alertas/recientes'),
  
  // Obtener una alerta por ID
  getById: (id) => 
    apiClient.get(`/api/alertas/${id}`),
  
  // Obtener alertas por usuario
  getByUsuario: (usuarioId, page = 0, size = 20) => 
    apiClient.get(`/api/alertas/usuario/${usuarioId}?page=${page}&size=${size}`),
  
  // Obtener alertas cercanas
  getCercanas: (latitud, longitud, radio = 5.0) => 
    apiClient.get(`/api/alertas/cercanas?latitud=${latitud}&longitud=${longitud}&radio=${radio}`),
  
  // Cambiar estado de una alerta
  cambiarEstado: (id, estado) => 
    apiClient.patch(`/api/alertas/${id}/estado?estado=${estado}`),
  
  // Atender una alerta
  atender: (id, usuarioId, notas) => 
    apiClient.patch(`/api/alertas/${id}/atender`, { usuarioId, notas }),
  
  // Obtener estadísticas de alertas (para dashboard)
  getEstadisticas: () => 
    apiClient.get('/api/alertas/estadisticas'),
};

export default apiClient;