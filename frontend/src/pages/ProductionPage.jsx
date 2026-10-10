import React, { useState } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Cpu,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Cog,
  User,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionPage() {
  const { orders, updateProductionProgress, updateOrderStatus } = useOrderStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [activeStageTab, setActiveStageTab] = useState('ALL');
  const [progressModalOrder, setProgressModalOrder] = useState(null);
  const [incrementMeters, setIncrementMeters] = useState(250);

  // Filter only orders in production
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Factory Floor Production Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live telemetry of active production runs across Spinning, Airjet Weaving, and Vat Dyeing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/machines"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Cog className="h-4 w-4 text-slate-500" />
            <span>Floor Machine Status</span>
          </Link>
        </div>
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeStageTab === tab.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeStageTab === tab.key ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
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
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{job.orderNumber}</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {job.stage || 'Weaving'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{job.buyerName}</p>
                  </div>
                  <Badge status={job.priority} />
                </div>

                {/* Fabric Info */}
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fabric:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{job.fabricType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Colour:</span>
                    <span className="font-medium text-slate-800">{job.colour}</span>
                  </div>
                </div>

                {/* Machine & Operator */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Cog className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold">{job.assignedMachineName || 'Loom Floor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{job.assignedWorkerName || 'Floor Pool'}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-900 font-bold">{produced.toLocaleString()} M Produced</span>
                    <span className="text-slate-500">{remaining.toLocaleString()} M Left ({progressPct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Timing */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Started: 2026-10-09</span>
                  </div>
                  <div className="font-semibold text-slate-700">Deadline: {job.deadline}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setProgressModalOrder(job);
                    setIncrementMeters(250);
                  }}
                  className="flex-1 rounded-xl bg-blue-50 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  + Log Production Output
                </button>

                {job.orderNumber === 'ORD-25' && (
                  <Link
                    to="/traceability"
                    className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Trace R-102
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Increment Output Modal */}
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
              <label className="block text-xs font-semibold text-slate-700">
                Additional Meters Produced on Machine Today *
              </label>
              <input
                type="number"
                required
                min="10"
                value={incrementMeters}
                onChange={(e) => setIncrementMeters(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Currently produced: {progressModalOrder.producedMeters} / {progressModalOrder.quantityMeters} M.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setProgressModalOrder(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
              >
                Record Output & Advance Loom
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
