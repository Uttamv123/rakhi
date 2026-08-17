import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

interface Props { children: React.ReactNode; }

export default function AdminProtectedRoute({ children }: Props) {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminUser.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-mono">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-400 text-sm">Your account does not have admin privileges.</p>
          <a href="/admin/login" className="text-red-400 underline text-sm">Back to Admin Login</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
