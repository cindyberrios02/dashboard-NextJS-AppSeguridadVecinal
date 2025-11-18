// src/pages/dashboard/users/new.js
import Layout from "@/components/layout/Layout";
import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { usersService } from '@/lib/api/users';
import { geografiaService } from '@/lib/api/geografia';
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

export default function NewUser() {
  const router = useRouter();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedVillaId, setSelectedVillaId] = useState(currentUser?.villaId || null);
  
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
    villaId: currentUser?.villaId || null
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

  // Mutation para crear usuario
  const createMutation = useMutation({
    mutationFn: (data) => usersService.createUser(data),
    onSuccess: (response) => {
      console.log('✅ Usuario creado:', response);
      router.push('/dashboard/users?success=Usuario creado exitosamente');
    },
    onError: (error) => {
      console.error('❌ Error al crear usuario:', error);
    }
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

    const submitData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      rut: formData.rut,
      password: formData.password,
      direccion: formData.direccion || null,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
      sector: formData.sector || null,
      role: formData.role,
      villaId: formData.villaId,
    };

    console.log('📤 Enviando datos:', submitData);
    createMutation.mutate(submitData);
  };

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
                <h1 className="text-2xl font-semibold text-gray-900">Crear Nuevo Usuario</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Completa la información para registrar un nuevo usuario
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">
              {createMutation.error?.response?.data?.message || 
               createMutation.error?.message || 
               'Error al crear usuario'}
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
                    value={formData.nombre}
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
                    value={formData.apellido}
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
                    placeholder="12345678-9"
                    value={formData.rut}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rol *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="VECINO">Vecino</option>
                    <option value="ADMIN_VILLA">Admin Villa</option>
                    {isSuperAdmin() && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Villa y Sector */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Villa y Sector</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Villa */}
                <div>
                  <label htmlFor="villaId" className="block text-sm font-medium text-gray-700">
                    Villa {isSuperAdmin() ? '*' : ''}
                  </label>
                  {isSuperAdmin() ? (
                    <select
                      name="villaId"
                      id="villaId"
                      required
                      value={formData.villaId || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar villa</option>
                      {villasData?.villas?.map((villa) => (
                        <option key={villa.id} value={villa.id}>
                          {villa.nombre} - {villa.comunaNombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentUser?.villaNombre || 'Sin villa'}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-100 cursor-not-allowed sm:text-sm"
                    />
                  )}
                </div>

                {/* Sector */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  {availableSectores.length > 0 ? (
                    <select
                      name="sector"
                      id="sector"
                      value={formData.sector || ''}
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
                      placeholder="Ej: Sector A, Plaza Central"
                      value={formData.sector}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                  {selectedVillaId && availableSectores.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Esta villa no tiene sectores predefinidos
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación (Opcional)</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <textarea
                    name="direccion"
                    id="direccion"
                    rows={2}
                    placeholder="Calle, número, comuna"
                    value={formData.direccion}
                    onChange={handleChange}
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
                    value={formData.latitud}
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
                    value={formData.longitud}
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
                disabled={createMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Crear Usuario
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