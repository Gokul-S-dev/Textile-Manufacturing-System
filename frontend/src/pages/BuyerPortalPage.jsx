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

  const stages = [
    {
      name: 'Raw Material',
      status: 'COMPLETED',
      icon: Check,
      tag: 'Completed',
      tagColor: 'bg-[#00bcd4] text-white',
      details: '1,350 KG Poly-Viscose Yarn received and tested.',
      timestamp: '08-Oct-2026',
    },
    {
      name: 'Spinning',
      status: 'COMPLETED',
      icon: Check,
      tag: 'Completed',
      tagColor: 'bg-emerald-500 text-white',
      details: 'Ne 30/1 Ring spinning completed on Frame S-03.',
      timestamp: '09-Oct-2026',
    },
    {
      name: 'Weaving',
      status: 'IN_PROGRESS',
      progress: '70%',
      icon: RefreshCw,
      tag: 'Running 70%',
      tagColor: 'bg-amber-400 text-amber-950',
      details: '4,200 / 6,000 Meters woven on Sulzer Rapier Loom W-03.',
      timestamp: 'Active Now (Op: Amit Sharma)',
    },
    {
      name: 'Dyeing',
      status: 'QUEUED',
      icon: Clock,
      tag: 'Scheduled',
      tagColor: 'bg-purple-100 text-purple-700',
      details: 'Soft-flow reactive vat dyeing on Vat D-02.',
      timestamp: '18-Oct-2026',
    },
    {
      name: 'Quality Check',
      status: 'QUEUED',
      icon: Clock,
      tag: 'Scheduled',
      tagColor: 'bg-slate-100 text-slate-600',
      details: '4-point ASTM D5430 fabric roll inspection.',
      timestamp: '19-Oct-2026',
    },
    {
      name: 'Dispatch',
      status: 'QUEUED',
      icon: Truck,
      tag: 'Scheduled',
      tagColor: 'bg-slate-100 text-slate-600',
      details: 'Packaging into export moisture-proof rolls.',
      timestamp: '20-Oct-2026',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Live Buyer Tracking Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Order Status & Delivery Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live digital progress portal providing buyers with real-time insight into manufacturing stages and expected shipment dates.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none shadow-xs"
          >
            <option value="ORD-1024">ORD-1024 (Apex Fashion Group - 70% Weaving)</option>
            <option value="ORD-25">ORD-25 (Zara International - Single Jersey)</option>
            <option value="ORD-28">ORD-28 (H&M Global Sourcing - Pique Knit)</option>
            <option value="ORD-33">ORD-33 (Levi Strauss India - Denim Twill)</option>
          </select>
        </div>
      </div>

      {/* Main Order Bento Box */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 space-y-8">
        {/* Banner Details */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">{currentOrder.orderNumber}</span>
              <Badge status={currentOrder.priority} />
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-extrabold text-[#00acc1]">
                {currentOrder.status?.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-700 mt-1">{currentOrder.buyerName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Contact: {currentOrder.contactPerson}</p>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 text-right">
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
              Expected Delivery Date
            </span>
            <p className="text-2xl font-black text-amber-950 mt-0.5">{currentOrder.deadline || '20-Oct-2026'}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">On Schedule • Active Loom W-03</p>
          </div>
        </div>

        {/* Milestone Pipeline Stepper with Speech Bubble Tags */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-8">
            Live Manufacturing Milestones
          </h4>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="hidden md:block absolute top-7 left-10 right-10 h-1 bg-[#8b5cf6]/30 -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {stages.map((st, idx) => {
                const isDone = st.status === 'COMPLETED';
                const isRun = st.status === 'IN_PROGRESS';

                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    {/* Circle Node */}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl font-extrabold transition-all shadow-sm ${
                        isDone
                          ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                          : isRun
                          ? 'bg-amber-400 text-amber-950 shadow-amber-400/30 ring-4 ring-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isDone && <Check className="h-6 w-6 stroke-[3]" />}
                      {isRun && <RefreshCw className="h-6 w-6 animate-spin" />}
                      {!isDone && !isRun && <Clock className="h-5 w-5" />}
                    </div>

                    {/* Speech Bubble Tag */}
                    <div className={`mt-3 rounded-lg px-2.5 py-0.5 text-[10px] font-black shadow-xs ${st.tagColor}`}>
                      {st.tag}
                    </div>

                    <h5 className="font-bold text-xs text-slate-800 mt-2">{st.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[140px] line-clamp-2">
                      {st.details}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">
                      {st.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Specs Bento Box */}
        <div className="rounded-2xl bg-slate-50/60 p-5 border border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] font-semibold">Fabric Type:</span>
              <p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.fabricType}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-semibold">Colour:</span>
              <p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.colour}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-semibold">Total Order Volume:</span>
              <p className="font-extrabold text-slate-800 mt-0.5">{currentOrder.quantityMeters.toLocaleString()} Meters</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-semibold">Weaving Progress:</span>
              <p className="font-extrabold text-[#00acc1] mt-0.5">
                {currentOrder.producedMeters.toLocaleString()} M (70%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
