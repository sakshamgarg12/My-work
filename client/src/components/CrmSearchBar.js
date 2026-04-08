import React from 'react';

const searchIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

/**
 * Catalyst list search field with icon; optional submit + clear (controlled).
 */
export function CrmSearchBar({
  id,
  label,
  value,
  onChange,
  onSubmit,
  placeholder = 'Search…',
  formClassName = '',
  showSubmitButton = true,
  submitLabel = 'Search',
  showClear = true,
  clearLabel = 'Clear',
  onClear,
  clearVisible,
  disabled = false,
  inputClassName = '',
  maxWidthClass = '',
  'aria-label': ariaLabel,
}) {
  const showClearBtn =
    showClear &&
    onClear &&
    (clearVisible !== undefined ? clearVisible : String(value || '').trim() !== '');

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label={ariaLabel || label || 'Search'}
      className={['min-w-0', formClassName].filter(Boolean).join(' ')}
    >
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className={['relative min-w-0 flex-1', maxWidthClass].filter(Boolean).join(' ')}>
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
            aria-hidden
          >
            {searchIcon}
          </span>
          <input
            id={id}
            type="search"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete="off"
            disabled={disabled}
            className={[inputClass, inputClassName].filter(Boolean).join(' ')}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          {showSubmitButton && onSubmit ? (
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 sm:flex-none"
            >
              {submitLabel}
            </button>
          ) : null}
          {showClearBtn ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {clearLabel}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
