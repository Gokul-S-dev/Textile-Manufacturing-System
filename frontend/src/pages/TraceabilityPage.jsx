import React, { useState } from 'react';
import { useQualityStore } from '../store/useQualityStore';
import Badge from '../components/Badge';
import {
  GitBranch,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
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

  const chainNodes = [
    { step: 1, title: 'BUYER ORDER', primary: trace.orderId, secondary: trace.buyerName, badge: 'Order Logged', color: 'bg-cyan-50 border-cyan-200 text-[#00acc1]' },
    { step: 2, title: 'RAW MATERIAL', primary: trace.rawMaterialLot, secondary: '950 KG Yarn Allocated', badge: 'Lot Verified', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { step: 3, title: 'PRODUCTION STAGE', primary: trace.productionStage, secondary: 'Airjet Weaving Run', badge: 'Weaving', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { step: 4, title: 'MACHINE', primary: `Machine ${trace.machineCode}`, secondary: trace.machineName, badge: isDefective ? 'Fault Triggered' : 'Running', color: isDefective ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-cyan-50 border-cyan-200 text-[#00acc1]' },
    { step: 5, title: 'WORKER / OPERATOR', primary: `Operator ${trace.operatorCode}`, secondary: trace.operatorName, badge: 'Shift A', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { step: 6, title: 'QUALITY CHECK', primary: `Verdict: ${trace.result}`, secondary: `Defect: ${trace.defectType}`, badge: isDefective ? 'Defect Caught' : 'Passed', color: isDefective ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { step: 7, title: 'FINISHED ROLL', primary: `Roll ${trace.rollId}`, secondary: 'Single Jersey 100% Cotton', badge: trace.rollId, color: isDefective ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { step: 8, title: 'WAREHOUSE STORAGE', primary: trace.warehouseLocation, secondary: isDefective ? 'Quarantine Holding Bay' : 'Rack A-12', badge: isDefective ? 'Quarantine' : 'Stocked', color: isDefective ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-cyan-50 border-cyan-200 text-[#00acc1]' },
    { step: 9, title: 'DISPATCH GATE', primary: isDefective ? 'DISPATCH PROHIBITED' : 'Clear for Shipping', secondary: isDefective ? 'Blocked by Quality Rule' : 'Vehicle Assigned', badge: isDefective ? 'Locked 🔒' : 'Eligible', color: isDefective ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { step: 10, title: 'TAX INVOICE', primary: isDefective ? 'INVOICE WITHHELD' : 'INV-2026-088', secondary: isDefective ? 'Non-billable scrap lot' : 'Ready for payment', badge: isDefective ? 'Cancelled' : 'Valid', color: isDefective ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-purple-50 border-purple-200 text-purple-700' },
    { step: 11, title: 'COST & PROFIT', primary: isDefective ? 'Scrap Cost: ₹32,000' : 'Net Margin: 33.9%', secondary: isDefective ? 'Loss Monitored' : 'Profit: ₹2,44,000', badge: isDefective ? 'Scrap' : 'Profitable', color: isDefective ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Card in Clean Soft Aesthetic */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Reviewer Traceability Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            End-to-End Defect & Roll Traceability
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Follow the complete chain: Buyer Order ➔ Raw Yarn ➔ Loom ➔ Operator ➔ QA Defect ➔ Finished Roll ➔ Warehouse ➔ Dispatch ➔ Invoice ➔ Profit.
          </p>
        </div>

        {/* Quick Reviewer Buttons matching pastel pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSearchQuery('R-102')}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all shadow-xs ${
              searchQuery === 'R-102'
                ? 'bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Trace Roll R-102 (Defective)
          </button>

          <button
            onClick={() => setSearchQuery('R-101')}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all shadow-xs ${
              searchQuery === 'R-101'
                ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Trace Roll R-101 (Passed)
          </button>

          <button
            onClick={() => setSearchQuery('ORD-1024')}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all shadow-xs ${
              searchQuery === 'ORD-1024'
                ? 'bg-purple-500 text-white shadow-purple-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Trace ORD-1024
          </button>
        </div>
      </div>

      {/* Reviewer Root Cause Defect Banner for Roll R-102 */}
      {isDefective && (
        <div className="rounded-3xl bg-rose-50/70 border border-rose-200/80 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shrink-0 shadow-md shadow-rose-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-rose-950">
                  Defect Lineage Audit: Roll R-102 Root Cause Found
                </h3>
                <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-extrabold text-white">
                  VERDICT: REJECT
                </span>
              </div>

              {/* Exact reviewer formula in pastel cards */}
              <div className="rounded-2xl bg-white p-3.5 border border-rose-100 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">Roll R-102</span>
                <span className="text-slate-300">➔</span>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-[#00acc1]">Order ORD-25</span>
                <span className="text-slate-300">➔</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Machine W-07</span>
                <span className="text-slate-300">➔</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Operator O-15 (Ramesh Kumar)</span>
                <span className="text-slate-300">➔</span>
                <span className="rounded-full bg-rose-500 px-3 py-1 text-white">Defect: Uneven weaving</span>
              </div>

              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                Weft tension sensor malfunction on Loom W-07 caused visible pick variation across meters 45-63.
                Roll quarantined in Section Q-2; warehouse dispatch strictly blocked by system rule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 11-Stage Bento Grid Lineage */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">11-Stage End-to-End Stepper</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tracking query: {searchQuery}</p>
          </div>
          <Badge status={trace.result} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {chainNodes.map((node) => (
            <div
              key={node.step}
              className={`rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${node.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 font-black text-[10px] text-slate-700 shadow-xs">
                    {node.step}
                  </span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold shadow-xs">
                    {node.badge}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 block">
                  {node.title}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">{node.primary}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{node.secondary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Stage {node.step} of 11</span>
                {node.step < 11 && <ArrowRight className="h-3.5 w-3.5" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
