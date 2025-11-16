// src/pages/dashboard/users/[id].js
import Layout from "../../../components/layout/Layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchWithAuth } from '../../../../lib/fetch-with-auth';
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
  CalendarIcon
} from "@heroicons/react/24/outline";

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`
    );

    const data = await response.json();

    if (response.ok) {
      setUser(data.user);
    } else {
      setError(data.message || 'Usuario no encontrado');
    }
    
  } catch (error) {
    console.error('Error fetching user:', error);
    setError('Error de conexión al obtener usuario');
  } finally {
    setLoading(false);
  }
};

  const handleVerificationToggle = async () => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}/verification`,
      { method: 'PUT' }
    );

    if (response.ok) {
      fetchUser();
    }
  } catch (error) {
    console.error('Error toggling verification:', error);
  }
};

 const handleStatusToggle = async () => {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}/status`,
      { method: 'PUT' }
    );

    if (response.ok) {
      fetchUser();
    }
  } catch (error) {
    console.error('Error toggling status:', error);
  }
};

 const handleDelete = async () => {
  if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        router.push('/dashboard/users?success=Usuario eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
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

  const getRoleBadgeColor = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    return role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
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

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Usuario no encontrado</h3>
        </div>
      </Layout>
    );
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user.nombre} {user.apellido}
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                  ID: {user.usuarioId} • {getRoleDisplayText(user.role)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard/users/${id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 bg-white shadow-sm rounded-lg">
            <div className="px-6 py-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.nombre} {user.apellido}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">RUT</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.rut || 'No registrado'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                    {user.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    {formatDate(user.fechaRegistro)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                    {user.direccion || 'No registrada'}
                  </dd>
                </div>

                {(user.latitud && user.longitud) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Coordenadas</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Lat: {user.latitud}, Lng: {user.longitud}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Estado de la Cuenta
                </h3>
                
                <div className="space-y-4">
                  {/* Account Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado de Cuenta</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.estadoCuenta 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.estadoCuenta ? 'Activa' : 'Inactiva'}
                        </span>
                      </dd>
                    </div>
                    <button
                      onClick={handleStatusToggle}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        user.estadoCuenta
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {user.estadoCuenta ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verificación</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.verificado 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.verificado ? 'Verificado' : 'Pendiente'}
                        </span>
                      </dd>
                    </div>
                    <button
                      onClick={handleVerificationToggle}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        user.verificado
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {user.verificado ? 'Desverificar' : 'Verificar'}
                    </button>
                  </div>

                  {/* Role */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rol</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayText(user.role)}
                      </span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/dashboard/users/${id}/edit`)}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar Usuario
                  </button>
                  
                  <button
                    onClick={handleVerificationToggle}
                    className={`w-full flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md ${
                      user.verificado
                        ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {user.verificado ? 'Desverificar' : 'Verificar'}
                  </button>
                  
                  <button
                    onClick={handleStatusToggle}
                    className={`w-full flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md ${
                      user.estadoCuenta
                        ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    {user.estadoCuenta ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}