// src/pages/dashboard/settings/index.js
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { user, isSuperAdmin } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
            <p className="mt-2 text-sm text-gray-700">
              Administra las configuraciones del sistema y tu perfil
            </p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {/* Profile Settings */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Perfil de Usuario
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Actualiza tu información personal y preferencias de cuenta
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Notificaciones
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configura cómo y cuándo recibir notificaciones del sistema
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Seguridad
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Administra tu contraseña y opciones de seguridad de la cuenta
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings (Only SUPER_ADMIN) */}
          {isSuperAdmin() && (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Configuración del Sistema
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configuraciones avanzadas del sistema (solo SUPER_ADMIN)
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Próximamente
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Usuario actual
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {user?.role}</p>
                <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
                {user?.villaNombre && (
                  <p><strong>Villa:</strong> {user.villaNombre}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}