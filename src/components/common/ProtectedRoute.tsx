import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  // Jika token TIDAK ADA di localStorage, tendang balik ke halaman /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ADA, izinkan pengguna membuka halaman (Dashboard)
  return <Outlet />;
};