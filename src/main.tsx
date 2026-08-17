import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { CurrencyProvider } from './context/CurrencyContext.tsx';
import AdminLogin from './admin/AdminLogin.tsx';
import AdminLayout from './admin/AdminLayout.tsx';
import AdminDashboard from './admin/pages/AdminDashboard.tsx';
import AdminOrders from './admin/pages/AdminOrders.tsx';
import AdminOrderDetail from './admin/pages/AdminOrderDetail.tsx';
import AdminProducts from './admin/pages/AdminProducts.tsx';
import AdminCustomers from './admin/pages/AdminCustomers.tsx';
import AdminAnalytics from './admin/pages/AdminAnalytics.tsx';
import AdminSettings from './admin/pages/AdminSettings.tsx';
import { AdminAuthProvider } from './admin/AdminAuthContext.tsx';
import AdminProtectedRoute from './admin/AdminProtectedRoute.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* ── Customer site ── */}
          <Route
            path="/*"
            element={
              <CurrencyProvider>
                <App />
              </CurrencyProvider>
            }
          />

          {/* ── Admin login (public) ── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Admin protected pages ── */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
