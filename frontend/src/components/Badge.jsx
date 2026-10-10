import React from 'react';

const BADGE_STYLES = {
  // Machine & Statuses
  RUNNING: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  IDLE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  BREAKDOWN: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse',
  MAINTENANCE: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20',

  // Quality results
  PASS: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REWORK: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  REJECT: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  'PENDING INSPECTION': 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',

  // Order & Dispatch statuses
  PENDING: 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
  IN_PRODUCTION: 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
  COMPLETED: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
  READY_FOR_DISPATCH: 'bg-teal-500/15 text-teal-600 border border-teal-500/20',
  DISPATCHED: 'bg-purple-500/15 text-purple-600 border border-purple-500/20',
  BLOCKED_DEFECTIVE: 'bg-rose-500/15 text-rose-600 border border-rose-500/20',

  // Priorities
  URGENT: 'bg-rose-600 text-white font-semibold',
  HIGH: 'bg-orange-500 text-white font-medium',
  MEDIUM: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',

  // Generic
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function Badge({ status, text, size = 'sm', className = '' }) {
  const style = BADGE_STYLES[status] || BADGE_STYLES.default;
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full capitalize leading-none tracking-wide ${style} ${sizeClasses} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {text || status}
    </span>
  );
}
