import React from 'react';

const selectClass =
  'w-full max-w-md rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50';

/**
 * Single-select filter dropdown for Catalyst list pages.
 * `options`: [{ value: string, label: string }]
 */
export function CrmFilterSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  emptyLabel = 'All',
  disabled = false,
  helperText,
  className = '',
  selectClassName = '',
}) {
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[selectClass, selectClassName].filter(Boolean).join(' ')}
      >
        <option value="">{emptyLabel}</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="mt-1.5 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
