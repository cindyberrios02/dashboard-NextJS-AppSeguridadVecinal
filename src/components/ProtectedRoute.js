// components/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      console.log('⏳ Cargando autenticación...');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      console.log('❌ No autenticado, redirigiendo a login');
      router.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      const isAdmin = userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN_VILLA';
      
      if (!isAdmin) {
        console.log('❌ Usuario no es admin, redirigiendo a login');
        router.replace('/login');
        return;
      }

      console.log('✅ Usuario autenticado:', userData.email, '-', userData.role);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}