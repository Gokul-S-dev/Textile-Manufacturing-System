import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default',
  trend,
  colorScheme = 'blue',
  onClick,
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const currentScheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900">{value}</span>
            {badge && (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${currentScheme}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 border-t border-gray-50 pt-2.5">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
