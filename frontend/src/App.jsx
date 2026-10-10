import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import AppLayout from './layouts/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import ProductionPage from './pages/ProductionPage';
import MachinesPage from './pages/MachinesPage';
import WorkersPage from './pages/WorkersPage';
import QualityPage from './pages/QualityPage';
import DispatchPage from './pages/DispatchPage';
import BuyerPortalPage from './pages/BuyerPortalPage';
import FinancePage from './pages/FinancePage';
import TraceabilityPage from './pages/TraceabilityPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected ERP Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="machines" element={<MachinesPage />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="buyer-portal" element={<BuyerPortalPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="traceability" element={<TraceabilityPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
