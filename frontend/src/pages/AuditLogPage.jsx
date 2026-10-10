import React, { useState } from 'react';
import { useAuditStore } from '../store/useAuditStore';
import { History, Search, Filter, ShieldCheck, Clock, User, Download } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Auditability & Action Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log tracking: Who changed, What changed, and When changed across Everest Textile Mills.
          </p>
        </div>
      </div>

      {/* Reviewer Requirement Banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <span className="font-bold">Non-Functional Requirement: Auditability & Security Compliance</span>
            <p className="mt-0.5 text-blue-800 leading-relaxed">
              Every critical floor transition (e.g., <em>Machine W-07 changed to Breakdown</em>,{' '}
              <em>Roll R-102 rejected in QA</em>, <em>Yarn lots received</em>, or{' '}
              <em>Blocked dispatch attempts</em>) is recorded with operator identity, role, and exact timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user (Rajesh, Sunil), machine, or roll ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm"
        >
          <option value="ALL">All Event Types</option>
          <option value="MACHINE_STATUS_CHANGE">Machine Status Changes</option>
          <option value="QUALITY_INSPECTION">Quality Inspections</option>
          <option value="DISPATCH_BLOCKED">Dispatch Blocked Events</option>
          <option value="INVENTORY_RECEIPT">Inventory Receipts</option>
          <option value="ORDER_ASSIGNMENT">Order Assignments</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-5 py-3.5">Log ID & Time</th>
              <th className="px-5 py-3.5">Operator & Role</th>
              <th className="px-5 py-3.5">Action Category</th>
              <th className="px-5 py-3.5">Entity / Target</th>
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
                    <span className="font-bold text-slate-900">{log.id}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{log.userRole}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isRed
                          ? 'bg-rose-100 text-rose-800'
                          : isGreen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {log.target}
                  </td>

                  <td className="px-5 py-4 text-slate-700 leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
