// lib/api/auth.js
import apiClient, { setAccessToken, clearAccessToken } from './client';
import Cookies from 'js-cookie';

export const authService = {
  // Login mejorado con mejor manejo de errores
  login: async (email, password) => {
    try {
      console.log('🔐 Intentando login...', { email });
      
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      console.log('✅ Login exitoso:', response.data);

      const { 
        accessToken, 
        refreshToken, 
        role, 
        isAdmin, 
        userId, 
        username,
        nombre, 
        apellido, 
        sector, 
        villaId, 
        villaNombre 
      } = response.data;

      // Guardar access token en memoria
      setAccessToken(accessToken);

      // Guardar refresh token en cookie httpOnly
      Cookies.set('refreshToken', refreshToken, {
        expires: 7, // 7 días
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Guardar datos del usuario en localStorage (NO sensibles)
      const userData = {
        userId,
        email: email || username,
        role,
        isAdmin: isAdmin || false,
        nombre: nombre || '',
        apellido: apellido || '',
        sector: sector || '',
        villaId: villaId || null,
        villaNombre: villaNombre || '',
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('💾 Usuario guardado:', userData);

      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejo detallado de errores
      let errorMessage = 'Error al iniciar sesión';
      let errorCode = null;

      if (error.response) {
        // El servidor respondió con un error
        const { status, data } = error.response;
        
        console.error('Error del servidor:', { status, data });
        
        errorCode = data?.code;
        errorMessage = data?.message || data?.error;

        // Mensajes específicos según código de error
        if (status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (status === 403) {
          if (data?.code === 'ACCOUNT_DISABLED') {
            errorMessage = 'Tu cuenta está pendiente de verificación. Contacta al administrador.';
          } else {
            errorMessage = 'Acceso denegado';
          }
        } else if (status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (status >= 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('Sin respuesta del servidor');
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté activo en http://localhost:8082';
      } else {
        // Error al configurar la petición
        console.error('Error de configuración:', error.message);
        errorMessage = 'Error inesperado: ' + error.message;
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode,
      };
    }
  },

  // Logout mejorado
  logout: async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      //await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar todo independientemente del resultado
      clearAccessToken();
      Cookies.remove('refreshToken');
      localStorage.removeItem('user');
      console.log('✅ Sesión cerrada');
    }
  },

  // Verificar si puede acceder al dashboard
  canAccessDashboard: (role) => {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN_VILLA'];
    return allowedRoles.includes(role);
  },

  // Obtener usuario actual del localStorage
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  // Refresh token mejorado
  refreshToken: async () => {
    try {
      const refreshToken = Cookies.get('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }

      console.log('🔄 Renovando token...');

      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken,
      });

      const { accessToken: newAccessToken } = response.data;
      setAccessToken(newAccessToken);

      console.log('✅ Token renovado');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      return { success: false };
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    const refreshToken = Cookies.get('refreshToken');
    return !!(user && refreshToken);
  },
};