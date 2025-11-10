// src/components/dashboard/UserSearch.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  UserIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Ingresa un email o RUT para buscar');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search?query=${encodeURIComponent(searchQuery.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'success') {
          setSearchResult(data.user);
          setError(null);
        } else {
          setSearchResult(null);
          setError('Usuario no encontrado');
        }
      } else {
        setError(data.message || 'Error en la búsqueda');
      }

    } catch (error) {
      console.error('Error searching user:', error);
      setError('Error de conexión al buscar usuario');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError(null);
    setHasSearched(false);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getRoleDisplayText = (role) => {
    if (!role) return 'Sin Rol';
    return role === 'ADMIN' ? 'Administrador' : 'Usuario';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Buscar Usuario Específico</h3>
        <p className="text-sm text-gray-600">
          Ingresa el email o RUT del usuario para obtener información completa
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por email o RUT (ej: usuario@email.com, 12345678-9)"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={loading}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
              {error === 'Usuario no encontrado' && (
                <p className="text-sm text-red-600 mt-1">
                  Verifica que el email o RUT sea correcto
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && !searchResult && !error && !loading && (
        <div className="text-center py-8">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontró el usuario</h3>
          <p className="mt-1 text-sm text-gray-500">
            No existe ningún usuario con "{searchQuery}"
          </p>
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Usuario Encontrado</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/users/${searchResult.usuarioId}`)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Ver Detalles
              </button>
              <button
                onClick={() => router.push(`/dashboard/users/${searchResult.usuarioId}/edit`)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                Editar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Información Personal */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Información Personal</h5>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Nombre:</span> {searchResult.nombre} {searchResult.apellido}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Email:</span> {searchResult.email}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">RUT:</span> {searchResult.rut || 'No registrado'}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">ID:</span> {searchResult.usuarioId}
                </p>
              </div>
            </div>

            {/* Estado y Rol */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Estado y Permisos</h5>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 font-medium mr-2">Estado:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    searchResult.estadoCuenta 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {searchResult.estadoCuenta ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 font-medium mr-2">Verificación:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    searchResult.verificado 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {searchResult.verificado ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 font-medium mr-2">Rol:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    searchResult.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getRoleDisplayText(searchResult.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Información Adicional</h5>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Registro:</span> {formatDate(searchResult.fechaRegistro)}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Dirección:</span> {searchResult.direccion || 'No registrada'}
                </p>
                {(searchResult.latitud && searchResult.longitud) && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Coordenadas:</span> {searchResult.latitud}, {searchResult.longitud}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}