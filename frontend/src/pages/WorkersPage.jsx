import React, { useState } from 'react';
import { useWorkerStore } from '../store/useWorkerStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  Calculator,
} from 'lucide-react';

export default function WorkersPage() {
  const { workers, calculateWorkerWage, getTotalDailyWages, updateAttendance, updateWageParameters } =
    useWorkerStore();
  const { addToast } = useNotificationStore();
  const { addLog } = useAuditStore();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Edit Wage Modal
  const [editWorker, setEditWorker] = useState(null);
  const [basicWage, setBasicWage] = useState(800);
  const [hourlyOtRate, setHourlyOtRate] = useState(140);
  const [incentives, setIncentives] = useState(150);

  // Edit Attendance Modal
  const [attWorker, setAttWorker] = useState(null);
  const [attStatus, setAttStatus] = useState('PRESENT');
  const [attHours, setAttHours] = useState(8);
  const [attOvertime, setAttOvertime] = useState(1.5);

  const totalDailyPayout = getTotalDailyWages();
  const presentCount = workers.filter((w) => w.status === 'PRESENT').length;

  const handleSaveWage = (e) => {
    e.preventDefault();
    if (!editWorker) return;

    updateWageParameters(editWorker.id, basicWage, hourlyOtRate, incentives);

    addToast({
      type: 'success',
      title: 'Wage Parameters Saved',
      message: `Updated wage calculation settings for ${editWorker.name}.`,
    });

    setEditWorker(null);
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (!attWorker) return;

    updateAttendance(attWorker.id, attStatus, attHours, attOvertime);

    addToast({
      type: 'info',
      title: 'Attendance Updated',
      message: `${attWorker.name} marked ${attStatus}.`,
    });

    setAttWorker(null);
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      w.department.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || w.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Workforce Register
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            Worker & Shift Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Shift attendance register, loom operator assignments, and automated wage calculation formula.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Total Workforce</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{workers.length} Operators</p>
          <p className="text-xs text-slate-400 mt-0.5">Spinning, Weaving, QA</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Shift A Attendance</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {presentCount} / {workers.length}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{workers.length - presentCount} Absent today</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Total Overtime</span>
          <p className="text-3xl font-black text-[#00acc1] mt-1">
            {workers.reduce((acc, w) => acc + (Number(w.overtimeHours) || 0), 0)} Hours
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Logged on high-speed runs</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100/80">
          <span className="text-[11px] font-black uppercase text-slate-400">Daily Mill Wages</span>
          <p className="text-3xl font-black text-purple-700 mt-1">
            ₹{totalDailyPayout.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Basic + OT + Incentives</p>
        </div>
      </div>

      {/* Formula Pill Banner */}
      <div className="rounded-3xl bg-cyan-50/70 border border-cyan-200/80 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00bcd4] text-white">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Automated Wage Calculation
            </h4>
            <p className="text-xs text-[#0097a7] font-mono mt-0.5 font-bold">
              Total Wage = Basic Wage + (Overtime Hours × OT Rate) + Incentives
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search operator (O-15), role, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Weaving', 'Spinning', 'Dyeing', 'Quality Control'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  departmentFilter === dept
                    ? 'bg-[#00bcd4] text-white shadow-cyan-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept === 'ALL' ? 'All' : dept}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Operator & ID</th>
                <th className="px-5 py-3.5">Department & Machine</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Hours & OT</th>
                <th className="px-5 py-3.5">Basic</th>
                <th className="px-5 py-3.5">OT Pay</th>
                <th className="px-5 py-3.5">Incentives</th>
                <th className="px-5 py-3.5 font-bold text-slate-900">Total Wage</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((w) => {
                const isO15 = w.code === 'O-15';
                const totalWage = calculateWorkerWage(w);
                const otPay = (Number(w.overtimeHours) || 0) * (Number(w.hourlyOtRate) || 0);

                return (
                  <tr
                    key={w.id}
                    className={`hover:bg-slate-50/75 transition-colors ${
                      isO15 ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{w.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                          {w.code}
                        </span>
                        {isO15 && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                            W-07 Operator
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{w.role}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{w.department}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{w.assignedMachine}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          w.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {w.workingHours}h (+{w.overtimeHours}h OT)
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">₹{w.basicWage}</td>
                    <td className="px-5 py-4 font-semibold text-[#00acc1]">₹{otPay}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">₹{w.incentives}</td>
                    <td className="px-5 py-4 text-sm font-black text-slate-900">
                      ₹{totalWage.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAttWorker(w);
                            setAttStatus(w.status);
                            setAttHours(w.workingHours);
                            setAttOvertime(w.overtimeHours);
                          }}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => {
                            setEditWorker(w);
                            setBasicWage(w.basicWage);
                            setHourlyOtRate(w.hourlyOtRate);
                            setIncentives(w.incentives);
                          }}
                          className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-[#00acc1] hover:bg-cyan-100"
                        >
                          Wage Scale
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal */}
      {attWorker && (
        <Modal
          isOpen={!!attWorker}
          onClose={() => setAttWorker(null)}
          title={`Mark Attendance: ${attWorker.name} (${attWorker.code})`}
        >
          <form onSubmit={handleSaveAttendance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Shift Status</label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              >
                <option value="PRESENT">PRESENT (Shift A)</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>

            {attStatus === 'PRESENT' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Hours Worked</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={attHours}
                    onChange={(e) => setAttHours(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Overtime Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="8"
                    value={attOvertime}
                    onChange={(e) => setAttOvertime(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setAttWorker(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Save Attendance
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Wage Scale Modal */}
      {editWorker && (
        <Modal
          isOpen={!!editWorker}
          onClose={() => setEditWorker(null)}
          title={`Wage Parameters: ${editWorker.name} (${editWorker.role})`}
        >
          <form onSubmit={handleSaveWage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Basic Daily Wage (₹)</label>
              <input
                type="number"
                required
                value={basicWage}
                onChange={(e) => setBasicWage(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Hourly Overtime Rate (₹/hr)</label>
              <input
                type="number"
                required
                value={hourlyOtRate}
                onChange={(e) => setHourlyOtRate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Incentives (₹)</label>
              <input
                type="number"
                required
                value={incentives}
                onChange={(e) => setIncentives(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#00bcd4] focus:outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditWorker(null)}
                className="rounded-full border px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2 text-xs font-extrabold text-white shadow"
              >
                Update Scale
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}


