// src/components/layout/Layout.js
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


import ProtectedRoute from '../auth/ProtectedRoute'; 

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}