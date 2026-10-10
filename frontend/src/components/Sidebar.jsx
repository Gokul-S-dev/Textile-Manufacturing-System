import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useMachineStore } from '../store/useMachineStore';
import { useOrderStore } from '../store/useOrderStore';
import {
  LayoutDashboard,
  GitBranch,
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
  ShieldCheck,
  BarChart2
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { activeRole, user } = useAuthStore();
  const { getLowStockItems } = useInventoryStore();
  const { getBreakdownCount } = useMachineStore();
  const { getInProductionCount, orders } = useOrderStore();

  const lowStockCount = getLowStockItems().length;
  const breakdownCount = getBreakdownCount();
  const inProdCount = getInProductionCount();

  const navSections = [
    {
      title: 'CORE ERP',
      roles: ['ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'STORE_MANAGER', 'QUALITY_INSPECTOR', 'ACCOUNTANT'],
      items: [
        {
          name: 'Management Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-blue-100 text-blue-700',
        },
        {
          name: 'Traceability Explorer',
          to: '/traceability',
          icon: GitBranch,
          badge: 'Roll R-102',
          badgeColor: 'bg-emerald-100 text-emerald-700',
        },
      ],
    },
    {
      title: 'MANUFACTURING OPERATIONS',
      roles: ['ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'STORE_MANAGER'],
      items: [
        {
          name: 'Buyer Orders',
          to: '/orders',
          icon: ShoppingCart,
          badge: `${orders.length}`,
          badgeColor: 'bg-slate-100 text-slate-700',
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          name: 'Raw Materials & Yarn',
          to: '/inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
          badgeColor: 'bg-rose-100 text-rose-700',
          allowedRoles: ['ADMIN', 'INVENTORY_MANAGER', 'STORE_MANAGER']
        },
        {
          name: 'Production Stages',
          to: '/production',
          icon: Cpu,
          badge: `${inProdCount} Active`,
          badgeColor: 'bg-blue-100 text-blue-700',
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          name: 'MES Execution',
          to: '/mes',
          icon: Cog,
          badge: 'Live',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          name: 'Machine Floor',
          to: '/machines',
          icon: Cog,
          badge: breakdownCount > 0 ? `${breakdownCount} Alarm` : '20 Units',
          badgeColor: breakdownCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700',
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          name: 'Workers & Wages',
          to: '/workers',
          icon: Users,
          allowedRoles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
      ],
    },
    {
      title: 'QUALITY & DISPATCH',
      roles: ['ADMIN', 'QUALITY_INSPECTOR', 'STORE_MANAGER', 'PRODUCTION_MANAGER'],
      items: [
        {
          name: 'Quality Inspection',
          to: '/quality',
          icon: CheckCircle2,
          badge: '92% Pass',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          allowedRoles: ['ADMIN', 'QUALITY_INSPECTOR', 'PRODUCTION_MANAGER']
        },
        {
          name: 'Finished Goods & Dispatch',
          to: '/dispatch',
          icon: Truck,
          allowedRoles: ['ADMIN', 'STORE_MANAGER', 'PRODUCTION_MANAGER']
        },
      ],
    },
    {
      title: 'COMMERCE & BUYER',
      roles: ['ADMIN', 'BUYER', 'ACCOUNTANT', 'PRODUCTION_MANAGER'],
      items: [
        {
          name: 'Buyer Tracking Portal',
          to: '/buyer-portal',
          icon: Globe,
          badge: 'ORD-1024',
          badgeColor: 'bg-purple-100 text-purple-700',
          allowedRoles: ['ADMIN', 'BUYER']
        },
        {
          name: 'Cost & Profit Analytics',
          to: '/finance',
          icon: Coins,
          badge: '₹4.3L',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          allowedRoles: ['ADMIN', 'ACCOUNTANT', 'PRODUCTION_MANAGER']
        },
      ],
    },
    {
      title: 'AUDIT & CONFIG',
      roles: ['ADMIN', 'ACCOUNTANT'],
      items: [
        {
          name: 'Audit Trail Log',
          to: '/audit-log',
          icon: History,
          allowedRoles: ['ADMIN']
        },
        {
          name: 'API & Server Config',
          to: '/settings',
          icon: Settings,
          allowedRoles: ['ADMIN']
        },
      ],
    },
  ];

  // Filter sections according to active role
  const visibleSections = navSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => 
        !item.allowedRoles || item.allowedRoles.includes(activeRole)
      ),
    }))
    .filter((sec) => sec.items.length > 0 && sec.roles.includes(activeRole));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User profile card */}
        <div className="flex items-center gap-3 border-b border-slate-800 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-white">{user?.name || 'Administrator'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] text-slate-400 truncate">{user?.title || 'System Owner'}</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {visibleSections.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <span>Everest Mills Floor</span>
              <span className="text-emerald-400">● 14 Active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Shift A • 20 Looms Online
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
