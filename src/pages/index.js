// src/pages/index.js
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  // Redirigir automáticamente al dashboard
  useEffect(() => {
  router.push('/dashboard');
}, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Dashboard de Seguridad Vecinal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Redirigiendo al dashboard...
          </p>
        </div>
        
        <div className="text-center">
          <Link
            href="/dashboard"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}