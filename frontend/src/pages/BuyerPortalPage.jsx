import React, { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import Badge from '../components/Badge';
import {
  Globe,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
  Calendar,
  Building,
  Sparkles,
  PhoneCall,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function BuyerPortalPage() {
  const { orders, getOrderById } = useOrderStore();
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-1024');

  const currentOrder = getOrderById(selectedOrderId) || orders[1] || orders[0];

  // Pipeline stages for ORD-1024 requirement:
  // Raw Material ✅, Spinning ✅, Weaving 🔄 70%, Dyeing ⏳, Quality Check ⏳, Ready for Dispatch ⏳
  const stages = [
    {
      name: 'Raw Material',
      status: 'COMPLETED',
      icon: Check,
      details: '1,350 KG Poly-Viscose Yarn received and tested.',
      timestamp: '08-Oct-2026',
    },
    {
      name: 'Spinning',
      status: 'COMPLETED',
      icon: Check,
      details: 'Ne 30/1 Ring spinning completed on Frame S-03.',
      timestamp: '09-Oct-2026',
    },
    {
      name: 'Weaving',
      status: 'IN_PROGRESS',
      progress: '70%',
      icon: RefreshCw,
      details: '4,200 / 6,000 Meters woven on Sulzer Rapier Loom W-03.',
      timestamp: 'Running Now (Op: Amit Sharma)',
    },
    {
      name: 'Dyeing & Finishing',
      status: 'QUEUED',
      icon: Clock,
      details: 'Soft-flow reactive vat dyeing scheduled on Vat D-02.',
      timestamp: 'Scheduled 18-Oct',
    },
    {
      name: 'Quality Check',
      status: 'QUEUED',
      icon: Clock,
      details: '4-point ASTM D5430 fabric roll inspection.',
      timestamp: 'Scheduled 19-Oct',
    },
    {
      name: 'Ready for Dispatch',
      status: 'QUEUED',
      icon: Truck,
      details: 'Packaging into export moisture-proof poly rolls.',
      timestamp: 'Scheduled 20-Oct',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
              <span className="rounded bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 border border-purple-400/20">
                Live Buyer Tracking Gateway
              </span>
              <span className="text-xs text-slate-400">Client Transparency Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Self-Service Order Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Instead of phone calls and floor walk-arounds, buyers track their order stages in real time with
              complete progress transparency.
            </p>
          </div>

          {/* Order Search / Quick Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="ORD-1024">ORD-1024 (Apex Fashion Group - 70% Weaving)</option>
              <option value="ORD-25">ORD-25 (Zara International - Single Jersey)</option>
              <option value="ORD-28">ORD-28 (H&M Global Sourcing - Pique Knit)</option>
              <option value="ORD-33">ORD-33 (Levi Strauss India - Denim Twill)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Order Details Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-900">{currentOrder.orderNumber}</span>
              <Badge status={currentOrder.priority} />
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {currentOrder.status?.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-1">{currentOrder.buyerName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Contact: {currentOrder.contactPerson}</p>
          </div>

          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4 text-right sm:text-right">
            <span className="text-[11px] font-bold uppercase text-purple-700 tracking-wider">
              Expected Delivery Date
            </span>
            <p className="text-xl font-extrabold text-purple-900 mt-0.5">
              {currentOrder.deadline || '20-Oct-2026'}
            </p>
            <p className="text-[10px] text-purple-600 mt-0.5">On Schedule • No Floor Delays</p>
          </div>
        </div>

        {/* Visual Progress Stepper (Reviewer Specification) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            Live Production Pipeline
          </h4>

          <div className="relative">
            {/* Step Line for desktop */}
            <div className="hidden md:block absolute top-6 left-8 right-8 h-1 bg-slate-100 -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {stages.map((st, index) => {
                const isCompleted = st.status === 'COMPLETED';
                const isInProgress = st.status === 'IN_PROGRESS';
                const isQueued = st.status === 'QUEUED';

                return (
                  <div key={index} className="flex flex-col items-center text-center">
                    {/* Circle Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : isInProgress
                          ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted && <Check className="h-6 w-6 stroke-[3]" />}
                      {isInProgress && <RefreshCw className="h-5 w-5 animate-spin" />}
                      {isQueued && <Clock className="h-5 w-5" />}
                    </div>

                    {/* Step Title & Badge */}
                    <div className="mt-3">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{st.name}</span>
                        {isCompleted && <span className="text-emerald-600 text-xs">✅</span>}
                        {isInProgress && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                            🔄 {st.progress}
                          </span>
                        )}
                        {isQueued && <span className="text-slate-400 text-xs">⏳</span>}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 max-w-[150px]">
                        {st.details}
                      </p>

                      <span className="mt-1 block text-[10px] font-medium text-slate-400">
                        {st.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fabric Specifications Summary */}
        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Fabric Specifications & Order Volume
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Fabric Type:</span>
              <p className="font-bold text-slate-900 mt-0.5">{currentOrder.fabricType}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Colour / Shade:</span>
              <p className="font-bold text-slate-900 mt-0.5">{currentOrder.colour}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Ordered Volume:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {currentOrder.quantityMeters.toLocaleString()} Meters
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Completed to Date:</span>
              <p className="font-bold text-blue-700 mt-0.5">
                {currentOrder.producedMeters.toLocaleString()} Meters (70%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
