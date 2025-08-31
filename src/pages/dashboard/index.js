// src/pages/dashboard/index.js
import Layout from "../../components/layout/Layout"; 
import StatsCard from "../../components/dashboard/StatsCard";
import { ShieldCheckIcon, BellAlertIcon, UsersIcon, MapPinIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    sales: 0,
    orders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si la variable de entorno existe
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('API URL:', apiUrl); // Para debug
      
      if (!apiUrl) {
        throw new Error('La variable NEXT_PUBLIC_API_URL no está configurada');
      }
      
      // Llamada al endpoint correcto: /api/admin/dashboard/stats
      const response = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status); // Para debug
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data); // Para debug
      
      setStats({
        users: data.users || 0,
        sales: data.sales || 0,
        orders: data.orders || 0,
        revenue: data.revenue || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      
      // Datos de ejemplo para desarrollo mientras resuelves problemas de conexión
      setStats({
        users: 1250,
        sales: 45230,
        orders: 189,
        revenue: 95680
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total Usuarios',
      value: stats.users.toLocaleString(),
      change: '+4.75%',
      changeType: 'positive',
      icon: UsersIcon
    },
    {
      title: 'Ventas del Mes',
      value: `$${stats.sales.toLocaleString()}`,
      change: '+54.02%',
      changeType: 'positive',
      icon: CurrencyDollarIcon
    },
    {
      title: 'Órdenes',
      value: stats.orders.toLocaleString(),
      change: '-1.39%',
      changeType: 'negative',
      icon: ShoppingCartIcon
    },
    {
      title: 'Ingresos',
      value: `$${stats.revenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Resumen general de tu aplicación de seguridad vecinal
          </p>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Aviso:</strong> No se pudo conectar con la API ({error}). 
                Mostrando datos de ejemplo.
              </p>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={fetchDashboardData}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Reintentar conexión
                </button>
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/admin/test`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  Probar API directamente
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Alertas por Mes
              </h3>
              <div className="mt-6 flex justify-center items-center h-64 bg-gray-50 rounded">
                <p className="text-gray-500">Gráfico de alertas aquí</p>
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Usuarios Verificados vs No Verificados
              </h3>
              <div className="mt-6 flex justify-center items-center h-64 bg-gray-50 rounded">
                <p className="text-gray-500">Gráfico de verificación aquí</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Actividad Reciente
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Últimos registros y alertas en el sistema
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {[
              { action: "Nuevo usuario registrado", user: "Juan Pérez", time: "2 min" },
              { action: "Alerta de seguridad", user: "María García", time: "15 min" },
              { action: "Usuario verificado", user: "Carlos López", time: "1 hora" },
              { action: "Nueva alerta reportada", user: "Ana Torres", time: "2 horas" }
            ].map((item, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.action}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.user} • Hace {item.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Ver detalles
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}