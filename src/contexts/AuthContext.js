// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
      
      console.log('Intentando login en:', `${apiUrl}/api/auth/authenticate`);
      console.log('Credenciales:', { email, password: '***' });
      
      const response = await fetch(
        `${apiUrl}/api/auth/authenticate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ email, password }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error al iniciar sesión';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Credenciales erróneas';
        } catch (e) {
          errorMessage = response.status === 401 || response.status === 403 
            ? 'Credenciales erróneas' 
            : `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login exitoso:', data);

      // ✅ GUARDAR SEGÚN TU ESTRUCTURA
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
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
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      console.log('Usuario guardado:', userData);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const canAccessDashboard = () => {
    if (!user) return false;
    return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_VILLA';
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