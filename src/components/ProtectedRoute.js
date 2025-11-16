// src/components/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authStorage } from '../../lib/auth-storage';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  const checkAuth = () => {
    console.log('🔍 ProtectedRoute (components/) - INICIANDO checkAuth');
    
    const token = authStorage.getToken();
    const user = authStorage.getUser();
    
    console.log('🔍 ProtectedRoute (components/) - RESULTADOS:', {
      token: token ? 'PRESENTE' : 'AUSENTE',
      user: user ? 'PRESENTE' : 'AUSENTE',
      hasToken: !!token,
      hasUser: !!user
    });

    if (!token || !user) {
      console.log('❌ No autenticado - Redirigiendo');
      setIsAuthenticated(false);
      setIsChecking(false);
      
      if (router.pathname !== '/login') {
        router.push('/login');
      }
    } else {
      console.log('✅ Autenticado - Acceso permitido');
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
