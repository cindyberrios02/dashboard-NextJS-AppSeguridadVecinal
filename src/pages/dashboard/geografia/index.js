// src/pages/dashboard/geografia/index.js
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';

export default function Geografia() {
  const { user, isSuperAdmin } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Geografía</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gestión de ciudades, comunas y villas del sistema
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ciudades
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Próximamente
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Comunas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Próximamente
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HomeModernIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Villas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Próximamente
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Gestión Geográfica
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Módulo en desarrollo. Aquí podrás gestionar la estructura geográfica del sistema:
              </p>
              <ul className="mt-4 list-disc list-inside space-y-2">
                <li>Ciudades registradas en el sistema</li>
                <li>Comunas asociadas a cada ciudad</li>
                <li>Villas residenciales por comuna</li>
                <li>Sectores dentro de cada villa</li>
              </ul>
            </div>
            <div className="mt-5">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Próximamente disponible
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}