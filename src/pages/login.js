// src/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📤 Enviando credenciales...');
      
      const userData = await login(formData.email, formData.password);
      
      console.log('✅ Login exitoso, usuario:', userData);
      console.log('🔄 Redirigiendo a dashboard...');
      
      // ✅ REDIRECCIÓN FORZADA
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      
      // Manejar diferentes tipos de errores
      const errorData = err.response?.data;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message;

      if (errorCode === 'VECINO_NO_WEB_ACCESS') {
        setError({
          type: 'vecino',
          message: errorMessage || 'Los usuarios VECINO deben usar la aplicación móvil'
        });
      } else if (errorCode === 'ACCOUNT_DISABLED') {
        setError({
          type: 'disabled',
          message: errorMessage || 'Tu cuenta está desactivada'
        });
      } else {
        setError({
          type: 'credentials',
          message: errorMessage || 'Email o contraseña incorrectos'
        });
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Seguridad Vecinal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Dashboard Administrativo
          </p>
        </div>

        {/* Error Messages */}
        {error && (
          <div
            className={`rounded-md p-4 ${
              error.type === 'vecino'
                ? 'bg-blue-50 border border-blue-200'
                : error.type === 'disabled'
                ? 'bg-red-50 border border-red-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {error.type === 'vecino' ? (
                  <DevicePhoneMobileIcon className="h-5 w-5 text-blue-400" />
                ) : error.type === 'disabled' ? (
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    error.type === 'vecino' ? 'text-blue-800' : 'text-red-800'
                  }`}
                >
                  {error.type === 'vecino'
                    ? 'Acceso desde app móvil'
                    : error.type === 'disabled'
                    ? 'Cuenta desactivada'
                    : 'Error de autenticación'}
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    error.type === 'vecino' ? 'text-blue-700' : 'text-red-700'
                  }`}
                >
                  <p>{error.message}</p>
                  {error.type === 'vecino' && (
                    <p className="mt-2 text-xs">
                      Descarga la aplicación móvil para acceder como vecino.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="admin@ejemplo.cl"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Solo para administradores del sistema
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}