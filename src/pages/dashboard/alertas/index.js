// src/pages/dashboard/alertas/index.js - VERSIÓN CORREGIDA

import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { 
  BellAlertIcon, 
  MapPinIcon, 
  UserIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AlertasPage() {
  const router = useRouter();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Informe IA
  const [informe, setInforme] = useState(null);
  const [loadingInforme, setLoadingInforme] = useState(false);
  const [errorInforme, setErrorInforme] = useState(null);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroComuna, setFiltroComuna] = useState('TODOS');
  const [filtroSector, setFiltroSector] = useState('TODOS');

  useEffect(() => {
    cargarAlertas();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      cargarAlertas(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarAlertas = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      console.log('🔍 Cargando alertas desde:', `${API_URL}/api/alertas/activas`);

      const response = await fetch(`${API_URL}/api/alertas/activas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Importante para cookies de sesión
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor inicia sesión.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Data recibida:', data);

      // ✅ Manejar diferentes formatos de respuesta del backend
      let alertasArray = [];
      
      if (data.alertas && Array.isArray(data.alertas)) {
        alertasArray = data.alertas;
      } else if (Array.isArray(data)) {
        alertasArray = data;
      } else if (data.content && Array.isArray(data.content)) {
        alertasArray = data.content;
      }

      console.log(`📊 Total alertas cargadas: ${alertasArray.length}`);
      setAlertas(alertasArray);

    } catch (err) {
      console.error('❌ Error al cargar alertas:', err);
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Llamar al backend para generar informe IA
  const generarInforme = async () => {
    try {
      setLoadingInforme(true);
      setErrorInforme(null);
      setInforme(null);

      // Endpoint fijo para servicio de informes IA según requerimiento
      // Debe ser POST con body {} según especificación del backend
      const response = await fetch('http://localhost:8082/api/alertas/informe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setInforme(data);
    } catch (e) {
      setErrorInforme(e.message || 'Error al generar el informe');
    } finally {
      setLoadingInforme(false);
    }
  };

  // ✅ Aplicar filtros
  const alertasFiltradas = alertas.filter((alerta) => {
    if (filtroTipo !== 'TODOS' && alerta.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'TODOS' && alerta.estado !== filtroEstado) return false;
    if (filtroComuna !== 'TODOS' && alerta.comuna !== filtroComuna) return false;
    if (filtroSector !== 'TODOS' && alerta.sector !== filtroSector) return false;
    return true;
  });

  // ✅ Obtener valores únicos para filtros
  const comunasUnicas = Array.from(
    new Set(alertas.map((a) => a.comuna).filter(Boolean))
  ).sort();

  const sectoresUnicos = Array.from(
    new Set(alertas.map((a) => a.sector).filter(Boolean))
  ).sort();

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

            {/* Filtro por Comuna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comuna
              </label>
              <select
                value={filtroComuna}
                onChange={(e) => setFiltroComuna(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={comunasUnicas.length === 0}
              >
                <option value="TODOS">Todas las comunas</option>
                {comunasUnicas.map((comuna) => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
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
                    Sector {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Botón Refrescar */}
          <div className="mt-4">
            <button
              onClick={() => cargarAlertas()}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Actualizando...' : '🔄 Refrescar'}
            </button>
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

        {/* IA Info + Generador de Informe */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-items-start flex-wrap gap-3 ms-2">


            <button
              onClick={generarInforme}
              disabled={loadingInforme}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              title="Generar Informe con IA"
            >
              <img src="/gemini-color.png" alt="IA" className="w-5 h-5" />
              {loadingInforme ? 'Generando...' : 'Generar Informe con IA'}
              {loadingInforme && (
                <span className="ml-1 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>

          {errorInforme && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {errorInforme}
            </div>
          )}

          {informe && (
            <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Estado:</span> {informe.status || 'N/D'}
              </div>
              {typeof informe.totalAlertas !== 'undefined' && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Total alertas:</span> {informe.totalAlertas}
                </div>
              )}
              {informe.filtros && (
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Rango:</span> {informe.filtros.fechaInicio} — {informe.filtros.fechaFin}
                </div>
              )}

              {informe.informeAi && (
                <div className="mt-2">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Informe IA</div>
                  <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                    <Markdown>{informe.informeAi}</Markdown>
                  </div>
                </div>
              )}

              {/* Toggle para ver JSON completo */}
              <details className="mt-2">
                <summary className="text-xs text-blue-700 cursor-pointer">Ver JSON completo</summary>
                <pre className="text-xs mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200 overflow-auto">
{JSON.stringify(informe, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Lista de Alertas */}
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
              {alertas.length === 0 && (
                <button
                  onClick={() => cargarAlertas()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Recargar
                </button>
              )}
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

// Componente AlertaCard
function AlertaCard({ alerta, onClick }) {
  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'ACTIVA': return 'bg-red-100 text-red-800 border-red-200';
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ATENDIDA': return 'bg-green-100 text-green-800 border-green-200';
      case 'FALSA': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUbicacionCompleta = () => {
    const partes = [];
    if (alerta.ciudad) partes.push(alerta.ciudad);
    if (alerta.comuna) partes.push(alerta.comuna);
    if (alerta.sector) partes.push(`Sector ${alerta.sector}`);
    return partes.length > 0 ? partes.join(' > ') : 'Sin ubicación';
  };

  return (
    <div 
      onClick={onClick}
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Título y Estado */}
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {alerta.tipoTitulo || alerta.tipo || 'ALERTA'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(alerta.estado)}`}>
              {alerta.estado}
            </span>
          </div>
          
          {/* Descripción */}
          {(alerta.descripcion || alerta.tipoDescripcion) && (
            <p className="text-sm text-gray-600 mb-3">
              {alerta.descripcion || alerta.tipoDescripcion}
            </p>
          )}
          
          {/* Badges de ubicación */}
          {(alerta.ciudad || alerta.comuna || alerta.sector) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {alerta.ciudad && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  🏙️ {alerta.ciudad}
                </span>
              )}
              {alerta.comuna && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  🏘️ {alerta.comuna}
                </span>
              )}
              {alerta.sector && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  🔷 Sector {alerta.sector}
                </span>
              )}
            </div>
          )}
          
          {/* Información adicional */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="font-medium">{getUbicacionCompleta()}</span>
            </div>
            
            {(alerta.nombreUsuario || alerta.apellidoUsuario) && (
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{alerta.nombreUsuario} {alerta.apellidoUsuario}</span>
              </div>
            )}
            
            {alerta.fechaHora && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{new Date(alerta.fechaHora).toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Ícono de alerta */}
        <ExclamationTriangleIcon className={`h-8 w-8 flex-shrink-0 ${
          alerta.estado === 'ACTIVA' ? 'text-red-500' : 'text-gray-400'
        }`} />
      </div>
    </div>
  );
}