import React from 'react';

const BADGE_STYLES = {
  // Machine & Statuses
  RUNNING: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  IDLE: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  BREAKDOWN: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-bold animate-pulse',
  MAINTENANCE: 'bg-sky-50 text-sky-700 border border-sky-200/60',

  // Quality results
  PASS: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold',
  REWORK: 'bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold',
  REJECT: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-bold',
  'PENDING INSPECTION': 'bg-purple-50 text-purple-700 border border-purple-200/60',

  // Order & Dispatch statuses
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  IN_PRODUCTION: 'bg-cyan-50 text-[#00acc1] border border-cyan-200/60 font-semibold',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold',
  READY_FOR_DISPATCH: 'bg-teal-50 text-teal-700 border border-teal-200/60',
  DISPATCHED: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  BLOCKED_DEFECTIVE: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-bold',

  // Priorities
  URGENT: 'bg-rose-500 text-white font-extrabold shadow-xs',
  HIGH: 'bg-amber-500 text-white font-bold shadow-xs',
  MEDIUM: 'bg-cyan-100 text-[#0097a7] font-semibold',
  LOW: 'bg-slate-100 text-slate-600',

  default: 'bg-slate-100 text-slate-600',
};

export default function Badge({ status, text, size = 'sm', className = '' }) {
  const style = BADGE_STYLES[status] || BADGE_STYLES.default;
  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full capitalize leading-none tracking-wide ${style} ${sizeClasses} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {text || status}
    </span>
  );
}
