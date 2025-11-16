// src/components/layout/Header.js
import { BellIcon, Bars3Icon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onMenuClick }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Opciones de navegación para el buscador global
  const searchOptions = [
    { name: 'Dashboard Principal', route: '/dashboard', keywords: ['dashboard', 'inicio', 'principal'] },
    { name: 'Gestión de Usuarios', route: '/dashboard/users', keywords: ['usuarios', 'users', 'gestión'] },
    { name: 'Crear Usuario', route: '/dashboard/users/new', keywords: ['crear usuario', 'nuevo usuario', 'agregar'] },
    { name: 'Sistema de Alertas', route: '/dashboard/alertas', keywords: ['alertas', 'emergencias', 'seguridad'] },
    { name: 'Reportes', route: '/dashboard/reports', keywords: ['reportes', 'reports', 'estadísticas'] },
    { name: 'Configuración', route: '/dashboard/settings', keywords: ['configuración', 'settings', 'ajustes'] }
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const filteredOptions = searchOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOptionClick = (route) => {
    router.push(route);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionClick(filteredOptions[0].route);
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      {/* Mobile menu button */}
      <button
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
        onClick={onMenuClick}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        {/* Search bar */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0 relative">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <input
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                placeholder="Buscar en el panel..."
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                onFocus={() => searchTerm && setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    <div className="py-1">
                      {filteredOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option.route)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                        >
                          <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-gray-400" />
                          {option.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Overlay to close search results */}
            {showSearchResults && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <BellIcon className="h-6 w-6" />
          </button>

          {/* User menu */}
          <div className="ml-3 relative">
            <div>
              <button
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                {user && (
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                    {user.nombre} {user.apellido}
                  </span>
                )}
              </button>
            </div>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Overlay para cerrar el menú */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menú desplegable */}
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  {/* Información del usuario */}
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs font-semibold text-blue-600 mt-1">
                        {user.role}
                      </p>
                      {user.sector && (
                        <p className="text-xs text-gray-500">
                          Sector: {user.sector}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Opciones del menú */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/dashboard/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Tu Perfil
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center border-t border-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-red-500" />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}