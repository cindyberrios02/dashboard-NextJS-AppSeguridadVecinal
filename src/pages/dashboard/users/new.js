// src/pages/dashboard/users/new.js
import Layout from "../../../components/layout/Layout";
import { useState } from "react";
import { useRouter } from "next/router";
import { fetchWithAuth } from '../../../../lib/fetch-with-auth';
import { 
  UserPlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

export default function NewUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    password: '',
    direccion: '',
    latitud: null,
    longitud: null,
    sector: '',
    role: 'VECINO'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Convertir coordenadas a números si existen
    const submitData = {
      ...formData,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null
    };

    console.log('📤 Enviando datos:', submitData);

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
      {
        method: 'POST',
        body: JSON.stringify(submitData)
      }
    );

    console.log('📡 Response status:', response.status);

    // Si la respuesta es exitosa pero está vacía
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Usuario creado exitosamente');
      router.push('/dashboard/users?success=Usuario creado exitosamente');
      return;
    }

    // Intentar parsear JSON solo si hay contenido
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Usuario creado:', data);
        router.push('/dashboard/users?success=Usuario creado exitosamente');
      } else {
        setError(data.message || 'Error al crear usuario');
      }
    } else {
      // Si no hay JSON, pero la respuesta fue exitosa
      if (response.ok) {
        router.push('/dashboard/users?success=Usuario creado exitosamente');
      } else {
        const text = await response.text();
        console.error('Error response:', text);
        setError('Error al crear usuario');
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    setError('Error de conexión: ' + error.message);
  } finally {
    setLoading(false);
  }
};
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                    RUT *
                  </label>
                  <input
                    type="text"
                    name="rut"
                    id="rut"
                    required
                    placeholder="12345678-9"
                    value={formData.rut}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="VECINO">Vecino</option>
                    <option value="ADMIN_VILLA">Administrador Villa</option>
                    <option value="SUPER_ADMIN">Super Administrador</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <textarea
                    name="direccion"
                    id="direccion"
                    rows={3}
                    value={formData.direccion}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* AGREGAR este div completo para el sector */}
                <div className="sm:col-span-2">
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  <input
                    type="text"
                    name="sector"
                    id="sector"
                    placeholder="Ej: Plaza Central, Calle 1, Pasaje Los Álamos"
                    value={formData.sector}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Especifica el sector o área dentro de la villa donde vive el usuario
                  </p>
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
                    value={formData.latitud || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    value={formData.longitud || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
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