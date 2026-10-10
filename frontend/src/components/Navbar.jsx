import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import {
  Factory,
  Server,
  UserCheck,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  GitBranch,
  ShieldAlert,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, activeRole, switchRole, logout, isServerOnline, serverLatency, checkBackendStatus, currentApiUrl } =
    useAuthStore();
  const { getLowStockItems } = useInventoryStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockCount = getLowStockItems().length;

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 20000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  const handleRoleSelect = (roleKey) => {
    switchRole(roleKey);
    setShowRoleMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <span className="sr-only">Toggle Sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">Everest Textile Mills</span>
              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700">ERP 2.0</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Digital Backbone • Spinning • Weaving • Dyeing</p>
          </div>
        </Link>
      </div>

      {/* Middle: Server Connectivity Indicator */}
      <div className="hidden md:flex items-center gap-2">
        <Link
          to="/settings"
          title="Configure API connection and check Swagger docs"
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            isServerOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <Server className="h-3.5 w-3.5" />
          <span>
            {isServerOnline
              ? `Backend Online (${serverLatency ? `${serverLatency}ms` : 'Ready'})`
              : 'Demo Mode (Offline Fallback)'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentApiUrl.includes('172.17') ? '172.17.40.17' : 'localhost'}
          </span>
        </Link>

        {/* Quick Traceability Button */}
        <Link
          to="/traceability"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          title="Inspect Roll R-102 & Order ORD-25 End-to-End Traceability"
        >
          <GitBranch className="h-3.5 w-3.5 text-blue-600" />
          <span>Traceability Explorer</span>
        </Link>
      </div>

      {/* Right: Notifications, Role Switcher, User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Low Stock Warning Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {lowStockCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 z-50">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Inventory & System Alerts</span>
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                  {lowStockCount} Critical
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-rose-50 border border-rose-100">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900">3 Items Low in Stock</p>
                    <p className="text-slate-600 text-[11px]">Raw Silk, Mercerized Cotton, & Spandex below threshold.</p>
                    <Link to="/inventory" className="text-rose-600 hover:underline font-medium text-[11px] mt-1 block">
                      Go to Inventory →
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900">Machine W-07 Breakdown</p>
                    <p className="text-slate-600 text-[11px]">Weft tension error on Roll R-102. Operator O-15.</p>
                    <Link to="/machines" className="text-amber-600 hover:underline font-medium text-[11px] mt-1 block">
                      Inspect Machine Floor →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Pill */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-900">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-blue-600 uppercase font-semibold leading-none">{activeRole || 'USER'}</div>
              <div className="font-bold leading-tight">{user?.name || 'Authenticated User'}</div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
