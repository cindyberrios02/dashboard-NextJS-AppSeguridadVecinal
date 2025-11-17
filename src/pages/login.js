// src/pages/login.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  ExclamationCircleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline

  // Verificar estado del backend al cargar
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Verificar si el backend está activo
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/admin/test`,
        { method: 'GET', cache: 'no-store' }
      );
      
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error('Backend no disponible:', error);
      setBackendStatus('offline');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    // Verificar backend antes de intentar login
    if (backendStatus === 'offline') {
      setError('El servidor no está disponible. Por favor, verifica que el backend esté corriendo en http://localhost:8082');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
      // Si es exitoso, el AuthContext maneja la redirección
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Por favor, verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 shadow-lg">
            <LockClosedIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Seguridad Vecinal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dashboard Administrativo
          </p>

          {/* Backend Status Badge */}
          <div className="mt-4 flex justify-center">
            {backendStatus === 'checking' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <ArrowPathIcon className="animate-spin h-3 w-3 mr-1" />
                Verificando servidor...
              </span>
            )}
            {backendStatus === 'online' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Servidor conectado
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                Servidor no disponible
              </span>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 text-center">
              <strong>Acceso solo para:</strong> SUPER_ADMIN y ADMIN_VILLA
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email"
                  disabled={loading || backendStatus === 'offline'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Contraseña"
                  disabled={loading || backendStatus === 'offline'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || backendStatus === 'offline'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {backendStatus === 'offline' && (
                    <button
                      type="button"
                      onClick={checkBackendStatus}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Reintentar conexión
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || backendStatus === 'offline'}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-semibold text-gray-700 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <strong>Super Admin:</strong> superadmin@villa.cl / admin123
              </p>
              <p className="text-xs text-gray-600">
                <strong>Admin Villa:</strong> admin@villa.cl / admin123
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            v1.0.0 • Dashboard Seguridad Vecinal
          </p>
        </div>
      </div>

      {/* Animación CSS para shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}