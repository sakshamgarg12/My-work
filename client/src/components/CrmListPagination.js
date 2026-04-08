import React from 'react';

export function CrmListPagination({
  currentPage,
  totalPages,
  total,
  onPrevious,
  onNext,
  className = '',
}) {
  if (totalPages <= 1 && total == null) return null;

  return (
    <div
      className={[
        'flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-sm text-slate-600">
        Page <span className="font-medium text-slate-900">{currentPage}</span> of{' '}
        <span className="font-medium text-slate-900">{totalPages}</span>
        {total != null && (
          <>
            {' '}
            (<span className="font-medium text-slate-900">{total}</span> total)
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={onPrevious}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={onNext}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
