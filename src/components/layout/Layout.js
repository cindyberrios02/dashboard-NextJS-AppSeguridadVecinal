// src/components/layout/Layout.js
import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute'; // ✅ RUTA CORRECTA
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  Cog6ToothIcon,
  BellIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Usuarios', href: '/dashboard/users', icon: UsersIcon },
    // Opciones visibles solo para SUPER_ADMIN
    ...(isSuperAdmin
      ? [
          { name: 'Alertas', href: '/dashboard/alertas', icon: BellIcon },
          { name: 'Analytics', href: '/dashboard/alertas/analytics', icon: ChartBarIcon },
        ]
      : []),
    { name: 'Geografía', href: '/dashboard/geografia', icon: MapIcon },
    { name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determina el item activo usando la coincidencia más específica (prefijo más largo)
  const getBestMatchHref = (items, pathname) => {
    if (!pathname) return null;
    // Normalizar: quitar barra final excepto en la raíz
    const normalize = (p) => (p && p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
    const pn = normalize(pathname);

    let best = null;
    let bestLen = -1;

    items.forEach((it) => {
      const href = normalize(it.href);
      if (!href) return;
      const exact = pn === href;
      const isParent = pn.startsWith(href + '/');
      if (exact || isParent) {
        if (href.length > bestLen) {
          best = href;
          bestLen = href.length;
        }
      }
    });

    return best;
  };

  const activeHref = getBestMatchHref(navigation, router.pathname);

  const isActive = (href) => {
    // comparar con href normalizado
    const normalize = (p) => (p && p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
    return normalize(href) === activeHref;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">Seguridad</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                    isActive(item.href)
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <item.icon
                                    className={`h-6 w-6 shrink-0 ${
                                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Seguridad</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive(item.href) ? 'text-blue-600' : 'text-gray-400'
                            }`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <div className="border-t border-gray-200 pt-4">
                    {user && (
                      <div className="mb-4 px-2">
                        <p className="text-xs font-medium text-gray-500">Sesión iniciada</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.nombre} {user.apellido}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon
                        className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600"
                        aria-hidden="true"
                      />
                      Cerrar Sesión
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
          {user && (
            <span className="text-xs text-gray-500">{user.nombre}</span>
          )}
        </div>

        {/* Main content */}
        <main className="lg:pl-64">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}