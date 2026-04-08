import React from 'react';
import { CrmSpinner } from './CrmSpinner';

/**
 * Metric summary tile for dashboard grids.
 */
export function StatCard({ label, value, loading, icon, accent = 'blue' }) {
  const accents = {
    blue: 'from-blue-600 to-indigo-600 ring-blue-500/20',
    emerald: 'from-emerald-600 to-teal-600 ring-emerald-500/20',
    amber: 'from-amber-500 to-orange-600 ring-amber-500/20',
  };
  const gradient = accents[accent] || accents.blue;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm',
        'transition-shadow hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2">
              <CrmSpinner size="md" />
            </div>
          ) : (
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
          )}
        </div>
        <div
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-inner ring-2 ring-inset',
            gradient,
          ].join(' ')}
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
