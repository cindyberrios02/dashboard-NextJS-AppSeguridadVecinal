// src/pages/dashboard/users/index.js
import Layout from "../../../components/layout/Layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  MagnifyingGlassIcon,
  UserIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  UsersIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  PencilIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function UsersManagement() {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCurrentPage, setSearchCurrentPage] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchTotalElements, setSearchTotalElements] = useState(0);
  const [searchPageSize] = useState(20);
  const [searchTips, setSearchTips] = useState([]);

  // Recent users state
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);
  const [recentCurrentPage, setRecentCurrentPage] = useState(0);
  const [recentTotalPages, setRecentTotalPages] = useState(0);
  const [recentTotalElements, setRecentTotalElements] = useState(0);
  const [recentPageSize] = useState(10);

  // Load recent users on component mount
  useEffect(() => {
    fetchRecentUsers();
  }, [recentCurrentPage]);

  const fetchRecentUsers = async () => {
    try {
      setRecentLoading(true);
      setRecentError(null);

      const params = new URLSearchParams({
        page: recentCurrentPage,
        size: recentPageSize,
        sortBy: 'fechaRegistro',
        sortDir: 'desc'
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setRecentUsers(data.users || []);
      setRecentTotalPages(data.totalPages || 0);
      setRecentTotalElements(data.totalElements || 0);
      
    } catch (error) {
      console.error('Error fetching recent users:', error);
      setRecentError(error.message);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleSearch = async (e, page = 0) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Ingresa un término de búsqueda');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: searchQuery.trim(),
        page: page,
        size: searchPageSize
      });

      console.log('Enviando request a:', `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search-global?${params}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search-global?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        }
      );

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('La respuesta del servidor está vacía');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw new Error(`Respuesta del servidor no es JSON válido: ${responseText.substring(0, 100)}`);
      }

      if (response.ok) {
        if (data.status === 'success') {
          setSearchResults(data.users || []);
          setSearchTotalPages(data.totalPages || 0);
          setSearchTotalElements(data.totalElements || 0);
          setSearchCurrentPage(data.currentPage || 0);
          setSearchTips(data.searchTips || []);
          setSearchError(null);
        } else {
          setSearchResults([]);
          setSearchError('No se encontraron usuarios');
        }
      } else {
        console.error('Server error response:', data);
        setSearchError(data.message || `Error del servidor: ${response.status}`);
      }

    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError(`Error de conexión: ${error.message}`);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchPageChange = (newPage) => {
    setSearchCurrentPage(newPage);
    handleSearch(null, newPage);
  };

  const handleRecentPageChange = (newPage) => {
    setRecentCurrentPage(newPage);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setHasSearched(false);
    setSearchCurrentPage(0);
    setSearchTotalPages(0);
    setSearchTotalElements(0);
  };

  const handleVerificationToggle = async (userId, isFromSearch = false) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/verification`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        }
      );

      if (response.ok) {
        // Refresh both lists
        fetchRecentUsers();
        if (isFromSearch && hasSearched && searchQuery) {
          handleSearch(null, searchCurrentPage);
        }
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const handleRoleChange = async (userId, newRole, isFromSearch = false) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ role: newRole })
        }
      );

      if (response.ok) {
        // Refresh both lists
        fetchRecentUsers();
        if (isFromSearch && hasSearched && searchQuery) {
          handleSearch(null, searchCurrentPage);
        }
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleStatusToggle = async (userId, isFromSearch = false) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        }
      );

      if (response.ok) {
        // Refresh both lists
        fetchRecentUsers();
        if (isFromSearch && hasSearched && searchQuery) {
          handleSearch(null, searchCurrentPage);
        }
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
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

  const getRoleBadgeColor = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    return role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const UserTableRow = ({ user, isFromSearch = false }) => (
    <tr key={user.usuarioId} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.nombre} {user.apellido}
            </div>
            <div className="text-sm text-gray-500">
              ID: {user.usuarioId} • RUT: {user.rut || 'No registrado'}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        <div className="text-sm text-gray-500">
          {user.direccion || 'Sin dirección'}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.estadoCuenta 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.estadoCuenta ? 'Activo' : 'Inactivo'}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.verificado 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.verificado ? 'Verificado' : 'Pendiente'}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role || ''}
          onChange={(e) => {
            const newRole = e.target.value;
            if (newRole && newRole !== user.role) {
              handleRoleChange(user.usuarioId, newRole, isFromSearch);
            }
          }}
          className={`text-sm rounded-md border-0 py-1 px-2 font-semibold ${getRoleBadgeColor(user.role)}`}
        >
          <option value="">Sin Rol</option>
          <option value="USER">Usuario</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(user.fechaRegistro)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleVerificationToggle(user.usuarioId, isFromSearch)}
            className={`p-2 rounded-full hover:bg-gray-100 ${
              user.verificado 
                ? 'text-yellow-600 hover:text-yellow-900' 
                : 'text-green-600 hover:text-green-900'
            }`}
            title={user.verificado ? 'Desverificar usuario' : 'Verificar usuario'}
          >
            {user.verificado ? (
              <ShieldExclamationIcon className="h-5 w-5" />
            ) : (
              <ShieldCheckIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={() => handleStatusToggle(user.usuarioId, isFromSearch)}
            className={`p-2 rounded-full hover:bg-gray-100 ${
              user.estadoCuenta 
                ? 'text-red-600 hover:text-red-900' 
                : 'text-green-600 hover:text-green-900'
            }`}
            title={user.estadoCuenta ? 'Desactivar cuenta' : 'Activar cuenta'}
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => router.push(`/dashboard/users/${user.usuarioId}`)}
            className="p-2 rounded-full hover:bg-gray-100 text-blue-600 hover:text-blue-900"
            title="Ver detalles del usuario"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  const TableHeaders = () => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Usuario
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contacto
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Estado
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Rol
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Registro
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );

  const Pagination = ({ currentPage, totalPages, onPageChange, totalElements, isSearch = false }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Anterior
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage + 1}</span> de{' '}
              <span className="font-medium">{totalPages}</span> 
              ({totalElements} {isSearch ? 'resultados' : 'usuarios'} totales)
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                const pageNumber = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + index;
                if (pageNumber >= totalPages) return null;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-2 text-sm text-gray-700">
              Busca usuarios específicos o revisa los usuarios más recientes
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => router.push('/dashboard/users/new')}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
            Búsqueda Específica de Usuarios
          </h2>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {searchLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email, RUT, estado, rol..."
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={searchLoading}
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
                disabled={searchLoading || !searchQuery.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>

          {/* Search Tips */}
          {searchTips.length > 0 && !hasSearched && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Tips de búsqueda:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {searchTips.map((tip, index) => (
                      <p key={index} className="text-xs text-blue-700">• {tip}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Error */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-red-800">{searchError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && searchResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Resultados de búsqueda
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTotalElements} usuario{searchTotalElements !== 1 ? 's' : ''} encontrado{searchTotalElements !== 1 ? 's' : ''} 
                  para "{searchQuery}"
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <TableHeaders />
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((user) => (
                      <UserTableRow key={user.usuarioId} user={user} isFromSearch={true} />
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={searchCurrentPage}
                totalPages={searchTotalPages}
                onPageChange={handleSearchPageChange}
                totalElements={searchTotalElements}
                isSearch={true}
              />
            </div>
          )}

          {/* Search No Results */}
          {hasSearched && searchResults.length === 0 && !searchError && !searchLoading && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay usuarios que coincidan con "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Recent Users Section */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Usuarios Recientes
            </h2>
            <p className="text-sm text-gray-500">
              Últimos usuarios registrados en el sistema ({recentTotalElements} total)
            </p>
          </div>

          {recentError && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-red-800">{recentError}</p>
                    <button 
                      onClick={fetchRecentUsers}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {recentLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <TableHeaders />
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <UserTableRow key={user.usuarioId} user={user} isFromSearch={false} />
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={recentCurrentPage}
                totalPages={recentTotalPages}
                onPageChange={handleRecentPageChange}
                totalElements={recentTotalElements}
                isSearch={false}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios registrados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aún no hay usuarios en el sistema
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}