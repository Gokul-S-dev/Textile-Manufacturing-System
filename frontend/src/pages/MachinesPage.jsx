import React, { useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useNotificationStore } from '../store/useNotificationStore';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Cog,
  AlertTriangle,
  Search,
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
  const [search, setSearch] = useState('');

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
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Floor Fleet Status
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            20-Machine Floor Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time status, output meters, and breakdown telemetry for Spinning, Weaving, and Dyeing units.
          </p>
        </div>

        <Link
          to="/traceability"
          className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <GitBranch className="h-4 w-4" />
          <span>Trace Loom W-07 Defect</span>
        </Link>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 text-center">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Fleet</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{total} Units</p>
        </div>

        <div className="rounded-3xl bg-emerald-50/70 p-4 border border-emerald-100 text-center">
          <span className="text-[10px] font-black uppercase text-emerald-700">🟢 Running</span>
          <p className="text-xl font-black text-emerald-900 mt-0.5">{running}</p>
        </div>

        <div className="rounded-3xl bg-amber-50/70 p-4 border border-amber-100 text-center">
          <span className="text-[10px] font-black uppercase text-amber-700">🟡 Idle</span>
          <p className="text-xl font-black text-amber-900 mt-0.5">{idle}</p>
        </div>

        <div className="rounded-3xl bg-rose-50/70 p-4 border border-rose-100 text-center">
          <span className="text-[10px] font-black uppercase text-rose-700">🔴 Breakdown</span>
          <p className="text-xl font-black text-rose-900 mt-0.5">{breakdown}</p>
        </div>

        <div className="rounded-3xl bg-sky-50/70 p-4 border border-sky-100 text-center">
          <span className="text-[10px] font-black uppercase text-sky-700">🔵 Maintenance</span>
          <p className="text-xl font-black text-sky-900 mt-0.5">{maintenance}</p>
        </div>

        <div className="rounded-3xl bg-cyan-50/70 p-4 border border-cyan-100 text-center">
          <span className="text-[10px] font-black uppercase text-[#00acc1]">Today Output</span>
          <p className="text-xl font-black text-[#0097a7] mt-0.5">{totalMetersToday.toLocaleString()} M</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                filterStatus === tab.key
                  ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Machine (W-07), type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* 20 Machine Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMachines.map((m) => {
          const isW07 = m.code === 'W-07';

          return (
            <div
              key={m.id}
              className={`rounded-3xl bg-white border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isW07 ? 'border-rose-200 ring-2 ring-rose-200/50 bg-rose-50/15' : 'border-slate-100/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 font-black text-sm text-[#00acc1]">
                      {m.code}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{m.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.type} • {m.location}</p>
                    </div>
                  </div>
                  <Badge status={m.status} />
                </div>

                {isW07 && (
                  <div className="mt-3 rounded-2xl bg-rose-100/70 p-2.5 text-[11px] text-rose-950 border border-rose-200">
                    <div className="font-bold flex items-center gap-1 text-rose-900">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Reviewer Traceability Focus</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-rose-800 leading-relaxed">
                      Produced defective roll <strong>R-102</strong> under Operator <strong>O-15</strong>.
                    </p>
                  </div>
                )}

                <div className="mt-3.5 space-y-1.5 rounded-2xl bg-slate-50/60 p-3 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Current Job:</span>
                    <span className="font-extrabold text-slate-800 truncate max-w-[140px]">{m.currentOrder}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Operator:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">{m.currentWorker}</span>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 text-center text-xs border-t border-slate-100 pt-3">
                  <div className="rounded-xl bg-slate-50/80 p-2">
                    <span className="text-[10px] text-slate-400 block">Today Output</span>
                    <span className="font-black text-slate-900">{m.productionTodayMeters} M</span>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 p-2">
                    <span className="text-[10px] text-slate-400 block">Downtime</span>
                    <span className={`font-black ${m.downtimeHours > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {m.downtimeHours} Hrs
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMachine(m);
                    setNewStatus(m.status);
                    setStatusReason(m.breakdownReason || '');
                  }}
                  className="flex-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-[#00acc1] py-2 text-center text-xs font-bold text-slate-700 transition-colors"
                >
                  Change Status
                </button>

                {isW07 && (
                  <Link
                    to="/traceability"
                    className="rounded-full bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100 shrink-0"
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
              <label className="block text-xs font-bold text-slate-700">New Machine Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="RUNNING">RUNNING (🟢 Online & Processing)</option>
                <option value="IDLE">IDLE (🟡 Ready, No Order)</option>
                <option value="BREAKDOWN">BREAKDOWN (🔴 Mechanical / Sensor Failure)</option>
                <option value="MAINTENANCE">MAINTENANCE (🔵 Scheduled Servicing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Reason / Floor Details *</label>
              <textarea
                rows={3}
                required
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Weft insertion sensor fault, yarn break..."
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Will be permanently logged into the system audit trail.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setSelectedMachine(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
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
