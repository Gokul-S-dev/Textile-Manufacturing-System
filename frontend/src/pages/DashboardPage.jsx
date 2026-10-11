import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useMachineStore } from '../store/useMachineStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useQualityStore } from '../store/useQualityStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { analyticsService } from '../services/analyticsService';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  GitBranch,
  Boxes,
  Cog,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Layers,
  Cpu,
  Clock,
  User,
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  Plus,
  Play,
  Activity,
  ShieldCheck,
  Package,
  Award,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, activeRole } = useAuthStore();

  const {
    orders,
    getTotalOrdersCount,
    getInProductionCount,
    getPendingCount,
    getCompletedCount,
    isLoading: isOrdersLoading,
    error: orderError,
  } = useOrderStore();

  const {
    machines,
    getTotalMachinesCount,
    getRunningCount,
    getIdleCount,
    getBreakdownCount,
    getMaintenanceCount,
    isLoading: isMachinesLoading,
    error: machineError,
  } = useMachineStore();

  const {
    items,
    getTotalStockKg,
    getLowStockItems,
    isLoading: isInventoryLoading,
    error: inventoryError,
  } = useInventoryStore();

  const { inspections, passRate, reworkRate, rejectRate } = useQualityStore();
  const { monthlySummary, orderCosts } = useFinanceStore();

  const [executiveMetrics, setExecutiveMetrics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [activeCalendarMonth, setActiveCalendarMonth] = useState('October 2026');

  // Determine user's active/primary role
  const resolvedRole = useMemo(() => {
    const raw =
      (Array.isArray(user?.roles) && user.roles.length > 0
        ? typeof user.roles[0] === 'string'
          ? user.roles[0]
          : user.roles[0]?.name
        : null) ||
      user?.role ||
      activeRole ||
      'ADMIN';
    return String(raw).toUpperCase();
  }, [user, activeRole]);

  // Department view switcher for Admin / Factory Manager
  const [adminActiveTab, setAdminActiveTab] = useState('EXECUTIVE');

  useEffect(() => {
    useMachineStore.getState().fetchMachines();
    useInventoryStore.getState().fetchItems();
    useOrderStore.getState().fetchOrders();

    analyticsService
      .getExecutiveMetrics()
      .then((data) => {
        setExecutiveMetrics(data);
        setAnalyticsError(null);
      })
      .catch((error) => {
        console.warn('Executive analytics notice:', error.message);
        if (!error.message?.toLowerCase().includes('permissions')) {
          setAnalyticsError(error.message || 'Executive analytics temporarily unavailable.');
        }
      });
  }, []);

  // Real-time calculations
  const totalOrders = getTotalOrdersCount();
  const inProdOrders = getInProductionCount();
  const pendingOrders = getPendingCount();
  const completedOrders = getCompletedCount();

  const runningMachines = machines.filter((m) => m.status === 'RUNNING').length || getRunningCount();
  const idleMachines = machines.filter((m) => m.status === 'IDLE').length || getIdleCount();
  const breakdownMachines = machines.filter((m) => m.status === 'BREAKDOWN').length || getBreakdownCount();
  const maintenanceMachines = machines.filter((m) => m.status === 'MAINTENANCE').length || getMaintenanceCount();
  const totalMachines = machines.length || getTotalMachinesCount();

  const totalStockKg = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || getTotalStockKg();
  const totalAllocatedStockKg = items.reduce((sum, item) => sum + (Number(item.allocated) || 0), 0);
  const totalAvailableStockKg = Math.max(0, totalStockKg - totalAllocatedStockKg);
  const lowStockItemsList = items.filter(
    (item) =>
      (Number(item.quantity) || 0) <= (Number(item.minStock) || 0) ||
      Math.max(0, (Number(item.quantity) || 0) - (Number(item.allocated) || 0)) <= (Number(item.minStock) || 0)
  );
  const lowStockCount = lowStockItemsList.length;

  const isDashboardLoading = isOrdersLoading || isMachinesLoading || isInventoryLoading;
  const dashboardError = orderError || machineError || inventoryError || analyticsError;
  const liveProduction = executiveMetrics?.production;
  const liveQuality = executiveMetrics?.quality;
  const liveFinance = executiveMetrics?.finance;
  const outputMeters = Number(liveProduction?.actualYield || 4850);
  const qualityPassRate = Number(liveQuality?.passRate ?? passRate);

  // Role detection
  const isQualityRole =
    resolvedRole === 'QUALITY_INSPECTOR' ||
    resolvedRole === 'QUALITY_MANAGER' ||
    resolvedRole === 'QUALITY_APPROVER' ||
    user?.email === 'quality@textile.local';

  const isProductionRole =
    resolvedRole === 'PRODUCTION_MANAGER' ||
    resolvedRole === 'PRODUCTION_PLANNER' ||
    resolvedRole === 'PRODUCTION_SUPERVISOR';

  const isStoreRole =
    resolvedRole === 'STORE_MANAGER' ||
    resolvedRole === 'INVENTORY_MANAGER' ||
    resolvedRole === 'STORE_STAFF';

  const isFinanceRole =
    resolvedRole === 'ACCOUNTANT' ||
    resolvedRole === 'FINANCE_OFFICER' ||
    user?.email === 'accountant@textile.local';

  const isAdminRole =
    resolvedRole === 'ADMIN' ||
    resolvedRole === 'SUPER_ADMIN' ||
    resolvedRole === 'FACTORY_MANAGER';

  // Active view: Quality Manager always gets QUALITY, Production Manager gets PRODUCTION, etc.
  const activeView = isQualityRole
    ? 'QUALITY'
    : isProductionRole
    ? 'PRODUCTION'
    : isStoreRole
    ? 'STORE'
    : isFinanceRole
    ? 'FINANCE'
    : adminActiveTab;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Network Notice banner */}
      {dashboardError && !dashboardError.toLowerCase().includes('permissions') && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">
              Notice
            </div>
            <div>
              <p className="font-bold">Live ERP sync Notice</p>
              <p className="mt-1 text-amber-800">{dashboardError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin / Factory Manager perspective switcher tabs */}
      {isAdminRole && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="text-xs font-bold text-slate-700">Mill Executive Perspective:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'EXECUTIVE', label: 'Executive Overview', icon: Sparkles },
              { id: 'QUALITY', label: 'Quality Control', icon: ShieldCheck },
              { id: 'PRODUCTION', label: 'Production Floor', icon: Cpu },
              { id: 'STORE', label: 'Warehouse & Inventory', icon: Boxes },
              { id: 'FINANCE', label: 'Finance & Ledger', icon: DollarSign },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = adminActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#00bcd4] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SEPARATE QUALITY MANAGER DASHBOARD VIEW                                */}
      {/* ========================================================================= */}
      {activeView === 'QUALITY' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800">
                  Quality Manager Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                Quality Assurance & Roll Inspection
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                ASTM D5430 4-point fabric roll inspection, defect severity analysis, pass/rework grading, and export approvals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/quality"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Pass & Grade Fabric Rolls</span>
              </Link>
            </div>
          </div>

          {/* 4 Quality KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Total Rolls Inspected</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">ASTM D5430</span>
              </div>
              <p className="text-3xl font-black text-slate-800 mt-1">{inspections.length} Rolls</p>
              <p className="text-xs text-slate-400 mt-0.5">Floor loom rolls evaluated</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">First-Pass Export Yield</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Export Ready</span>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-1">{qualityPassRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Approved for buyer dispatch</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Rework Rate</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Trimming</span>
              </div>
              <p className="text-3xl font-black text-amber-600 mt-1">{reworkRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Selvedge & tension rework</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Rejection Scrap</span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Zero Tol</span>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-1">{rejectRate}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Critical defect scrap</p>
            </div>
          </div>

          {/* Quality Grid: Recent Inspections Table + Defect Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Roll Inspections Table */}
            <div className="lg:col-span-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Recent Fabric Roll Evaluations</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Live inspection roll logs from active looms</p>
                  </div>
                  <Link to="/quality" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                    <span>Open Quality Workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50/75 text-[11px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5">Roll ID</th>
                        <th className="px-3 py-2.5">Order / Buyer</th>
                        <th className="px-3 py-2.5">Fabric Spec</th>
                        <th className="px-3 py-2.5">4-Point Score</th>
                        <th className="px-3 py-2.5">Grade</th>
                        <th className="px-3 py-2.5">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspections.slice(0, 6).map((roll) => {
                        const isPass = roll.result === 'PASS';
                        const isRework = roll.result === 'REWORK';
                        return (
                          <tr key={roll.rollId} className="hover:bg-slate-50/50">
                            <td className="px-3 py-3 font-extrabold text-slate-900">{roll.rollId}</td>
                            <td className="px-3 py-3">
                              <span className="font-bold text-slate-800">{roll.orderId}</span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{roll.buyerName}</div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-medium text-slate-700 truncate block max-w-[150px]">{roll.fabricType}</span>
                              <span className="text-[10px] text-slate-400">{roll.rollLengthMeters} M</span>
                            </td>
                            <td className="px-3 py-3 font-black text-slate-800">{roll.fourPointScore} pts</td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {roll.grade || 'Grade A'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                  isPass
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isRework
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {roll.result}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Showing 6 of {inspections.length} inspected rolls</span>
                <Link to="/quality" className="font-bold text-emerald-600 hover:underline">
                  View Full Quality Workspace →
                </Link>
              </div>
            </div>

            {/* Defect Classification & ASTM Standards */}
            <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Defect Classification</h3>
                <p className="text-xs text-slate-400 mt-0.5">ASTM D5430 Defect Distribution</p>

                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Minor Selvedge Snags', percent: 45, color: 'bg-emerald-500', note: 'Easily trimmable outer edge' },
                    { label: 'Weft Slub / Misalignment', percent: 28, color: 'bg-[#00bcd4]', note: 'Yarn thickness variation' },
                    { label: 'Tension / Temple Markings', percent: 18, color: 'bg-amber-400', note: 'Loom grip readjusted' },
                    { label: 'Oil Spots / Dye Streaks', percent: 9, color: 'bg-rose-500', note: 'Rewash & scour required' },
                  ].map((defect) => (
                    <div key={defect.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{defect.label}</span>
                        <span className="font-extrabold text-slate-800">{defect.percent}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${defect.color}`} style={{ width: `${defect.percent}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{defect.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-emerald-50/50 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="text-xs font-bold text-emerald-950">ASTM 4-Point Standard</span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-1">
                  Scores ≤ 20 points per 100 sq.m are certified for Grade A Export delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCTION MANAGER DASHBOARD VIEW                                      */}
      {/* ========================================================================= */}
      {activeView === 'PRODUCTION' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
                <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
                  Production Manager Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                Production Floor & Loom Telemetry
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time monitoring of 20 loom speeds, active order batches, yarn deductions, and shift yields.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/machines"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              >
                <Cog className="h-3.5 w-3.5 text-slate-400" />
                <span>Loom Telemetry</span>
              </Link>
              <Link
                to="/production"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Start / Manage Batches</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Today's Fabric Output</span>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">Shift A</span>
              </div>
              <p className="text-3xl font-black text-purple-700 mt-1">{outputMeters.toLocaleString()} M</p>
              <p className="text-xs text-slate-400 mt-0.5">Completed weave yield</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Loom Fleet Status</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {Math.round((runningMachines / Math.max(1, totalMachines)) * 100)}% Running
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {runningMachines} / {totalMachines}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{idleMachines} Idle • {breakdownMachines} Down</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Active Batches</span>
                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-[#00acc1]">Floor Runs</span>
              </div>
              <p className="text-3xl font-black text-[#00acc1] mt-1">{inProdOrders} Batches</p>
              <p className="text-xs text-slate-400 mt-0.5">{pendingOrders} Pending approval</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Floor Yarn Allocated</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Reserved</span>
              </div>
              <p className="text-3xl font-black text-amber-600 mt-1">{totalAllocatedStockKg.toLocaleString()} KG</p>
              <p className="text-xs text-slate-400 mt-0.5">Loaded on looms for active jobs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Active Production Batches</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Floor orders currently in spinning, weaving, and finishing</p>
                  </div>
                  <Link to="/production" className="text-xs font-bold text-[#00bcd4] hover:underline flex items-center gap-1">
                    <span>Manage Floor</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 mt-3">
                  {orders
                    .filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'CONFIRMED' || o.status === 'PROCESSING')
                    .slice(0, 5)
                    .map((job) => {
                      const progress = Number(job.progress) || 45;
                      return (
                        <div key={job.id} className="py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-800">{job.id}</span>
                              <span className="rounded-full bg-cyan-100/80 px-2 py-0.5 text-[9px] font-extrabold text-[#00838f]">
                                {job.currentStage || 'WEAVING'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                              {job.buyer || job.customerName} — {job.fabricType || job.productType}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Machine: <span className="font-bold text-slate-700">{job.assignedMachine || 'Airjet Loom W-07'}</span> • Target: {Number(job.meters || job.quantity || 1000).toLocaleString()} M
                            </div>
                          </div>

                          <div className="w-32 text-right shrink-0">
                            <span className="text-xs font-black text-slate-800">{progress}%</span>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-[#00bcd4]" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>{inProdOrders} total jobs running</span>
                <Link to="/production" className="font-bold text-[#00bcd4] hover:underline">
                  Open Production Workspace →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Loom Fleet Status (20 Machines)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Live running RPM and sensor status</p>
                  </div>
                  <Link to="/machines" className="text-xs font-bold text-[#00bcd4] hover:underline">
                    All Looms →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                  {machines.slice(0, 16).map((m) => {
                    const isRunning = m.status === 'RUNNING';
                    const isBreakdown = m.status === 'BREAKDOWN';
                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl p-2.5 border text-center transition-all ${
                          isRunning
                            ? 'bg-cyan-50/50 border-cyan-100 text-[#00838f]'
                            : isBreakdown
                            ? 'bg-rose-50/50 border-rose-100 text-rose-700'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isRunning ? 'bg-[#00bcd4] animate-pulse' : isBreakdown ? 'bg-rose-500' : 'bg-amber-400'
                            }`}
                          />
                          <span className="text-xs font-black">{m.code}</span>
                        </div>
                        <div className="text-[10px] font-bold mt-1">
                          {isRunning ? `${m.rpm || 780} RPM` : m.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg Uptime: 96.4%</span>
                <span className="font-extrabold text-emerald-600">Shed A & B Operating</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STORE & INVENTORY MANAGER DASHBOARD VIEW                               */}
      {/* ========================================================================= */}
      {activeView === 'STORE' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
                <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
                  Store & Warehouse Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                Raw Material & Yarn Warehouse
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time stock balances, active loom reservations, yarn receipts, and reorder alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/inventory"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Receive Yarn / Manage Stock</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Total Yarn Stock</span>
              <p className="text-3xl font-black text-slate-800 mt-1">{totalStockKg.toLocaleString()} KG</p>
              <p className="text-xs text-slate-400 mt-0.5">Physical floor inventory</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Allocated to Active Looms</span>
              <p className="text-3xl font-black text-[#00acc1] mt-1">{totalAllocatedStockKg.toLocaleString()} KG</p>
              <p className="text-xs text-slate-400 mt-0.5">Reserved for current jobs</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Available Free Stock</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Real-Time</span>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-1">{totalAvailableStockKg.toLocaleString()} KG</p>
              <p className="text-xs text-slate-400 mt-0.5">Ready for new bookings</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-400">Low Stock SKUs</span>
                {lowStockCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">Alert</span>
                )}
              </div>
              <p className="text-3xl font-black text-rose-600 mt-1">{lowStockCount} Items</p>
              <p className="text-xs text-slate-400 mt-0.5">Purchase order required</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FINANCE & ACCOUNTANT DASHBOARD VIEW                                    */}
      {/* ========================================================================= */}
      {activeView === 'FINANCE' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                <span className="rounded-full bg-purple-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-800">
                  Accountant & Finance Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                Financial Ledger, Invoices & Cost Analytics
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Order receivables, buyer payment settlements, cost breakdowns, operator wages, and executive analytics reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/finance"
                className="rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-extrabold text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Cost & Invoicing Ledger</span>
              </Link>
              <Link
                to="/analytics"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              >
                <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                <span>Financial Analytics</span>
              </Link>
            </div>
          </div>

          {/* 4 Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Total Receivables</span>
              <p className="text-3xl font-black text-purple-700 mt-1">
                ₹{Number(liveFinance?.totalReceivables || 3901000).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Cumulative contract value</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Collected Payments</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                ₹{Number(liveFinance?.totalPaid || 1817000).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Bank ledger cleared</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Outstanding Balance</span>
              <p className="text-3xl font-black text-amber-600 mt-1">
                ₹{Number(liveFinance?.outstandingBalance || 2084000).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Buyer credit pipeline</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
              <span className="text-[11px] font-black uppercase text-slate-400">Estimated Net Margin</span>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {monthlySummary?.margin || 34.4}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Rev ₹{(Number(monthlySummary?.revenue || 1250000) / 100000).toFixed(1)}L vs Cost ₹{(Number(monthlySummary?.cost || 820000) / 100000).toFixed(1)}L
              </p>
            </div>
          </div>

          {/* Financial Analytics Grid: Revenue vs Cost Curves & Cost Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Monthly Trend Bezier Curve */}
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Revenue vs Operating Cost Trend</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Monthly ERP accrual & cash realization</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5 text-purple-700">
                      <span className="h-2 w-2 rounded-full bg-purple-600" /> Revenue
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-slate-300" /> Operating Cost
                    </span>
                  </div>
                </div>

                <div className="relative mt-6 h-48 w-full flex items-center justify-center">
                  <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="20" y1="120" x2="380" y2="120" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="20" y1="70" x2="380" y2="70" stroke="#f8fafc" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Cost Curve (Grey) */}
                    <path
                      d="M 20 95 Q 80 90, 140 85 T 260 80 T 380 75"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />

                    {/* Revenue Fill Area */}
                    <path
                      d="M 20 95 Q 80 80, 140 65 T 260 45 T 380 25 L 380 120 L 20 120 Z"
                      fill="url(#revenueGrad)"
                    />

                    {/* Revenue Curve (Purple) */}
                    <path
                      d="M 20 95 Q 80 80, 140 65 T 260 45 T 380 25"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <circle cx="380" cy="25" r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                  <div className="absolute top-1 right-8 rounded-md bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 shadow-sm">
                    ₹{(Number(monthlySummary?.revenue || 1250000) / 100000).toFixed(1)} Lakhs
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2 px-3">
                  <span>Jun 2026</span>
                  <span>Jul 2026</span>
                  <span>Aug 2026</span>
                  <span>Sep 2026</span>
                  <span className="text-purple-700 font-extrabold">Oct 2026 (Current)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-400">October Gross Profit</span>
                <span className="font-extrabold text-emerald-600">
                  +₹{Number(monthlySummary?.profit || 430000).toLocaleString()} (+{monthlySummary?.margin || 34.4}%)
                </span>
              </div>
            </div>

            {/* Cost Breakdown Analysis */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Cost Structure Breakdown</h3>
                    <p className="text-xs text-slate-400 mt-0.5">₹8.2L total mill manufacturing expenses</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    Activity-Based
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  {[
                    { label: 'Raw Yarn & Chemical Dyes', amount: '₹4,65,000', percent: 56.7, color: 'bg-purple-600' },
                    { label: 'Loom Power & Utilities', amount: '₹1,45,000', percent: 17.7, color: 'bg-cyan-500' },
                    { label: 'Weaver & Helper Wages', amount: '₹1,18,000', percent: 14.4, color: 'bg-emerald-500' },
                    { label: 'Plant Maintenance & Spares', amount: '₹92,000', percent: 11.2, color: 'bg-amber-500' },
                  ].map((cost, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{cost.label}</span>
                        <span className="font-extrabold text-slate-900">{cost.amount} ({cost.percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${cost.color}`} style={{ width: `${cost.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/analytics" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                  <span>View Detailed Cost Analytics</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Order Cost & Profitability Table */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Order Profitability Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time cost rollup & profit margins per buyer production batch</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/finance"
                  className="rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Invoices & Billing</span>
                </Link>
                <Link
                  to="/analytics"
                  className="rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Analytics Reports</span>
                </Link>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Buyer Name</th>
                    <th className="pb-3">Fabric Spec</th>
                    <th className="pb-3 text-right">Meters</th>
                    <th className="pb-3 text-right">Production Cost</th>
                    <th className="pb-3 text-right">Contract Revenue</th>
                    <th className="pb-3 text-right">Net Profit</th>
                    <th className="pb-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {(orderCosts || []).map((row, i) => (
                    <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 font-extrabold text-purple-700">{row.orderNumber}</td>
                      <td className="py-3 font-bold text-slate-800">{row.buyerName}</td>
                      <td className="py-3 text-slate-600">{row.fabricType}</td>
                      <td className="py-3 text-right font-bold">{row.quantityMeters.toLocaleString()} M</td>
                      <td className="py-3 text-right font-semibold text-rose-600">₹{row.totalProductionCost.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-slate-900">₹{row.sellingPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-extrabold text-emerald-600">+₹{row.netProfit.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                          {row.marginPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EXECUTIVE MILL OVERVIEW (ADMIN / FACTORY MANAGER PANORAMA)             */}
      {/* ========================================================================= */}
      {activeView === 'EXECUTIVE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Top-Left Today's Output Wave */}
          <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Today's Output</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Completed production yield from the ERP ledger</p>
                </div>
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-600">
                  Shift A
                </span>
              </div>

              <div className="relative mt-6 h-36 w-full flex items-center justify-center">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  <line x1="10" y1="90" x2="290" y2="90" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4 4" />
                  <path
                    d="M 10 90 Q 50 85, 75 60 T 130 65 T 180 85 T 225 30 T 260 70 L 290 75"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="225" cy="30" r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                </svg>
                <div className="absolute top-2 right-14 -translate-y-1 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-black text-amber-950 shadow-sm">
                  {outputMeters.toLocaleString()} M
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
              <span className="text-slate-400 font-medium">Daily Quota Target</span>
              <span className="font-bold text-purple-700">{Number(liveProduction?.completionRate || 85).toFixed(1)}% Yield</span>
            </div>
          </div>

          {/* Top-Center Loom Efficiency */}
          <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Loom Efficiency</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Average running uptime</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  This Week ▾
                </span>
              </div>

              <div className="relative mt-6 h-36 w-full flex items-center justify-center">
                <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
                  <line x1="0" y1="20" x2="240" y2="20" stroke="#f8fafc" strokeWidth="1" />
                  <line x1="0" y1="50" x2="240" y2="50" stroke="#f8fafc" strokeWidth="1" />
                  <line x1="0" y1="80" x2="240" y2="80" stroke="#f8fafc" strokeWidth="1" />
                  <polyline
                    points="10,65 50,45 80,75 120,30 160,60 200,35 230,50"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="65" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="50" cy="45" r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="80" cy="75" r="3.5" fill="#00bcd4" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="120" cy="30" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="160" cy="60" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="200" cy="35" r="4" fill="#00bcd4" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="230" cy="50" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
              <span className="text-slate-400">Peak Efficiency</span>
              <span className="font-bold text-amber-600">96.4% on Shed A</span>
            </div>
          </div>

          {/* Calendar Widget */}
          <div className="lg:col-span-2 rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <button onClick={() => setActiveCalendarMonth('Sept 2026')} className="p-1 hover:text-[#00bcd4]">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-extrabold text-[#00bcd4]">October 2026</span>
                <button onClick={() => setActiveCalendarMonth('Nov 2026')} className="p-1 hover:text-[#00bcd4]">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-slate-400 mt-2">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-600 mt-1.5">
                <span className="text-slate-300">28</span><span className="text-slate-300">29</span><span className="text-slate-300">30</span>
                <span>1</span><span>2</span><span>3</span><span>4</span>
                <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00bcd4] text-white font-bold mx-auto">10</span>
                <span>11</span><span>12</span><span>13</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-purple-400 font-bold mx-auto">14</span>
                <span>15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#00bcd4] font-bold mx-auto">20</span>
                <span>21</span><span>22</span><span>23</span><span>24</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-400 font-bold mx-auto">25</span>
                <span>26</span><span>27</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-400 font-bold mx-auto">28</span>
                <span>29</span><span>30</span><span>31</span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-center text-slate-400 border-t border-slate-50 pt-2">
              ● 20-Oct: ORD-1024 Delivery
            </div>
          </div>

          {/* Dual Rings QA & Stock */}
          <div className="lg:col-span-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-800">Mill Inventory & QA</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Normal</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Telemetry indicators</p>

              <div className="mt-5 flex items-center justify-around">
                <div className="flex flex-col items-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="80, 100" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs font-black text-slate-800">{(totalStockKg / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-slate-600">Yarn (KG)</span>
                  <span className="text-[10px] text-amber-600 font-semibold">{lowStockCount} Low Alert</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00bcd4" strokeWidth="3.5" strokeDasharray="92, 100" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs font-black text-slate-800">{qualityPassRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-slate-600">QA Pass</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Live QA standard</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between text-[11px] text-slate-400">
              <span>Inspections: {inspections.length}</span>
              <Link to="/quality" className="text-[#00bcd4] font-bold hover:underline">
                View QA Workspace →
              </Link>
            </div>
          </div>

          {/* Machine Fleet Status Bars */}
          <div className="lg:col-span-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Machine Statuses</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{totalMachines} Factory looms</p>
                </div>
                <Link to="/machines" className="text-xs font-bold text-[#00bcd4] hover:underline">
                  Floor →
                </Link>
              </div>

              <div className="relative mt-5 h-28 w-full flex items-center justify-center">
                <svg viewBox="0 0 200 90" className="w-full h-full">
                  <line x1="0" y1="45" x2="200" y2="45" stroke="#00bcd4" strokeWidth="2" opacity="0.4" />
                  <rect x="25" y="15" width="16" height="30" rx="3" fill="#00bcd4" />
                  <rect x="70" y="5" width="16" height="40" rx="3" fill="#f59e0b" />
                  <rect x="115" y="25" width="16" height="20" rx="3" fill="#00bcd4" />
                  <rect x="160" y="32" width="16" height="13" rx="3" fill="#f59e0b" />
                </svg>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
              <span className="text-[#00acc1]">🟢 {runningMachines} Run</span>
              <span className="text-amber-600">🟡 {idleMachines} Idle</span>
              <span className="text-rose-600">🔴 {breakdownMachines} Down</span>
              <span className="text-sky-600">🔵 {maintenanceMachines} Maint</span>
            </div>
          </div>

          {/* Revenue vs Cost Spread Waves */}
          <div className="lg:col-span-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Revenue & Cost Spread</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Outstanding receivables: ₹{Number(liveFinance?.outstandingBalance || 2084000).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  All time ▾
                </span>
              </div>

              <div className="relative mt-5 h-28 w-full flex items-center justify-center">
                <svg viewBox="0 0 320 90" className="w-full h-full overflow-visible">
                  <path d="M 10 50 Q 60 25, 110 55 T 190 45 T 260 25 L 310 50" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="110" cy="55" r="3.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="260" cy="25" r="3.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M 10 70 Q 60 45, 90 50 T 170 20 T 250 15 L 310 35" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="90" cy="50" r="3.5" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
                  <circle cx="250" cy="15" r="3.5" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
              <span className="font-bold text-purple-700">Revenue (₹12.5L) vs Cost (₹8.2L)</span>
              <span className="font-extrabold text-emerald-600">Net: ₹4.3L (34.4%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
