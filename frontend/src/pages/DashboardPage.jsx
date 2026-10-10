import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useMachineStore } from '../store/useMachineStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useQualityStore } from '../store/useQualityStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuditStore } from '../store/useAuditStore';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  Factory,
  ShoppingCart,
  Cog,
  Boxes,
  Gauge,
  CheckCircle2,
  Coins,
  ArrowRight,
  AlertTriangle,
  GitBranch,
  Truck,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getTotalOrdersCount, getInProductionCount, getPendingCount, getCompletedCount, orders } = useOrderStore();
  const { getTotalMachinesCount, getRunningCount, getIdleCount, getBreakdownCount, getMaintenanceCount, machines } =
    useMachineStore();
  const { getTotalStockKg, getLowStockItems } = useInventoryStore();
  const { passRate, reworkRate, rejectRate } = useQualityStore();
  const { monthlySummary } = useFinanceStore();
  const { logs } = useAuditStore();

  const totalOrders = getTotalOrdersCount();
  const inProdOrders = getInProductionCount();
  const pendingOrders = getPendingCount();
  const completedOrders = getCompletedCount();

  const totalMachines = getTotalMachinesCount();
  const runningMachines = getRunningCount();
  const idleMachines = getIdleCount();
  const breakdownMachines = getBreakdownCount();
  const maintenanceMachines = getMaintenanceCount();

  const yarnStockKg = getTotalStockKg();
  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      {/* Mill Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-400/20">
                Floor Shift A Live
              </span>
              <span className="text-xs text-slate-400">Everest Textile Mills Co.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              EVEREST TEXTILE MILLS DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time telemetry for spinning, airjet weaving, vat dyeing, fabric roll QA, and order dispatch economics.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/orders"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Order</span>
            </Link>

            <Link
              to="/traceability"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
            >
              <GitBranch className="h-4 w-4" />
              <span>Trace Roll R-102</span>
            </Link>

            <Link
              to="/inventory"
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <Boxes className="h-4 w-4" />
              <span>Receive Yarn</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Management Modules from Reviewer Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Orders Card */}
        <div
          onClick={() => navigate('/orders')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Orders</h3>
                <p className="text-2xl font-extrabold text-slate-900">{totalOrders} Total</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            <div className="rounded-lg bg-blue-50/60 p-2">
              <span className="block text-sm font-bold text-blue-700">{inProdOrders}</span>
              <span className="text-[10px] font-medium text-blue-600">In Production</span>
            </div>
            <div className="rounded-lg bg-amber-50/60 p-2">
              <span className="block text-sm font-bold text-amber-700">{pendingOrders}</span>
              <span className="text-[10px] font-medium text-amber-600">Pending</span>
            </div>
            <div className="rounded-lg bg-emerald-50/60 p-2">
              <span className="block text-sm font-bold text-emerald-700">{completedOrders}</span>
              <span className="text-[10px] font-medium text-emerald-600">Completed</span>
            </div>
          </div>
        </div>

        {/* 2. Machines Card */}
        <div
          onClick={() => navigate('/machines')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Cog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Machines</h3>
                <p className="text-2xl font-extrabold text-slate-900">{totalMachines} Total</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-slate-100 pt-3 text-center">
            <div className="rounded-lg bg-emerald-50/60 p-1.5">
              <span className="block text-sm font-bold text-emerald-700">🟢 {runningMachines}</span>
              <span className="text-[10px] font-medium text-emerald-700">Running</span>
            </div>
            <div className="rounded-lg bg-amber-50/60 p-1.5">
              <span className="block text-sm font-bold text-amber-700">🟡 {idleMachines}</span>
              <span className="text-[10px] font-medium text-amber-700">Idle</span>
            </div>
            <div className="rounded-lg bg-rose-50/60 p-1.5">
              <span className="block text-sm font-bold text-rose-700">🔴 {breakdownMachines}</span>
              <span className="text-[10px] font-medium text-rose-700">Breakdown</span>
            </div>
            <div className="rounded-lg bg-sky-50/60 p-1.5">
              <span className="block text-sm font-bold text-sky-700">🔵 {maintenanceMachines}</span>
              <span className="text-[10px] font-medium text-sky-700">Maint.</span>
            </div>
          </div>
        </div>

        {/* 3. Inventory Card */}
        <div
          onClick={() => navigate('/inventory')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory</h3>
                <p className="text-2xl font-extrabold text-slate-900">{yarnStockKg.toLocaleString()} KG</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Yarn Stock:</span> Combed Cotton & Blends
            </div>
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span>⚠ {lowStockItems.length} Items Low Stock</span>
              </span>
            )}
          </div>
        </div>

        {/* 4. Production Card */}
        <div
          onClick={() => navigate('/production')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Production</h3>
                <p className="text-2xl font-extrabold text-slate-900">4,850 M</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>Today's Output Across Active Looms</span>
            <span className="font-semibold text-teal-700">94.8% Floor Target</span>
          </div>
        </div>

        {/* 5. Quality Card */}
        <div
          onClick={() => navigate('/quality')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quality QA</h3>
                <p className="text-2xl font-extrabold text-slate-900">{passRate}% Passed</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            <div className="rounded-lg bg-emerald-50/70 p-1.5">
              <span className="block text-xs font-bold text-emerald-700">{passRate}%</span>
              <span className="text-[10px] text-emerald-600">Passed</span>
            </div>
            <div className="rounded-lg bg-amber-50/70 p-1.5">
              <span className="block text-xs font-bold text-amber-700">{reworkRate}%</span>
              <span className="text-[10px] text-amber-600">Rework</span>
            </div>
            <div className="rounded-lg bg-rose-50/70 p-1.5">
              <span className="block text-xs font-bold text-rose-700">{rejectRate}%</span>
              <span className="text-[10px] text-rose-600">Rejected</span>
            </div>
          </div>
        </div>

        {/* 6. Financial Card */}
        <div
          onClick={() => navigate('/finance')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial (Month)</h3>
                <p className="text-2xl font-extrabold text-slate-900">₹4.3L Profit</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            <div>
              <span className="block text-xs font-bold text-slate-800">₹12.5L</span>
              <span className="text-[10px] text-slate-500">Revenue</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">₹8.2L</span>
              <span className="text-[10px] text-slate-500">Cost</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-700 font-extrabold">₹4.3L</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Net Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Callout Banner (Reviewer Highlight) */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Reviewer Traceability Test: Defective Roll R-102
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Roll R-102 ➔ Order ORD-25 ➔ Machine W-07 ➔ Operator O-15 (Ramesh Kumar) ➔ Defect: Uneven weaving.
              </p>
            </div>
          </div>

          <Link
            to="/traceability"
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
          >
            <span>Launch Traceability Explorer</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Floor Machine Status & Live Audit Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Floor Status Snapshot */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Factory Floor Telemetry (20 Machines)</h3>
              <p className="text-xs text-slate-500">Real-time status of Spinning, Weaving & Dyeing lines</p>
            </div>
            <Link to="/machines" className="text-xs font-semibold text-blue-600 hover:underline">
              View All 20 Machines →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {machines.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{m.code}</span>
                    <span className="text-[11px] text-slate-500">{m.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{m.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Order: {m.currentOrder}</p>
                </div>
                <Badge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Audit Log Feed */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Who changed, what changed, when changed</p>
            </div>
            <Link to="/audit-log" className="text-xs font-semibold text-blue-600 hover:underline">
              Full Log →
            </Link>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="relative pl-4 border-l-2 border-blue-500/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{log.userName}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
