import React, { useState } from 'react';
import { useWorkerStore } from '../store/useWorkerStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuditStore } from '../store/useAuditStore';
import Modal from '../components/Modal';
import {
  Users,
  Clock,
  Coins,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserCheck,
  Calculator,
  Calendar,
  Building,
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

    addLog({
      userName: 'HR / Floor Supervisor',
      userRole: 'PRODUCTION_MANAGER',
      action: 'ATTENDANCE_LOG',
      target: `${attWorker.name} (${attWorker.code})`,
      details: `Shift marked ${attStatus}. Working hours: ${attHours}h, Overtime: ${attOvertime}h.`,
      badgeColor: attStatus === 'PRESENT' ? 'green' : 'red',
    });

    addToast({
      type: 'info',
      title: 'Attendance Updated',
      message: `${attWorker.name} marked ${attStatus}. Wage recalculated automatically.`,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Worker & Shift Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily attendance registers, machine allocations, and automated wage calculations: Basic + OT + Incentives.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Workforce</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{workers.length} Operators</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Spinning, Weaving, Dyeing, QA</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Shift A Attendance</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {presentCount} / {workers.length} Present
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{workers.length - presentCount} Absent today</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Overtime Logged</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {workers.reduce((acc, w) => acc + (Number(w.overtimeHours) || 0), 0)} Hours
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">High-speed export order push</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Daily Mill Wage Payout</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            ₹{totalDailyPayout.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Computed by wage formula</p>
        </div>
      </div>

      {/* Formula Explainer Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase text-blue-900 tracking-wider">
                Automated Wage Formula
              </h4>
              <p className="text-xs text-blue-800 font-mono mt-0.5">
                Total Wage = Basic Wage + (Overtime Hours × OT Rate) + Incentives
              </p>
            </div>
          </div>
          <span className="rounded bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            Compliant with Mill Labor Register
          </span>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search worker name, operator ID (O-15), role, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Weaving', 'Spinning', 'Dyeing', 'Quality Control'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                departmentFilter === dept
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Roster & Wage Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Operator & ID</th>
                <th className="px-5 py-3.5">Department & Machine</th>
                <th className="px-5 py-3.5">Attendance Status</th>
                <th className="px-5 py-3.5">Hours & OT</th>
                <th className="px-5 py-3.5">Basic Wage</th>
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
                      isO15 ? 'bg-amber-50/25' : ''
                    }`}
                  >
                    {/* Operator Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{w.name}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                          {w.code}
                        </span>
                        {isO15 && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                            W-07 Operator
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{w.role}</div>
                    </td>

                    {/* Department & Machine */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{w.department}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {w.assignedMachine || 'Floor Pool'}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          w.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            w.status === 'PRESENT' ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        {w.status}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{w.workingHours} hrs</div>
                      <div className="text-[10px] text-blue-600 font-medium">
                        +{w.overtimeHours} hrs OT
                      </div>
                    </td>

                    {/* Basic */}
                    <td className="px-5 py-4 font-medium text-slate-700">
                      ₹{w.basicWage}
                    </td>

                    {/* OT Pay */}
                    <td className="px-5 py-4 font-medium text-blue-700">
                      ₹{otPay}
                    </td>

                    {/* Incentives */}
                    <td className="px-5 py-4 font-medium text-emerald-700">
                      ₹{w.incentives}
                    </td>

                    {/* Total Wage */}
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                      ₹{totalWage.toLocaleString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAttWorker(w);
                            setAttStatus(w.status);
                            setAttHours(w.workingHours);
                            setAttOvertime(w.overtimeHours);
                          }}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
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
                          className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Wage Calc
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
              <label className="block text-xs font-semibold text-slate-700">Shift Status</label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="PRESENT">PRESENT (Shift A - 06:00 to 14:00)</option>
                <option value="ABSENT">ABSENT (No show / On Leave)</option>
              </select>
            </div>

            {attStatus === 'PRESENT' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Regular Hours Worked</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={attHours}
                    onChange={(e) => setAttHours(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Overtime Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="8"
                    value={attOvertime}
                    onChange={(e) => setAttOvertime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setAttWorker(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
              >
                Save Attendance Register
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Wage Calculation Modal */}
      {editWorker && (
        <Modal
          isOpen={!!editWorker}
          onClose={() => setEditWorker(null)}
          title={`Wage Parameters: ${editWorker.name} (${editWorker.role})`}
        >
          <form onSubmit={handleSaveWage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Basic Daily Wage (₹)</label>
              <input
                type="number"
                required
                value={basicWage}
                onChange={(e) => setBasicWage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Hourly Overtime Rate (₹/hr)</label>
              <input
                type="number"
                required
                value={hourlyOtRate}
                onChange={(e) => setHourlyOtRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Production Incentives / Bonus (₹)</label>
              <input
                type="number"
                required
                value={incentives}
                onChange={(e) => setIncentives(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Calculated Daily Wage</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ₹{(Number(basicWage) + Number(editWorker.overtimeHours * hourlyOtRate) + Number(incentives)).toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                = ₹{basicWage} (Basic) + ₹{editWorker.overtimeHours * hourlyOtRate} (OT) + ₹{incentives} (Incentive)
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditWorker(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow"
              >
                Update Wage Scale
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
