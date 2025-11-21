// pages/dashboard/index.js
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/lib/api/dashboard';
import { usersService } from '@/lib/api/users';
import { geografiaService } from '@/lib/api/geografia';
import {
  UserGroupIcon,
  CheckBadgeIcon,
  ClockIcon,
  ShieldCheckIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user, isSuperAdmin, isAdminVilla } = useAuth();

  // Query para estadísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
  });

  // Query para obtener sectores
  const { data: sectoresData } = useQuery({
    queryKey: ['sectores'],
    queryFn: () => usersService.getSectores(),
    enabled: !!user,
  });

  // Query para obtener usuarios recientes
  const { data: usersData } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: () => usersService.getRecentUsers(0, 50),
  });

  // Query para obtener villas (solo SUPER_ADMIN)
  const { data: villasData } = useQuery({
    queryKey: ['villas'],
    queryFn: () => geografiaService.getVillas(),
    enabled: isSuperAdmin(),
  });

  // Preparar datos para gráficos
  const prepareChartData = () => {
    if (!usersData?.users) return [];

    if (isSuperAdmin()) {
      // SUPER_ADMIN: Agrupar por villas
      const villaGroups = {};
      usersData.users.forEach(user => {
        const villaName = user.villaNombre || 'Sin Villa';
        if (!villaGroups[villaName]) {
          villaGroups[villaName] = {
            name: villaName,
            total: 0,
            verificados: 0,
            pendientes: 0,
          };
        }
        villaGroups[villaName].total++;
        if (user.verificado) {
          villaGroups[villaName].verificados++;
        } else {
          villaGroups[villaName].pendientes++;
        }
      });
      return Object.values(villaGroups);
    } else {
      // ADMIN_VILLA: Agrupar por sectores
      const sectorGroups = {};
      usersData.users.forEach(user => {
        const sectorName = user.sector || 'Sin Sector';
        if (!sectorGroups[sectorName]) {
          sectorGroups[sectorName] = {
            name: sectorName,
            total: 0,
            verificados: 0,
            pendientes: 0,
          };
        }
        sectorGroups[sectorName].total++;
        if (user.verificado) {
          sectorGroups[sectorName].verificados++;
        } else {
          sectorGroups[sectorName].pendientes++;
        }
      });
      return Object.values(sectorGroups);
    }
  };

  // Preparar datos para gráfico de pastel (roles)
  const prepareRoleData = () => {
    if (!usersData?.users) return [];
    
    const roleCount = {};
    usersData.users.forEach(user => {
      const roleName = user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                      user.role === 'ADMIN_VILLA' ? 'Admin Villa' : 'Vecino';
      roleCount[roleName] = (roleCount[roleName] || 0) + 1;
    });

    return Object.entries(roleCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  const chartData = prepareChartData();
  const roleData = prepareRoleData();

  if (statsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dashboard {isAdminVilla() && `- ${user.villaNombre}`}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
            {isSuperAdmin() ? 'Vista general de todas las villas' : `Gestión de ${user?.villaNombre || 'tu villa'}`}
            </p>
          </div>
          {isAdminVilla() && (
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{user.villaNombre}</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckBadgeIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verificados</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.verifiedUsers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pendientes</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.pendingUsers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Administradores</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.adminUsers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Gráfico de barras por Villa/Sector */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isSuperAdmin() ? 'Usuarios por Villa' : 'Usuarios por Sector'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="verificados" fill="#10b981" name="Verificados" />
                <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de pastel por roles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Roles</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sectores disponibles (solo ADMIN_VILLA) */}
        {isAdminVilla() && sectoresData?.sectores && sectoresData.sectores.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sectores de {user.villaNombre}</h3>
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {sectoresData.sectores.map((sector, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info de Villas (solo SUPER_ADMIN) */}
        {isSuperAdmin() && villasData?.villas && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Villas Registradas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {villasData.villas.map((villa) => (
                <div key={villa.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{villa.nombre}</h4>
                      <p className="text-sm text-gray-500">{villa.comunaNombre}</p>
                    </div>
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Sectores: {villa.sectores?.length || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}