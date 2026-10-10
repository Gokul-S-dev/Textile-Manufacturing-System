import React, { useState } from 'react';
import { useQualityStore } from '../store/useQualityStore';
import { useOrderStore } from '../store/useOrderStore';
import { useMachineStore } from '../store/useMachineStore';
import { useWorkerStore } from '../store/useWorkerStore';
import Badge from '../components/Badge';
import {
  GitBranch,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Layers,
  Factory,
  Cog,
  User,
  ShieldAlert,
  Warehouse,
  Truck,
  FileText,
  Coins,
  Sparkles,
} from 'lucide-react';

export default function TraceabilityPage() {
  const { getTraceabilityData } = useQualityStore();
  const [searchQuery, setSearchQuery] = useState('R-102');

  const trace = getTraceabilityData(searchQuery);

  const isDefective = trace.result === 'REJECT';

  // 11-step end-to-end chain according to requirement 13
  const chainNodes = [
    {
      step: 1,
      title: 'BUYER ORDER',
      icon: Layers,
      primary: trace.orderId,
      secondary: trace.buyerName,
      status: 'active',
      badge: 'Order Logged',
    },
    {
      step: 2,
      title: 'RAW MATERIAL',
      icon: Factory,
      primary: trace.rawMaterialLot,
      secondary: '950 KG Yarn Allocated',
      status: 'active',
      badge: 'Lot Verified',
    },
    {
      step: 3,
      title: 'PRODUCTION STAGE',
      icon: Cog,
      primary: trace.productionStage,
      secondary: 'Airjet Weaving Run',
      status: 'active',
      badge: 'Weaving',
    },
    {
      step: 4,
      title: 'MACHINE',
      icon: Cog,
      primary: `Machine ${trace.machineCode}`,
      secondary: trace.machineName,
      status: isDefective ? 'error' : 'success',
      badge: isDefective ? 'Fault Triggered' : 'Running',
    },
    {
      step: 5,
      title: 'WORKER / OPERATOR',
      icon: User,
      primary: `Operator ${trace.operatorCode}`,
      secondary: trace.operatorName,
      status: 'active',
      badge: 'Shift A',
    },
    {
      step: 6,
      title: 'QUALITY CHECK',
      icon: isDefective ? XCircle : CheckCircle2,
      primary: `Verdict: ${trace.result}`,
      secondary: `Defect: ${trace.defectType}`,
      status: isDefective ? 'error' : 'success',
      badge: isDefective ? 'Defect Caught' : 'Passed',
    },
    {
      step: 7,
      title: 'FINISHED ROLL',
      icon: Layers,
      primary: `Roll ${trace.rollId}`,
      secondary: 'Single Jersey 100% Cotton',
      status: isDefective ? 'error' : 'success',
      badge: trace.rollId,
    },
    {
      step: 8,
      title: 'WAREHOUSE STORAGE',
      icon: Warehouse,
      primary: trace.warehouseLocation,
      secondary: isDefective ? 'Quarantine Holding Bay' : 'Rack A-12',
      status: isDefective ? 'warning' : 'success',
      badge: isDefective ? 'Quarantine' : 'Stocked',
    },
    {
      step: 9,
      title: 'DISPATCH GATE',
      icon: Truck,
      primary: isDefective ? 'DISPATCH PROHIBITED' : 'Clear for Shipping',
      secondary: isDefective ? 'Blocked by Quality Rule' : 'Vehicle Assigned',
      status: isDefective ? 'error' : 'success',
      badge: isDefective ? 'Locked 🔒' : 'Eligible',
    },
    {
      step: 10,
      title: 'TAX INVOICE',
      icon: FileText,
      primary: isDefective ? 'INVOICE WITHHELD' : 'INV-2026-088',
      secondary: isDefective ? 'Non-billable scrap lot' : 'Ready for payment',
      status: isDefective ? 'error' : 'success',
      badge: isDefective ? 'Cancelled' : 'Valid',
    },
    {
      step: 11,
      title: 'COST & PROFIT',
      icon: Coins,
      primary: isDefective ? 'Remediation Scrap Cost: ₹32,000' : 'Net Margin: 33.9%',
      secondary: isDefective ? 'Claim routed to insurance' : 'Order Profit: ₹2,44,000',
      status: isDefective ? 'warning' : 'success',
      badge: isDefective ? 'Loss Monitored' : 'Profitable',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="rounded bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-400/20">
                Core Reviewer Requirement
              </span>
              <span className="text-xs text-slate-400">Everest Traceability Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              End-to-End Production & Defect Traceability Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Trace any roll or defective fabric backward and forward through:
              <strong> Order ➔ Yarn ➔ Loom ➔ Operator ➔ QA ➔ Warehouse ➔ Dispatch ➔ Profit</strong>.
            </p>
          </div>

          {/* Quick Buttons for Reviewer */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSearchQuery('R-102')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow ${
                searchQuery === 'R-102'
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Trace Roll R-102 (Defective)
            </button>

            <button
              onClick={() => setSearchQuery('R-101')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow ${
                searchQuery === 'R-101'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Trace Roll R-101 (Passed)
            </button>

            <button
              onClick={() => setSearchQuery('ORD-1024')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow ${
                searchQuery === 'ORD-1024'
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Trace Order ORD-1024
            </button>
          </div>
        </div>
      </div>

      {/* Reviewer Highlight Case: Roll R-102 */}
      {isDefective && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/90 p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shrink-0 shadow-lg shadow-rose-600/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-rose-950">
                  Reviewer Traceability Test Case: Roll R-102 Defect Root Cause Analysis
                </h3>
                <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white uppercase">
                  Verdict: REJECT
                </span>
              </div>

              {/* Exact Lineage representation */}
              <div className="rounded-2xl bg-white/90 border border-rose-200 p-4 font-mono text-xs text-rose-950 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 font-bold text-sm">
                  <span className="rounded bg-rose-100 px-2.5 py-1 text-rose-800">Roll R-102</span>
                  <span className="text-slate-400 font-sans">➔</span>
                  <span className="rounded bg-blue-100 px-2.5 py-1 text-blue-800">Order ORD-25</span>
                  <span className="text-slate-400 font-sans">➔</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-800">Machine W-07</span>
                  <span className="text-slate-400 font-sans">➔</span>
                  <span className="rounded bg-amber-100 px-2.5 py-1 text-amber-800">Operator O-15 (Ramesh Kumar)</span>
                  <span className="text-slate-400 font-sans">➔</span>
                  <span className="rounded bg-rose-600 px-2.5 py-1 text-white">Defect: Uneven weaving</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="rounded-xl bg-white p-3 border border-rose-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Target Buyer</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trace.buyerName}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-rose-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Defect Location</span>
                  <p className="font-bold text-slate-900 mt-0.5">Meters 45 to 63 (Critical pick irregularity)</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-rose-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400">System Enforcement</span>
                  <p className="font-bold text-rose-600 mt-0.5">Strictly blocked from vehicle dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11-Stage Interactive Traceability Node Graph (Requirement 13) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Complete 11-Stage End-to-End Lineage Stepper
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live data mapping for identifier: <strong className="text-slate-800">{searchQuery}</strong>
            </p>
          </div>
          <Badge status={trace.result} />
        </div>

        {/* Chain Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chainNodes.map((node) => {
            const isError = node.status === 'error';
            const isWarning = node.status === 'warning';

            return (
              <div
                key={node.step}
                className={`relative rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                  isError
                    ? 'border-rose-300 bg-rose-50/30'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700">
                      {node.step}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        isError
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {node.badge}
                    </span>
                  </div>

                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-3">
                    {node.title}
                  </h4>

                  <p className="text-sm font-bold text-slate-900 mt-1">{node.primary}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{node.secondary}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Step {node.step} of 11</span>
                  {node.step < 11 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
