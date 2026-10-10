import React, { useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Cog,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Wrench,
  Search,
  User,
  Gauge,
  Clock,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MachinesPage() {
  const {
    machines,
    updateMachineStatus,
    getTotalMachinesCount,
    getRunningCount,
    getIdleCount,
    getBreakdownCount,
    getMaintenanceCount,
    getTodayTotalOutputMeters,
  } = useMachineStore();

  const { addToast } = useNotificationStore();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Status Change Modal
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [newStatus, setNewStatus] = useState('RUNNING');
  const [statusReason, setStatusReason] = useState('');

  const total = getTotalMachinesCount();
  const running = getRunningCount();
  const idle = getIdleCount();
  const breakdown = getBreakdownCount();
  const maintenance = getMaintenanceCount();
  const totalMetersToday = getTodayTotalOutputMeters();

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedMachine) return;

    updateMachineStatus(selectedMachine.id, newStatus, statusReason, 'Production Manager');

    addToast({
      type: newStatus === 'BREAKDOWN' ? 'error' : newStatus === 'RUNNING' ? 'success' : 'info',
      title: `Machine ${selectedMachine.code} Status Updated`,
      message: `Machine set to ${newStatus}. Recorded in system audit trail.`,
    });

    setSelectedMachine(null);
    setStatusReason('');
  };

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.currentOrder.toLowerCase().includes(search.toLowerCase()) ||
      m.currentWorker.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    const matchesType = filterType === 'ALL' || m.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Factory Floor Machine Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            20 high-speed spinning frames, airjet looms, rapier looms, and dyeing vats with telemetry & downtime tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/traceability"
            className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Trace W-07 to Roll R-102</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Fleet</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{total} Units</p>
        </div>

        <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-emerald-700">🟢 Running</span>
          <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{running}</p>
        </div>

        <div className="rounded-2xl bg-amber-50/70 p-3.5 border border-amber-100 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-amber-700">🟡 Idle</span>
          <p className="text-xl font-extrabold text-amber-800 mt-0.5">{idle}</p>
        </div>

        <div className="rounded-2xl bg-rose-50/70 p-3.5 border border-rose-100 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-rose-700">🔴 Breakdown</span>
          <p className="text-xl font-extrabold text-rose-800 mt-0.5">{breakdown}</p>
        </div>

        <div className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-sky-700">🔵 Maintenance</span>
          <p className="text-xl font-extrabold text-sky-800 mt-0.5">{maintenance}</p>
        </div>

        <div className="rounded-2xl bg-blue-50/70 p-3.5 border border-blue-100 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase text-blue-700">Today's Output</span>
          <p className="text-xl font-extrabold text-blue-800 mt-0.5">{totalMetersToday.toLocaleString()} M</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Machines' },
            { key: 'RUNNING', label: `🟢 Running (${running})` },
            { key: 'IDLE', label: `🟡 Idle (${idle})` },
            { key: 'BREAKDOWN', label: `🔴 Breakdown (${breakdown})` },
            { key: 'MAINTENANCE', label: `🔵 Maintenance (${maintenance})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Loom W-07, Rieter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* 20 Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMachines.map((m) => {
          const isW07 = m.code === 'W-07';

          return (
            <div
              key={m.id}
              className={`rounded-2xl bg-white border p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between ${
                isW07 ? 'border-rose-300 ring-2 ring-rose-200/50 bg-rose-50/20' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-extrabold text-xs text-slate-900">
                      {m.code}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{m.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.type} • {m.location}</p>
                    </div>
                  </div>
                  <Badge status={m.status} />
                </div>

                {/* Reviewer Callout for Loom W-07 */}
                {isW07 && (
                  <div className="mt-3 rounded-xl bg-rose-100/70 p-2.5 text-[11px] text-rose-900 border border-rose-200">
                    <div className="font-bold flex items-center gap-1 text-rose-800">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Reviewer Traceability Focus</span>
                    </div>
                    <p className="mt-0.5 leading-relaxed text-[10px] text-rose-800">
                      Produced defective roll <strong>R-102</strong> (Uneven weaving) under Operator <strong>O-15</strong>.
                    </p>
                  </div>
                )}

                {/* Breakdown details */}
                {m.breakdownReason && !isW07 && (
                  <div className="mt-2.5 rounded-lg bg-rose-50 p-2 text-[10px] text-rose-800 border border-rose-100">
                    <span className="font-bold">Fault Reason:</span> {m.breakdownReason}
                  </div>
                )}

                {/* Order & Operator Info */}
                <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-2.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Current Job:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {m.currentOrder}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Assigned Operator:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">
                      {m.currentWorker}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs border-t border-slate-100 pt-2.5">
                  <div className="rounded-lg bg-slate-50 p-1.5">
                    <span className="text-[10px] text-slate-400 block">Today Output</span>
                    <span className="font-bold text-slate-900">{m.productionTodayMeters} M</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-1.5">
                    <span className="text-[10px] text-slate-400 block">Downtime</span>
                    <span className={`font-bold ${m.downtimeHours > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {m.downtimeHours} Hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Change Button */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMachine(m);
                    setNewStatus(m.status);
                    setStatusReason(m.breakdownReason || '');
                  }}
                  className="flex-1 rounded-xl bg-slate-100 py-1.5 text-center text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Change Status
                </button>

                {isW07 && (
                  <Link
                    to="/traceability"
                    className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 shrink-0"
                  >
                    Trace
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Change Status Modal */}
      {selectedMachine && (
        <Modal
          isOpen={!!selectedMachine}
          onClose={() => setSelectedMachine(null)}
          title={`Update Status: ${selectedMachine.code} (${selectedMachine.name})`}
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">New Machine Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="RUNNING">RUNNING (🟢 Online & Processing)</option>
                <option value="IDLE">IDLE (🟡 Ready, No Order)</option>
                <option value="BREAKDOWN">BREAKDOWN (🔴 Mechanical / Sensor Failure)</option>
                <option value="MAINTENANCE">MAINTENANCE (🔵 Scheduled Servicing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Reason / Floor Log Details *
              </label>
              <textarea
                rows={3}
                required
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Weft tension sensor failure, yarn break, periodic calibration..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Will be permanently logged into the system audit trail: "Machine {selectedMachine.code} Status
                changed by Production Manager".
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setSelectedMachine(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
              >
                Apply & Write Audit Log
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
