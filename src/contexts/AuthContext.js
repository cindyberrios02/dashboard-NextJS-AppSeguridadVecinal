// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/lib/api/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Inicializar usuario desde localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          // Intentar refresh del token al cargar
          const refreshResult = await authService.refreshToken();
          
          if (refreshResult.success) {
            setUser(currentUser);
          } else {
            // Si falla el refresh, limpiar todo
            await authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        
        // Verificar si puede acceder al dashboard
        if (authService.canAccessDashboard(result.user.role)) {
          router.push('/dashboard');
        } else {
          // Si es VECINO, no puede acceder al dashboard web
          await authService.logout();
          return {
            success: false,
            error: 'Los usuarios VECINO no tienen acceso al dashboard web. Por favor, usa la aplicación móvil.',
          };
        }
        
        return { success: true };
      }
      
      return result;
    } catch (error) {
      console.error('Login error in context:', error);
      return {
        success: false,
        error: 'Error inesperado al iniciar sesión',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Limpiar de todos modos
      setUser(null);
      router.push('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    canAccessDashboard: user ? authService.canAccessDashboard(user.role) : false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};