// lib/fetch-with-auth.js
import { authStorage } from './auth-storage';

export const fetchWithAuth = async (url, options = {}) => {
  const token = authStorage.getToken();
  
  console.log('🔑 fetchWithAuth - Token check:', {
    hasToken: !!token,
    url: url.substring(url.lastIndexOf('/'))
  });
  
  if (!token) {
    console.error('❌ No hay token disponible');
    //throw new Error('No hay token de autenticación');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors'
    });
    
    console.log('📡 fetchWithAuth - Response:', response.status);
    
    // Solo redirigir si realmente es 401/403
    if (response.status === 401 || response.status === 403) {
      console.error('❌ Token inválido o expirado');
      authStorage.clear();
      
      // Esperar un poco antes de redirigir para evitar loops
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 100);
      
      throw new Error('Sesión expirada');
    }
    
    return response;
  } catch (error) {
    console.error('❌ fetchWithAuth error:', error.message);
    throw error;
  }
};