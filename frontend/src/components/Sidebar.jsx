import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
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
  GitBranch,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, hasPermission, logout, isSidebarExpanded, toggleSidebarExpanded } = useAuthStore();
  const [tooltip, setTooltip] = useState({ visible: false, name: '', top: 0 });

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Buyer Orders', to: '/orders', icon: ShoppingCart, permission: 'sales.read' },
    { name: 'Yarn Inventory', to: '/inventory', icon: Boxes, permission: 'inventory.read' },
    { name: 'Production Floor', to: '/production', icon: Cpu, permission: 'production.read' },
    { name: 'Machine Fleet', to: '/machines', icon: Cog, permission: 'machines.read' },
    { name: 'Workers & Wages', to: '/workers', icon: Users, permission: 'workforce.read' },
    { name: 'Quality & Defects', to: '/quality', icon: CheckCircle2, permission: 'quality.read' },
    { name: 'Dispatch & Invoices', to: '/dispatch', icon: Truck, permission: 'sales.execute' },
    { name: 'Buyer Portal', to: '/buyer-portal', icon: Globe, permission: 'sales.read' },
    { name: 'Cost & Profit', to: '/finance', icon: Coins, permission: 'finance.read' },
    { name: 'Traceability Matrix', to: '/traceability', icon: GitBranch, permission: 'quality.read' },
    { name: 'Audit Trail', to: '/audit-log', icon: History, permission: 'audit_logs.read' },
    { name: 'System Settings', to: '/settings', icon: Settings, permission: 'users.manage' },
  ];

  const visibleNav = navItems.filter((item) => !item.permission || hasPermission(item.permission));

  const handleMouseEnter = (name, e) => {
    if (isSidebarExpanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      name,
      top: rect.top + rect.height / 2,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, name: '', top: 0 });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Cyan Ribbon Sidebar - Fixed viewport height, smooth width transition */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col items-center justify-between bg-gradient-to-b from-[#00bcd4] via-[#00acc1] to-[#0097a7] shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarExpanded ? 'w-72 px-3.5' : 'w-20 px-2'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Top: Avatar & Brand (Centered when collapsed, full profile when expanded) */}
        <div className="flex w-full flex-col items-center pt-5 pb-3 shrink-0">
          {!isSidebarExpanded ? (
            /* Collapsed: Perfectly centered single avatar bubble - 100% clean, no collision */
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 p-1 shadow-inner ring-2 ring-white/50 transition-transform hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-amber-400 text-amber-950 font-extrabold shadow-sm text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
          ) : (
            /* Expanded: User Profile Row with Close Button */
            <div className="flex w-full items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 p-1 shadow-inner ring-2 ring-white/50">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-amber-400 text-amber-950 font-extrabold shadow-sm text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>

                <div className="min-w-0 flex-1 overflow-hidden text-left">
                  <p className="text-xs font-black text-white leading-tight truncate" title={user?.name}>
                    {user?.name || 'Admin User'}
                  </p>
                  <span className="inline-block mt-0.5 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide uppercase">
                    {user?.roles?.[0]?.name || user?.roles?.[0] || 'User'}
                  </span>
                </div>
              </div>

              {/* Collapse Chevron Button when expanded */}
              <button
                onClick={toggleSidebarExpanded}
                title="Collapse Menu"
                className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/35 transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Close button on mobile */}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-white/80 hover:bg-white/20 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Center: Vertically Stacked Navigation (anchored from top, smooth internal scroll) */}
        <nav className="flex-1 w-full flex flex-col gap-1.5 py-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {visibleNav.map((item) => (
            <div key={item.to} className="relative w-full shrink-0">
              <NavLink
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                onMouseEnter={(e) => handleMouseEnter(item.name, e)}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl transition-all duration-150 ${
                    isSidebarExpanded
                      ? `w-full px-3 py-2.5 gap-3 ${
                          isActive
                            ? 'bg-white text-[#00acc1] font-bold shadow-md shadow-cyan-950/20'
                            : 'text-white/85 hover:bg-white/20 hover:text-white font-medium'
                        }`
                      : `h-11 w-11 mx-auto justify-center ${
                          isActive
                            ? 'bg-white text-[#00acc1] shadow-md shadow-cyan-950/20'
                            : 'text-white/80 hover:bg-white/20 hover:text-white'
                        }`
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarExpanded && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-xs font-semibold truncate tracking-tight">{item.name}</span>
                    {item.permission && (
                      <span className="shrink-0 text-[8px] font-black uppercase tracking-wider bg-white/25 text-white px-1.5 py-0.5 rounded-full ml-1">
                        Role
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Bottom: Expand Toggle (when collapsed) & Sign Out */}
        <div className="flex w-full flex-col items-center gap-1.5 py-3 shrink-0 border-t border-white/10">
          {/* Expand Toggle Button when collapsed */}
          {!isSidebarExpanded && (
            <button
              onClick={toggleSidebarExpanded}
              title="Expand Menu (Show Names)"
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/30 transition-colors shadow-2xs"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            title="Sign out"
            className={`flex items-center rounded-2xl text-white/85 hover:bg-white/20 hover:text-white transition-colors ${
              isSidebarExpanded
                ? 'w-full px-3.5 py-2.5 gap-3 justify-start font-medium text-xs'
                : 'h-11 w-11 justify-center'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Floating Tooltip - FIXED position outside sidebar, IMMUNE to all container overflow clipping */}
      {tooltip.visible && !isSidebarExpanded && (
        <div
          style={{ top: `${tooltip.top}px` }}
          className="fixed left-[86px] -translate-y-1/2 z-50 pointer-events-none flex items-center transition-all duration-150 animate-in fade-in"
        >
          {/* Arrow pointing to icon */}
          <div className="w-2.5 h-2.5 rotate-45 bg-slate-900 -mr-1.5 shadow-md border-l border-t border-slate-700" />
          <div className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xl whitespace-nowrap border border-slate-700/80">
            {tooltip.name}
          </div>
        </div>
      )}
    </>
  );
}

