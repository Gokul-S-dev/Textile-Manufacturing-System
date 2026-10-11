import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, USER_ROLES } from '../store/useAuthStore';
import {
  Search,
  Server,
  UserCheck,
  ChevronDown,
  Menu,
  Sparkles,
  GitBranch,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Cpu,
  Cog,
  Users,
  CheckCircle2,
  Truck,
  Globe,
  Coins,
  History,
  Settings,
} from 'lucide-react';

const MODULE_TITLES = {
  '/dashboard': { name: 'Executive Dashboard', icon: LayoutDashboard },
  '/orders': { name: 'Buyer Orders', icon: ShoppingCart },
  '/inventory': { name: 'Raw Material & Yarn Inventory', icon: Boxes },
  '/production': { name: 'Production Floor Tracking', icon: Cpu },
  '/machines': { name: '20-Machine Fleet Telemetry', icon: Cog },
  '/workers': { name: 'Workers Attendance & Wages', icon: Users },
  '/quality': { name: 'Quality Inspection & Defects', icon: CheckCircle2 },
  '/dispatch': { name: 'Finished Goods & Dispatch', icon: Truck },
  '/buyer-portal': { name: 'Customer Buyer Portal', icon: Globe },
  '/finance': { name: 'Cost & Profit Analytics', icon: Coins },
  '/traceability': { name: 'End-to-End Traceability Matrix', icon: GitBranch },
  '/audit-log': { name: 'System Audit Trail', icon: History },
  '/settings': { name: 'API & Swagger Settings', icon: Settings },
};

export default function Navbar({ onToggleSidebar }) {
  const { user, activeRole, switchRole, isServerOnline, serverLatency, currentApiUrl } = useAuthStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isBuyer =
    user?.roles?.some((r) => (typeof r === 'string' ? r : r?.name) === 'BUYER') ||
    activeRole === 'BUYER' ||
    user?.email === 'buyer@textile.local';

  const currentRoleConfig = USER_ROLES[activeRole] || USER_ROLES.ADMIN;
  const currentModule = MODULE_TITLES[location.pathname] || null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-8 py-3 bg-[#ecf7f9]/90 backdrop-blur-md">
      {/* Left: Mobile hamburger & Mill branding & Active Module Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <Link to={isBuyer ? '/buyer-portal' : '/dashboard'} className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-800">
              Everest Textile Mills
            </span>
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[10px] font-bold text-[#00acc1] hidden sm:inline">
              ERP Platform
            </span>
          </Link>

          {/* Active Module Name Breadcrumb Indicator */}
          {currentModule && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-300/80">
              <currentModule.icon className="h-4 w-4 text-[#00bcd4]" />
              <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-full shadow-2xs border border-slate-100">
                {currentModule.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search Pill with Circular Cyan Button (matching reference) + Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Search Bar matching reference image */}
        <div className="relative hidden sm:flex items-center">
          <input
            type="text"
            placeholder="Search..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            className="h-10 w-48 lg:w-64 rounded-full border border-slate-200/80 bg-white pl-4 pr-11 text-xs text-slate-700 shadow-xs focus:border-[#00bcd4] focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/20"
          />
          <button
            type="button"
            className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#00bcd4] text-white shadow-sm hover:bg-[#00acc1] transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Backend Status Pill */}
        <Link
          to="/settings"
          className={`hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors shadow-xs ${
            isServerOnline
              ? 'border-emerald-200 bg-white text-emerald-700'
              : 'border-amber-200 bg-white text-amber-700'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
          <span>{isServerOnline ? `Online (${serverLatency || 20}ms)` : 'Demo Mode'}</span>
        </Link>

        {/* Testing Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#00bcd4] transition-all"
          >
            <span className="h-2 w-2 rounded-full bg-[#00bcd4]" />
            <span className="hidden sm:inline font-bold text-slate-800">{currentRoleConfig.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white p-2 shadow-xl border border-slate-100 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reviewer Role Switcher</p>
              </div>
              <div className="mt-1 space-y-0.5">
                {Object.values(USER_ROLES).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchRole(r.id);
                      setShowRoleMenu(false);
                      if (r.id === 'BUYER') {
                        navigate('/buyer-portal');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-left text-xs transition-colors ${
                      activeRole === r.id
                        ? 'bg-cyan-50 text-[#00acc1] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{r.badge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

