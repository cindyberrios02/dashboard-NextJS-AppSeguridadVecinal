// src/components/layout/Layout.js
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


import ProtectedRoute from '../ProtectedRoute';

export default function Layout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Sidebar />
        <main className="ml-64 pt-16">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}