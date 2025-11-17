// components/users/VerifyUserModal.js
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/lib/api/users';
import { geografiaService } from '@/lib/api/geografia';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyUserModal({ isOpen, onClose, user, onSuccess }) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAdminVilla } = useAuth();
  const [selectedSector, setSelectedSector] = useState(user?.sector || '');
  const [error, setError] = useState('');

  // Obtener sectores disponibles
  const { data: sectoresData, isLoading: sectoresLoading } = useQuery({
    queryKey: ['sectores'],
    queryFn: () => usersService.getSectores(),
    enabled: isOpen,
  });

  // Si es ADMIN_VILLA, también obtener sectores de su villa específica
  const { data: villaData } = useQuery({
    queryKey: ['villaSectores', currentUser?.villaId],
    queryFn: () => geografiaService.getSectoresByVilla(currentUser.villaId),
    enabled: isOpen && isAdminVilla() && !!currentUser?.villaId,
  });

  useEffect(() => {
    if (user?.sector) {
      setSelectedSector(user.sector);
    }
  }, [user]);

  const verifyMutation = useMutation({
    mutationFn: (sector) => usersService.toggleVerification(user.usuarioId, sector),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', user.usuarioId]);
      queryClient.invalidateQueries(['recentUsers']);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error al verificar usuario');
    },
  });

  const handleVerify = () => {
    if (!user.verificado && !selectedSector) {
      setError('Debes seleccionar un sector para verificar al usuario');
      return;
    }
    setError('');
    verifyMutation.mutate(selectedSector);
  };

  // Determinar qué sectores mostrar
  const availableSectores = isAdminVilla() && villaData?.sectores 
    ? villaData.sectores 
    : sectoresData?.sectores || [];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {user?.verificado ? 'Desverificar Usuario' : 'Verificar Usuario'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {user?.verificado 
                          ? `¿Estás seguro que deseas desverificar a ${user.nombre} ${user.apellido}?`
                          : `Verifica a ${user?.nombre} ${user?.apellido} y asígnale un sector.`
                        }
                      </p>

                      {/* Selección de sector (solo si está verificando) */}
                      {!user?.verificado && (
                        <div className="mt-4">
                          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                            Sector *
                          </label>
                          <select
                            id="sector"
                            value={selectedSector}
                            onChange={(e) => {
                              setSelectedSector(e.target.value);
                              setError('');
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={sectoresLoading}
                          >
                            <option value="">Seleccionar sector</option>
                            {availableSectores.map((sector, index) => (
                              <option key={index} value={sector}>
                                {sector}
                              </option>
                            ))}
                          </select>
                          {isAdminVilla() && (
                            <p className="mt-1 text-xs text-gray-500">
                              Sectores disponibles en {currentUser.villaNombre}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {error && (
                        <div className="mt-3 rounded-md bg-red-50 p-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                    onClick={handleVerify}
                    disabled={verifyMutation.isLoading}
                  >
                    {verifyMutation.isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </div>
                    ) : (
                      user?.verificado ? 'Desverificar' : 'Verificar'
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}