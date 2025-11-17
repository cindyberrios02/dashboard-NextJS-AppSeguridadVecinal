// src/pages/dashboard/index.js
import { useQuery } from '@tanstack/react-query';
import { alertasService } from '@/lib/api/alertas';
import { useAuth } from '@/contexts/AuthContext';
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/dashboard/StatsCard";


import { 
  ShieldCheckIcon, 
  BellAlertIcon, 
  UsersIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { 
  LineChart, 
  Line, 
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();

  // Query para estadísticas con auto-refresh
  const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: alertasService.getDashboardStats,
    refetchInterval: 30000, // Auto-refresh cada 30 segundos
    retry: 2,
    staleTime: 10000, // Considerar datos "frescos" por 10 segundos
  });

  // Datos para gráficos (en producción vendrían del backend)
  const alertasPorMes = [
    { mes: 'Ene', alertas: stats?.alertasEnero || 12 },
    { mes: 'Feb', alertas: stats?.alertasFebrero || 19 },
    { mes: 'Mar', alertas: stats?.alertasMarzo || 15 },
    { mes: 'Abr', alertas: stats?.alertasAbril || 25 },
    { mes: 'May', alertas: stats?.alertasMayo || 22 },
    { mes: 'Jun', alertas: stats?.alertasJunio || 30 },
  ];

  const alertasPorTipo = [
    { tipo: 'Robo', valor: stats?.alertasRobo || 35, color: '#EF4444' },
    { tipo: 'Emergencia', valor: stats?.alertasEmergencia || 25, color: '#F59E0B' },
    { tipo: 'Sospechoso', valor: stats?.alertasSospechoso || 20, color: '#3B82F6' },
    { tipo: 'Incendio', valor: stats?.alertasIncendio || 10, color: '#10B981' },
    { tipo: 'Otro', valor: stats?.alertasOtro || 10, color: '#6B7280' },
  ];

  const statsData = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+4.75%',
      changeType: 'positive',
      icon: UsersIcon,
      bgColor: 'bg-blue-500',
      loading: isLoading,
    },
    {
      title: 'Alertas Activas',
      value: stats?.alertasActivas?.toLocaleString() || '0',
      change: '+12.3%',
      changeType: 'positive',
      icon: BellAlertIcon,
      bgColor: 'bg-red-500',
      loading: isLoading,
      pulse: (stats?.alertasActivas || 0) > 0,
    },
    {
      title: 'Alertas Hoy',
      value: stats?.alertasHoy?.toLocaleString() || '0',
      change: '-2.4%',
      changeType: 'negative',
      icon: ClockIcon,
      bgColor: 'bg-yellow-500',
      loading: isLoading,
    },
    {
      title: 'Usuarios Verificados',
      value: stats?.usuariosVerificados?.toLocaleString() || '0',
      change: '+5.1%',
      changeType: 'positive',
      icon: ShieldCheckIcon,
      bgColor: 'bg-green-500',
      loading: isLoading,
    },
  ];

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dashboard {user?.villaNombre && `- ${user.villaNombre}`}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Bienvenido, {user?.nombre || 'Admin'} • {user?.role === 'SUPER_ADMIN' ? 'Super Administrador' : 'Administrador de Villa'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> No se pudieron cargar las estadísticas.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {error.message || 'Error de conexión con el servidor'}
                </p>
                <button 
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid con animación */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg ${
                stat.pulse ? 'animate-pulse-slow' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="flex items-baseline">
                        {stat.loading ? (
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          <>
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.change}
                            </div>
                          </>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Alertas por Mes - Line Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Alertas por Mes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="alertas" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Alertas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas por Tipo - Pie Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertasPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {alertasPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de Alertas - Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Estado de Alertas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={[
                { estado: 'Activas', cantidad: stats?.alertasActivas || 0, fill: '#EF4444' },
                { estado: 'En Proceso', cantidad: stats?.alertasEnProceso || 0, fill: '#F59E0B' },
                { estado: 'Atendidas', cantidad: stats?.alertasAtendidas || 0, fill: '#10B981' },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="estado" 
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                {[
                  { estado: 'Activas', cantidad: stats?.alertasActivas || 0, fill: '#EF4444' },
                  { estado: 'En Proceso', cantidad: stats?.alertasEnProceso || 0, fill: '#F59E0B' },
                  { estado: 'Atendidas', cantidad: stats?.alertasAtendidas || 0, fill: '#10B981' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Últimos eventos en el sistema
              </p>
            </div>
            <a 
              href="/dashboard/alertas"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Ver todas →
            </a>
          </div>
          <ul className="divide-y divide-gray-200">
            {stats?.actividadReciente && stats.actividadReciente.length > 0 ? (
              stats.actividadReciente.slice(0, 5).map((item, index) => (
                <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        item.tipo === 'alerta' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {item.tipo === 'alerta' ? (
                          <BellAlertIcon className="h-6 w-6 text-red-600" />
                        ) : (
                          <UsersIcon className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.accion}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.usuario} • {item.tiempo}
                        </div>
                      </div>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 ml-4" />
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center">
                <BellAlertIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No hay actividad reciente</p>
              </li>
            )}
          </ul>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center text-xs text-gray-500">
          <p>Actualización automática cada 30 segundos • Última actualización: {new Date().toLocaleTimeString('es-CL')}</p>
        </div>
      </div>

      {/* CSS para animación de pulse lento */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </Layout>
  );
}