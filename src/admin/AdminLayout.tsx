import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart2,
  Settings, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/admin/products',  icon: Package,         label: 'Products' },
  { to: '/admin/customers', icon: Users,           label: 'Customers' },
  { to: '/admin/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/admin/settings',  icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const { adminUser, signOutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-[0.3em] block">Admin</span>
        <h1 className="text-white font-black italic text-xl" style={{ fontFamily: 'Georgia, serif' }}>SENDSMILES</h1>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-red-700 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span>{label}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Admin profile + sign out */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <div className="px-3 py-2 bg-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Signed in as</p>
          <p className="text-white text-xs font-bold truncate mt-0.5">{adminUser?.email}</p>
          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-red-700 text-white px-2 py-0.5 rounded-full font-mono">
            Admin
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900 hover:text-red-300 transition-all text-sm font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 border-r border-gray-800 z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="text-gray-400 hover:text-white relative cursor-pointer">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm">
            {adminUser?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
