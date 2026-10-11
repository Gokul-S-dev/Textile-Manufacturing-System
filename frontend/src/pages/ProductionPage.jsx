import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Cpu,
  Clock,
  Cog,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionPage() {
  const { orders, fetchOrders, updateProductionProgress } = useOrderStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [activeStageTab, setActiveStageTab] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const [progressModalOrder, setProgressModalOrder] = useState(null);
  const [incrementMeters, setIncrementMeters] = useState(250);

  const inProductionOrders = orders.filter((o) => o.status === 'IN_PRODUCTION');

  const filteredOrders = inProductionOrders.filter((o) => {
    if (activeStageTab === 'ALL') return true;
    return o.stage?.toLowerCase().includes(activeStageTab.toLowerCase());
  });

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!progressModalOrder) return;

    const currentProduced = Number(progressModalOrder.producedMeters);
    const newProduced = currentProduced + Number(incrementMeters);

    updateProductionProgress(progressModalOrder.id, newProduced);

    addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'PRODUCTION_INCREMENT',
      target: progressModalOrder.orderNumber,
      details: `Logged +${incrementMeters}M on ${progressModalOrder.assignedMachineName || 'Loom'}. Total now ${newProduced}M.`,
      badgeColor: 'blue',
    });

    addToast({
      type: 'success',
      title: 'Production Logged',
      message: `Updated progress for ${progressModalOrder.orderNumber}: ${newProduced}M produced.`,
    });

    setProgressModalOrder(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Floor Production
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Production Stage Floor Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry of active production runs across Spinning, Airjet Weaving, and Vat Dyeing.
          </p>
        </div>

        <Link
          to="/machines"
          className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Cog className="h-4 w-4" />
          <span>Floor Machine Status</span>
        </Link>
      </div>

      {/* Stage Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'All Floor Stages', count: inProductionOrders.length },
          {
            key: 'Spinning',
            label: '1. Spinning Frames',
            count: inProductionOrders.filter((o) => o.stage?.includes('Spinning')).length,
          },
          {
            key: 'Weaving',
            label: '2. Weaving Looms',
            count: inProductionOrders.filter((o) => o.stage?.includes('Weaving')).length,
          },
          {
            key: 'Dyeing',
            label: '3. Dyeing & Finishing',
            count: inProductionOrders.filter((o) => o.stage?.includes('Dyeing')).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStageTab(tab.key)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold transition-all shadow-xs ${
              activeStageTab === tab.key
                ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeStageTab === tab.key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((job) => {
          const produced = Number(job.producedMeters) || 0;
          const total = Number(job.quantityMeters) || 1000;
          const remaining = Math.max(0, total - produced);
          const progressPct = Math.min(100, Math.round((produced / total) * 100));

          return (
            <div
              key={job.id}
              className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{job.orderNumber}</span>
                      <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00acc1]">
                        {job.stage || 'Weaving'}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-700 mt-1">{job.buyerName}</p>
                  </div>
                  <Badge status={job.priority} />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50/70 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fabric:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{job.fabricType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Colour:</span>
                    <span className="font-bold text-slate-800">{job.colour}</span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Cog className="h-3.5 w-3.5 text-[#00bcd4] shrink-0" />
                    <span className="font-bold">{job.assignedMachineName || 'Loom Floor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{job.assignedWorkerName || 'Floor Pool'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 font-bold">{produced.toLocaleString()} M</span>
                    <span className="text-[#00acc1] font-bold">{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPct >= 100 ? 'bg-emerald-500' : 'bg-[#00bcd4]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Started: 2026-10-09</span>
                  </div>
                  <div className="font-bold text-slate-700">Deadline: {job.deadline}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setProgressModalOrder(job);
                    setIncrementMeters(250);
                  }}
                  className="flex-1 rounded-full bg-cyan-50 py-2 text-center text-xs font-bold text-[#00acc1] hover:bg-cyan-100 transition-colors"
                >
                  + Log Production
                </button>

                {job.orderNumber === 'ORD-25' && (
                  <Link
                    to="/traceability"
                    className="rounded-full bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Trace
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Output Increment Modal */}
      {progressModalOrder && (
        <Modal
          isOpen={!!progressModalOrder}
          onClose={() => setProgressModalOrder(null)}
          title={`Log Production Meters: ${progressModalOrder.orderNumber}`}
        >
          <form onSubmit={handleUpdateProgress} className="space-y-4">
            <div>
              <p className="text-xs text-slate-600 mb-2">
                Order: <strong className="text-slate-900">{progressModalOrder.buyerName}</strong> (
                {progressModalOrder.fabricType})
              </p>
              <label className="block text-xs font-bold text-slate-700">
                Additional Meters Produced Today *
              </label>
              <input
                type="number"
                required
                min="10"
                value={incrementMeters}
                onChange={(e) => setIncrementMeters(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setProgressModalOrder(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Save Output
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


