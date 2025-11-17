// src/components/auth/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading, canAccessDashboard } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('❌ No autenticado, redirigiendo a login');
        router.push('/login');
      } else if (!canAccessDashboard) {
        console.log('❌ Sin permisos para dashboard, redirigiendo a login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, canAccessDashboard, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene permisos, no mostrar nada (está redirigiendo)
  if (!isAuthenticated || !canAccessDashboard) {
    return null;
  }

  // Usuario autenticado y con permisos
  return children;
}