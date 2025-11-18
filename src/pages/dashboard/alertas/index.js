// src/pages/dashboard/alertas/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ExclamationTriangleIcon, 
  BellAlertIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function AlertasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroSector, setFiltroSector] = useState('TODOS');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      cargarAlertas();
      
      // Auto-refresh cada 30 segundos
      const interval = setInterval(() => {
        cargarAlertas(false);
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setError('No hay sesión activa. Por favor inicia sesión.');
      setLoading(false);
    }
  }, []);

  const cargarAlertas = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // TODO: Implementar llamada a API cuando esté disponible
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/alertas`);
      // const data = await response.json();
      // setAlertas(data.alertas || []);
      
      // Por ahora, datos de ejemplo
      setAlertas([]);
      
    } catch (err) {
      console.error('Error cargando alertas:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Error de autenticación. Por favor inicia sesión.');
      } else {
        setError(`Error al conectar con el servidor: ${err.message}`);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Aplicar filtros
  const alertasFiltradas = alertas.filter((alerta) => {
    if (filtroTipo !== 'TODOS' && alerta.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'TODOS' && alerta.estado !== filtroEstado) return false;
    if (filtroSector !== 'TODOS' && alerta.sector !== filtroSector) return false;
    return true;
  });

  // Obtener sectores únicos
  const sectoresUnicos = Array.from(
    new Set(alertas.map((a) => a.sector).filter(Boolean))
  );

  // Contar alertas por estado
  const contarPorEstado = (estado) => 
    alertas.filter((a) => a.estado === estado).length;

  if (loading && alertas.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando alertas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sistema de Alertas
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitoreo en tiempo real de alertas de seguridad vecinal
          </p>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
              <button 
                onClick={() => cargarAlertas()}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="EMERGENCIA">Emergencia</option>
                <option value="ROBO">Robo</option>
                <option value="SOSPECHOSO">Sospechoso</option>
                <option value="VANDALISMO">Vandalismo</option>
                <option value="ACCIDENTE">Accidente</option>
                <option value="INCENDIO">Incendio</option>
                <option value="RUIDO">Ruido</option>
                <option value="MASCOTA_PERDIDA">Mascota Perdida</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="ATENDIDA">Atendida</option>
                <option value="FALSA">Falsa</option>
              </select>
            </div>

            {/* Filtro por Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector
              </label>
              <select
                value={filtroSector}
                onChange={(e) => setFiltroSector(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sectoresUnicos.length === 0}
              >
                <option value="TODOS">Todos los sectores</option>
                {sectoresUnicos.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Refrescar */}
            <div className="flex items-end">
              <button
                onClick={() => cargarAlertas()}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                🔄 Refrescar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600 text-sm font-medium">Activas</p>
            <p className="text-3xl font-bold text-red-700">
              {contarPorEstado('ACTIVA')}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-600 text-sm font-medium">En Proceso</p>
            <p className="text-3xl font-bold text-yellow-700">
              {contarPorEstado('EN_PROCESO')}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-600 text-sm font-medium">Atendidas</p>
            <p className="text-3xl font-bold text-green-700">
              {contarPorEstado('ATENDIDA')}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold text-gray-700">{alertas.length}</p>
          </div>
        </div>

        {/* Lista de Alertas o Estado Vacío */}
        <div className="bg-white rounded-lg shadow">
          {alertasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <BellAlertIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin alertas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {alertas.length === 0 
                  ? 'No hay alertas registradas en el sistema'
                  : 'No hay alertas que coincidan con los filtros seleccionados'}
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Módulo en desarrollo
                </span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alertasFiltradas.map((alerta) => (
                <AlertaCard
                  key={alerta.alertaId}
                  alerta={alerta}
                  onClick={() => router.push(`/dashboard/alertas/${alerta.alertaId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Componente para mostrar cada alerta
function AlertaCard({ alerta, onClick }) {
  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'ACTIVA': return 'bg-red-100 text-red-800';
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-800';
      case 'ATENDIDA': return 'bg-green-100 text-green-800';
      case 'FALSA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">{alerta.tipo}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(alerta.estado)}`}>
              {alerta.estado}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            {alerta.descripcion && (
              <p className="text-sm text-gray-600">{alerta.descripcion}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {alerta.sector && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {alerta.sector}
                </div>
              )}
              {alerta.usuarioNombre && (
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {alerta.usuarioNombre}
                </div>
              )}
              {alerta.fechaCreacion && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(alerta.fechaCreacion).toLocaleString('es-CL')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  );
}