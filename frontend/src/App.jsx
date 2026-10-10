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
import MesExecutionPage from './pages/MesExecutionPage';
import WarehousePage from './pages/WarehousePage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import FinancePage from './pages/FinancePage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const { activeRole } = useAuthStore();
  if (!allowedRoles.includes(activeRole) && activeRole !== 'ADMIN') {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col">
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
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
          <Route path="orders" element={<RoleRoute allowedRoles={['PRODUCTION_MANAGER']}><OrdersPage /></RoleRoute>} />
          <Route path="sales" element={<RoleRoute allowedRoles={['STORE_MANAGER', 'ADMIN']}><SalesOrdersPage /></RoleRoute>} />
          <Route path="finance" element={<RoleRoute allowedRoles={['ADMIN']}><FinancePage /></RoleRoute>} />
          <Route path="inventory" element={<RoleRoute allowedRoles={['INVENTORY_MANAGER', 'STORE_MANAGER']}><InventoryPage /></RoleRoute>} />
          <Route path="warehouse" element={<RoleRoute allowedRoles={['STORE_MANAGER', 'ADMIN']}><WarehousePage /></RoleRoute>} />
          <Route path="production" element={<RoleRoute allowedRoles={['PRODUCTION_MANAGER']}><ProductionPage /></RoleRoute>} />
          <Route path="mes" element={<RoleRoute allowedRoles={['PRODUCTION_MANAGER', 'SUPER_ADMIN']}><MesExecutionPage /></RoleRoute>} />
          <Route path="machines" element={<RoleRoute allowedRoles={['PRODUCTION_MANAGER']}><MachinesPage /></RoleRoute>} />
          <Route path="workers" element={<RoleRoute allowedRoles={['PRODUCTION_MANAGER']}><WorkersPage /></RoleRoute>} />
          <Route path="quality" element={<RoleRoute allowedRoles={['QUALITY_INSPECTOR', 'PRODUCTION_MANAGER']}><QualityPage /></RoleRoute>} />
          <Route path="dispatch" element={<RoleRoute allowedRoles={['STORE_MANAGER', 'PRODUCTION_MANAGER']}><DispatchPage /></RoleRoute>} />
          <Route path="buyer-portal" element={<RoleRoute allowedRoles={['BUYER']}><BuyerPortalPage /></RoleRoute>} />
          <Route path="finance" element={<RoleRoute allowedRoles={['ACCOUNTANT', 'PRODUCTION_MANAGER']}><FinancePage /></RoleRoute>} />
          <Route path="traceability" element={<TraceabilityPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
