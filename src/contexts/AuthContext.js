// contexts/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Intentando login...');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password }
      );

      console.log('✅ Respuesta completa del servidor:', response.data);

      const data = response.data;

      // ✅ MAPEAR CORRECTAMENTE los campos del backend
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const userEmail = data.username || data.email; // El backend envía "username"
      const role = data.role;
      const isAdmin = data.isAdmin;
      const sector = data.sector;
      const usuarioId = data.id || data.usuarioId; // Puede venir como "id"
      const villaId = data.villaId;
      const villaNombre = data.villaNombre;
      const nombre = data.nombre;
      const apellido = data.apellido;

      console.log('📦 Datos extraídos:', {
        userEmail,
        role,
        isAdmin,
        usuarioId,
        villaId
      });

      // Guardar tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Crear objeto de usuario
      const userData = {
        email: userEmail,
        role,
        isAdmin,
        sector,
        usuarioId,
        villaId,
        villaNombre,
        nombre,
        apellido,
      };

      // Guardar usuario
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      console.log('✅ Usuario guardado en state:', userData);
      console.log('✅ Token guardado en localStorage');

      return userData;

    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ Response data:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helpers de roles
  const isSuperAdmin = () => user?.role === 'SUPER_ADMIN';
  const isAdminVilla = () => user?.role === 'ADMIN_VILLA';
  const isVecino = () => user?.role === 'VECINO';
  const canChangeRoles = () => isSuperAdmin();

  const value = {
    user,
    login,
    logout,
    loading,
    isSuperAdmin,
    isAdminVilla,
    isVecino,
    canChangeRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};