import React from 'react';

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

/**
 * Inline loading indicator for API / async UI (Tailwind animate-spin ring).
 */
export function CrmSpinner({ size = 'md', className = '', label }) {
  const ring = sizeClass[size] || sizeClass.md;
  return (
    <span className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span
        className={`inline-block shrink-0 animate-spin rounded-full border-slate-300 border-t-blue-600 ${ring}`}
        role={label ? 'status' : 'presentation'}
        aria-hidden={label ? undefined : true}
      />
      {label ? <span className="text-sm text-slate-600">{label}</span> : null}
    </span>
  );
}
