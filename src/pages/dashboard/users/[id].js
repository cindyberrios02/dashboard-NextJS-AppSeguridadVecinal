// pages/dashboard/users/[id].js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from "@/components/layout/Layout";

import { usersService } from '@/lib/api/users';

import { 
  UserIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Obtener usuario
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });

  const user = userData?.user;

  // Mutación para actualizar rol
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => usersService.updateUserRole({ id, role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id]);
      setIsEditingRole(false);
      alert('Rol actualizado exitosamente');
    },
    onError: (error) => {
      alert(`Error al actualizar rol: ${error.response?.data?.message || error.message}`);
    },
  });

  // Mutación para toggle verificación
  const toggleVerificationMutation = useMutation({
    mutationFn: (id) => usersService.toggleVerification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id]);
    },
  });

  // Mutación para toggle estado
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => usersService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id]);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id) => usersService.deleteUser(id),
    onSuccess: () => {
      router.push('/dashboard/users?success=Usuario eliminado exitosamente');
    },
    onError: (error) => {
      alert(`Error al eliminar usuario: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleRoleUpdate = () => {
    if (!selectedRole) {
      alert('Por favor selecciona un rol');
      return;
    }
    updateRoleMutation.mutate({ id, role: selectedRole });
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id);
    }
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
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
    const roleMap = {
      'SUPER_ADMIN': 'Super Administrador',
      'ADMIN_VILLA': 'Administrador de Villa',
      'VECINO': 'Vecino',
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'ADMIN_VILLA': 'bg-blue-100 text-blue-800 border-blue-200',
      'VECINO': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Usuario no encontrado
          </h3>
          <button
            onClick={() => router.push('/dashboard/users')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Volver a usuarios
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a usuarios
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/dashboard/users/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={deleteMutation.isLoading}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {user.nombre} {user.apellido}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                {getRoleDisplayText(user.role)}
              </span>
              {user.verificado ? (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Verificado
                </span>
              ) : (
                <span className="flex items-center text-yellow-600 text-sm">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Sin verificar
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  RUT
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.rut || 'No disponible'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Dirección
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.direccion || 'No disponible'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Sector
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.sector || 'Sin asignar'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Fecha de Registro
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user.fechaRegistro)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Estado de Cuenta</dt>
                <dd className="mt-1">
                  {user.estadoCuenta ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Inactiva
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Role Management */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Gestión de Rol
            </h3>
            <div className="mt-4">
              {!isEditingRole ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Rol actual:</p>
                    <span className={`px-4 py-2 rounded-md text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayText(user.role)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingRole(true);
                      setSelectedRole(user.role);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Cambiar Rol
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar nuevo rol
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="VECINO">Vecino</option>
                      <option value="ADMIN_VILLA">Administrador de Villa</option>
                      <option value="SUPER_ADMIN">Super Administrador</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleRoleUpdate}
                      disabled={updateRoleMutation.isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateRoleMutation.isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setIsEditingRole(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => toggleVerificationMutation.mutate(id)}
                disabled={toggleVerificationMutation.isLoading}
                className="px-4 py-3 border-2 border-yellow-300 rounded-md hover:bg-yellow-50 transition-colors flex items-center justify-center"
              >
                {user.verificado ? 'Remover Verificación' : 'Verificar Usuario'}
              </button>
              <button
                onClick={() => toggleStatusMutation.mutate(id)}
                disabled={toggleStatusMutation.isLoading}
                className="px-4 py-3 border-2 border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                {user.estadoCuenta ? 'Desactivar Cuenta' : 'Activar Cuenta'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de eliminar a {user.nombre} {user.apellido}? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}