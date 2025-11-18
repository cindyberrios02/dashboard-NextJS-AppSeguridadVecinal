// pages/dashboard/users/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import VerifyUserModal from '@/components/users/VerifyUserModal';
import { useAuth } from '@/contexts/AuthContext';
import { usersService } from '@/lib/api/users';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function UsersIndex() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin, canChangeRoles } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Query para usuarios recientes
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['recentUsers', currentPage],
    queryFn: () => usersService.getRecentUsers(currentPage, 20),
  });

  // Query para búsqueda
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['searchUsers', searchQuery, currentPage],
    queryFn: () => usersService.searchUsers(searchQuery, currentPage, 20),
    enabled: searchQuery.length > 0,
  });

  const displayData = searchQuery ? searchData : usersData;
  const users = displayData?.users || [];

  // Mutation para cambiar estado de cuenta
  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => usersService.toggleAccountStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['recentUsers']);
      queryClient.invalidateQueries(['searchUsers']);
    },
  });

  // Mutation para cambiar rol (solo SUPER_ADMIN)
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => usersService.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['recentUsers']);
      queryClient.invalidateQueries(['searchUsers']);
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const handleVerifyClick = (user) => {
    setSelectedUser(user);
    setVerifyModalOpen(true);
  };

  const handleRoleChange = (userId, newRole) => {
    if (!canChangeRoles()) {
      alert('Solo SUPER_ADMIN puede cambiar roles');
      return;
    }
    if (confirm(`¿Cambiar rol a ${newRole}?`)) {
      changeRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN_VILLA: 'bg-blue-100 text-blue-800',
      VECINO: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN_VILLA: 'Admin Villa',
      VECINO: 'Vecino',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-600">
              {isSuperAdmin() 
                ? 'Administra todos los usuarios del sistema' 
                : `Administra usuarios de ${currentUser?.villaNombre || 'tu villa'}`
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/dashboard/users/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Crear Usuario
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar por nombre, email, RUT..."
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Buscar
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {isLoading || searchLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      {isSuperAdmin() && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Villa
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verificado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.usuarioId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.nombre} {user.apellido}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canChangeRoles() ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.usuarioId, e.target.value)}
                              className="text-xs rounded-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="VECINO">Vecino</option>
                              <option value="ADMIN_VILLA">Admin Villa</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </td>
                        {isSuperAdmin() && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {user.villaNombre || 'Sin villa'}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {user.sector || 'Sin sector'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatusMutation.mutate(user.usuarioId)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.estadoCuenta
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {user.estadoCuenta ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleVerifyClick(user)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.verificado
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                            {user.verificado ? 'Verificado' : 'Pendiente'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/users/${user.usuarioId}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/users/${user.usuarioId}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {displayData && displayData.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(displayData.totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= displayData.totalPages - 1}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-medium">{currentPage + 1}</span> de{' '}
                        <span className="font-medium">{displayData.totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(displayData.totalPages - 1, currentPage + 1))}
                          disabled={currentPage >= displayData.totalPages - 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Verify Modal */}
      {selectedUser && (
        <VerifyUserModal
          isOpen={verifyModalOpen}
          onClose={() => {
            setVerifyModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            queryClient.invalidateQueries(['recentUsers']);
            queryClient.invalidateQueries(['searchUsers']);
          }}
        />
      )}
    </Layout>
  );
}