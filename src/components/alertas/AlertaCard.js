// src/components/alertas/AlertaCard.js
import { ClockIcon, MapPinIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AlertaCard({ alerta, onClick }) {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EN_PROCESO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ATENDIDA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FALSA':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'EMERGENCIA':
        return 'text-red-600';
      case 'ROBO':
        return 'text-orange-600';
      case 'INCENDIO':
        return 'text-red-500';
      case 'SOSPECHOSO':
        return 'text-yellow-600';
      case 'VANDALISMO':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getEstadoColor(alerta.estado).replace('text-', 'bg-').replace('800', '100')}`}>
            <ExclamationTriangleIcon className={`h-6 w-6 ${getTipoColor(alerta.tipo)}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${getTipoColor(alerta.tipo)}`}>
              {alerta.tipoTitulo}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(alerta.estado)}`}>
                {alerta.estado.replace('_', ' ')}
              </span>
              {alerta.silenciosa && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  🔇 SILENCIOSA
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <p className="text-gray-700 mb-3 text-sm">
        {alerta.descripcion || alerta.tipoDescripcion}
      </p>

      {/* Información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Reportado por:</p>
            <p>{alerta.nombreUsuario} {alerta.apellidoUsuario}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Ubicación:</p>
            <p>{alerta.direccion || 'No disponible'}</p>
            <p className="text-xs text-gray-500">Sector: {alerta.sector}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Fecha y Hora:</p>
            <p>{formatFecha(alerta.fechaHora)}</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Ver Detalles
        </button>
        {alerta.estado === 'ACTIVA' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Abrir modal de atención
            }}
            className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            Atender
          </button>
        )}
      </div>
    </div>
  );
}