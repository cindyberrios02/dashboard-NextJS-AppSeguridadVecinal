// src/pages/dashboard/alertas/analytics.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { alertasService } from '../../../../lib/api/alertas';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const COLORS = {
  ROBO: '#ef4444',
  EMERGENCIA: '#f59e0b',
  INCENDIO: '#dc2626',
  SOSPECHOSO: '#eab308',
  OTRO: '#6b7280',
};

const ESTADO_COLORS = {
  ACTIVA: '#ef4444',
  EN_PROCESO: '#f59e0b',
  RESUELTA: '#10b981',
  CANCELADA: '#6b7280',
};

export default function AlertasAnalytics() {
  const { user, isSuperAdmin } = useAuth();
  const [filters, setFilters] = useState({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    villaId: null,
    sector: null,
  });

  // Query para estadísticas
  const { data: statsData, isLoading, error, refetch } = useQuery({
    queryKey: ['alertasStats', filters],
    queryFn: () => alertasService.getStats(filters),
  });

  const stats = statsData?.stats || {};
  const filtrosActivos = statsData?.filtros || {};

  // Preparar datos para gráficos
  const alertasPorTipoData = Object.entries(stats.alertasPorTipo || {}).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
    color: COLORS[tipo] || COLORS.OTRO,
  }));

  const alertasPorEstadoData = Object.entries(stats.alertasPorEstado || {}).map(([estado, cantidad]) => ({
    estado,
    cantidad,
  }));

  const alertasPorDiaData = Object.entries(stats.alertasPorDia || {})
    .map(([fecha, cantidad]) => ({
      fecha: new Date(fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }),
      cantidad,
    }))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const alertasPorHoraData = Object.entries(stats.alertasPorHora || {})
    .map(([hora, cantidad]) => ({
      hora: `${hora}:00`,
      cantidad,
    }))
    .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));

  const topSectoresData = stats.topSectores || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleApplyFilters = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar estadísticas: {error.message}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Análisis de Alertas</h1>
            <p className="text-gray-600 mt-1">Estadísticas y gráficos de alertas del sistema</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={filters.fechaInicio}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={filters.fechaFin}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isSuperAdmin() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Villa (ID)
                </label>
                <input
                  type="number"
                  name="villaId"
                  value={filters.villaId || ''}
                  onChange={handleFilterChange}
                  placeholder="Todas las villas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Alertas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAlertas || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Alertas Silenciosas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.porcentajeSilenciosas || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resueltas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.alertasPorEstado?.RESUELTA || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sectores Activos</p>
                <p className="text-2xl font-bold text-gray-900">{topSectoresData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico: Alertas por Tipo */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertasPorTipoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6">
                  {alertasPorTipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico: Alertas por Estado */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas por Estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertasPorEstadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {alertasPorEstadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ESTADO_COLORS[entry.estado] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico: Alertas por Día */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia (Últimos 7 días)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertasPorDiaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico: Alertas por Hora */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas por Hora del Día</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertasPorHoraData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla: Top Sectores */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Sectores con más Alertas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSectoresData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((item.cantidad / stats.totalAlertas) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}