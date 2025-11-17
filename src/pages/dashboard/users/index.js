// src/pages/dashboard/users/index.js
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { usersService } from '@/lib/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [page, setPage] = useState(0);
  const size = 20;

  // Query para usuarios
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, searchQuery],
    queryFn: () => {
      if (searchQuery.trim()) {
        return usersService.searchUsers({ query: searchQuery, page, size });
      }
      return usersService.getRecentUsers({ page, size });
    },
    keepPreviousData: true,
  });

  // Mutations
  const toggleVerificationMutation = useMutation({
    mutationFn: (userId) => usersService.toggleVerification(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => usersService.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  // Filtrar por rol en el frontend
  const users = usersData?.users || [];
  const filteredUsers = filterRole === 'ALL'
    ? users
    : users.filter(u => u.role === filterRole);

  const totalPages = usersData?.totalPages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    refetch();
  };

  const handleEdit = (userId) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleDelete = async (userId, userName) => {
    if (confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        alert('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN_VILLA: 'bg-blue-100 text-blue-800',
      VECINO: 'bg-green-100 text-green-800',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">Error al cargar usuarios: {error.message}</p>
          <button onClick={() => refetch()} className="mt-2 text-blue-600 underline">
            Reintentar
          </button>
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
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-600">
              {usersData?.totalElements || 0} usuarios en total
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/users/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Nuevo Usuario
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email, RUT..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN_VILLA">Admin Villa</option>
                <option value="VECINO">Vecino</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                          <div className="text-sm text-gray-500">{usuario.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(usuario.role)}`}>
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.sector || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {usuario.verificado ? (
                          <span className="flex items-center text-green-600 text-xs">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Verificado
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600 text-xs">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Sin verificar
                          </span>
                        )}
                        {usuario.estadoCuenta ? (
                          <span className="text-green-600 text-xs">Activo</span>
                        ) : (
                          <span className="text-red-600 text-xs">Inactivo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleVerificationMutation.mutate(usuario.id)}
                          title={usuario.verificado ? 'Desverificar' : 'Verificar'}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(usuario.id)}
                          title="Editar"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteUserMutation.isLoading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}