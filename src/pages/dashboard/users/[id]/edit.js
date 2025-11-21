// pages/dashboard/users/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { usersService } from '@/lib/api/users';
import { geografiaService } from '@/lib/api/geografia';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin, canChangeRoles } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedVillaId, setSelectedVillaId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    password: '',
    direccion: '',
    latitud: '',
    longitud: '',
    sector: '',
    role: 'VECINO',
    villaId: null,
  });

  // Query para obtener usuario
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });

  // Query para obtener villas (solo SUPER_ADMIN)
  const { data: villasData } = useQuery({
    queryKey: ['villas'],
    queryFn: () => geografiaService.getVillas(),
    enabled: isSuperAdmin(),
  });

  // Query para obtener sectores de la villa seleccionada
  const { data: sectoresData } = useQuery({
    queryKey: ['villaSectores', selectedVillaId],
    queryFn: () => geografiaService.getSectoresByVilla(selectedVillaId),
    enabled: !!selectedVillaId,
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (userData?.user) {
      const user = userData.user;
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        rut: user.rut || '',
        password: '',
        direccion: user.direccion || '',
        latitud: user.latitud || '',
        longitud: user.longitud || '',
        sector: user.sector || '',
        role: user.role || 'VECINO',
        villaId: user.villaId || null,
      });
      setSelectedVillaId(user.villaId);
    }
  }, [userData]);

  // Mutation para actualizar usuario
  const updateMutation = useMutation({
    mutationFn: (data) => usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id]);
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['recentUsers']);
      router.push(`/dashboard/users/${id}?success=Usuario actualizado exitosamente`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia la villa, resetear el sector
    if (name === 'villaId') {
      setSelectedVillaId(value ? parseInt(value) : null);
      setFormData(prev => ({
        ...prev,
        villaId: value ? parseInt(value) : null,
        sector: '', // Reset sector cuando cambia villa
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que ADMIN_VILLA no cambie el rol
    if (!canChangeRoles() && userData?.user?.role !== formData.role) {
      alert('No tienes permisos para cambiar roles de usuario');
      return;
    }

    const updateData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      rut: formData.rut,
      direccion: formData.direccion || null,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
      sector: formData.sector || null,
      role: formData.role,
    };

    // Solo SUPER_ADMIN puede cambiar villa
    if (isSuperAdmin() && formData.villaId) {
      updateData.villaId = formData.villaId;
    }

    // Solo incluir password si se proporcionó uno nuevo
    if (formData.password && formData.password.trim() !== '') {
      updateData.password = formData.password;
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuario...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error.message || 'Usuario no encontrado'}</p>
          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Volver
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Obtener lista de sectores disponibles
  const availableSectores = sectoresData?.sectores || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Editar Usuario</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Actualiza la información del usuario
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {updateMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">
              {updateMutation.error?.response?.data?.message || updateMutation.error?.message || 'Error al actualizar usuario'}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    required
                    value={formData?.nombre}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    id="apellido"
                    required
                    value={formData?.apellido}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                    RUT
                  </label>
                  <input
                    type="text"
                    name="rut"
                    id="rut"
                    value={formData?.rut}
                    onChange={handleChange}
                    placeholder="12345678-9"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData?.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Nueva Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData?.password}
                      onChange={handleChange}
                      placeholder="Dejar vacío para no cambiar"
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Deja este campo vacío si no quieres cambiar la contraseña
                  </p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData?.role}
                    onChange={handleChange}
                    disabled={!canChangeRoles()}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="VECINO">Vecino</option>
                    <option value="ADMIN_VILLA">Admin Villa</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  {!canChangeRoles() && (
                    <p className="mt-1 text-sm text-gray-500">
                      Solo SUPER_ADMIN puede cambiar roles
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Villa y Sector */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Villa y Sector</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Villa (solo SUPER_ADMIN) */}
                {isSuperAdmin() && (
                  <div>
                    <label htmlFor="villaId" className="block text-sm font-medium text-gray-700">
                      Villa
                    </label>
                    <select
                      name="villaId"
                      id="villaId"
                      value={formData?.villaId || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Sin villa</option>
                      {villasData?.villas?.map((villa) => (
                        <option key={villa?.id} value={villa?.id}>
                          {villa?.nombre} - {villa?.comunaNombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sector */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  {availableSectores.length > 0 ? (
                    <select
                      name="sector"
                      id="sector"
                      value={formData?.sector || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar sector</option>
                      {availableSectores.map((sector, index) => (
                        <option key={index} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="sector"
                      id="sector"
                      value={formData?.sector}
                      onChange={handleChange}
                      placeholder="Ej: Sector A, Plaza Central"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                  {selectedVillaId && availableSectores.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Esta villa no tiene sectores definidos
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <textarea
                    name="direccion"
                    id="direccion"
                    rows={2}
                    value={formData?.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, comuna"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="latitud" className="block text-sm font-medium text-gray-700">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitud"
                    id="latitud"
                    placeholder="-33.4489"
                    value={formData?.latitud}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="longitud" className="block text-sm font-medium text-gray-700">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitud"
                    id="longitud"
                    placeholder="-70.6693"
                    value={formData?.longitud}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}