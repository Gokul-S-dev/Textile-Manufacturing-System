import React, { useState } from 'react';
import { useAuditStore } from '../store/useAuditStore';
import { History, Search, ShieldCheck } from 'lucide-react';

export default function AuditLogPage() {
  const { logs } = useAuditStore();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === 'ALL' || l.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              Security & Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            System Auditability & Action Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Immutable log recording Who changed, What changed, and When changed across Everest Textile Mills.
          </p>
        </div>
      </div>

      {/* Audit Banner */}
      <div className="rounded-3xl bg-cyan-50/70 border border-cyan-200/80 p-5 shadow-sm flex items-start gap-3.5">
        <ShieldCheck className="h-5 w-5 text-[#00bcd4] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <span className="font-bold text-slate-900">Auditability & Security Compliance</span>
          <p className="mt-0.5 leading-relaxed">
            Every critical floor action (Machine status change, defect rejection, yarn receipt, or blocked dispatch) is logged with operator identity and exact timestamp.
          </p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, machine, or roll ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 focus:border-[#00bcd4] focus:outline-none shadow-xs"
          >
            <option value="ALL">All Event Types</option>
            <option value="MACHINE_STATUS_CHANGE">Machine Status Changes</option>
            <option value="QUALITY_INSPECTION">Quality Inspections</option>
            <option value="DISPATCH_BLOCKED">Dispatch Blocked Events</option>
            <option value="INVENTORY_RECEIPT">Inventory Receipts</option>
            <option value="ORDER_ASSIGNMENT">Order Assignments</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Log ID & Time</th>
                <th className="px-5 py-3.5">Operator & Role</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5">Audit Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isRed = log.badgeColor === 'red';
                const isGreen = log.badgeColor === 'green';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <span className="font-extrabold text-slate-900">{log.id}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-[#00acc1] font-bold mt-0.5">{log.userRole}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          isRed
                            ? 'bg-rose-100 text-rose-800'
                            : isGreen
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-cyan-100 text-[#00acc1]'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800">
                      {log.target}
                    </td>

                    <td className="px-5 py-4 text-slate-600 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


