import React, { useEffect } from 'react';
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
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ForbiddenPage() {
  return (
    <div className="flex h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-lg font-black text-rose-600">
          !
        </div>
        <h2 className="text-2xl font-black text-slate-800">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-600">
          This section requires a higher role or permission. Use the backend permissions from the authenticated user session to continue.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, hydrateAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      hydrateAuth();
    }
  }, [hydrateAuth, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ children, requiredPermissions = [] }) {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredPermission = requiredPermissions.every((permission) => hasPermission(permission));

  if (!hasRequiredPermission) {
    return <ForbiddenPage />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
          <Route path="orders" element={<RoleRoute requiredPermissions={['sales.read']}><OrdersPage /></RoleRoute>} />
          <Route path="sales" element={<RoleRoute requiredPermissions={['sales.read']}><SalesOrdersPage /></RoleRoute>} />
          <Route path="finance" element={<RoleRoute requiredPermissions={['finance.read']}><FinancePage /></RoleRoute>} />
          <Route path="inventory" element={<RoleRoute requiredPermissions={['inventory.read']}><InventoryPage /></RoleRoute>} />
          <Route path="warehouse" element={<RoleRoute requiredPermissions={['warehouse.read']}><WarehousePage /></RoleRoute>} />
          <Route path="production" element={<RoleRoute requiredPermissions={['production.read']}><ProductionPage /></RoleRoute>} />
          <Route path="mes" element={<RoleRoute requiredPermissions={['production.read']}><MesExecutionPage /></RoleRoute>} />
          <Route path="machines" element={<RoleRoute requiredPermissions={['machines.read']}><MachinesPage /></RoleRoute>} />
          <Route path="workers" element={<RoleRoute requiredPermissions={['workforce.read']}><WorkersPage /></RoleRoute>} />
          <Route path="quality" element={<RoleRoute requiredPermissions={['quality.read']}><QualityPage /></RoleRoute>} />
          <Route path="dispatch" element={<RoleRoute requiredPermissions={['sales.execute']}><DispatchPage /></RoleRoute>} />
          <Route path="buyer-portal" element={<RoleRoute requiredPermissions={['sales.read']}><BuyerPortalPage /></RoleRoute>} />
          <Route path="traceability" element={<RoleRoute requiredPermissions={['quality.read']}><TraceabilityPage /></RoleRoute>} />
          <Route path="audit-log" element={<RoleRoute requiredPermissions={['audit_logs.read']}><AuditLogPage /></RoleRoute>} />
          <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="settings" element={<RoleRoute requiredPermissions={['users.manage']}><SettingsPage /></RoleRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
