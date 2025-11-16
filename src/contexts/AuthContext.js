// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authStorage } from '../../lib/auth-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const token = authStorage.getToken();
      const userData = authStorage.getUser();
      
      console.log('🔄 Cargando sesión:', {
        hasToken: !!token,
        hasUser: !!userData
      });
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ Usuario cargado:', parsedUser.email);
      }
    } catch (error) {
      console.error('❌ Error cargando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
      
      const response = await fetch(
        `${apiUrl}/api/auth/authenticate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error('Credenciales erróneas');
      }

      const data = await response.json();

      const userData = {
        userId: data.userId,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.username,
        role: data.role,
        isAdmin: data.isAdmin,
        sector: data.sector,
        villaId: data.villaId,
        villaNombre: data.villaNombre,
      };
      
      authStorage.setToken(data.accessToken);
      authStorage.setRefreshToken(data.refreshToken);
      authStorage.setUser(userData);
      
      setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!authStorage.getToken();
  };

  const canAccessDashboard = () => {
    return !!authStorage.getToken();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isAuthenticated,
      canAccessDashboard
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);