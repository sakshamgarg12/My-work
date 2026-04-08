import React from 'react';
import { CrmSpinner } from './CrmSpinner';

const thBase =
  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600';
const tdBase = 'px-4 py-3 text-sm';

/**
 * Reusable data table shell for Catalyst lists.
 * @param {Array<{ id: string, header: React.ReactNode, headerClassName?: string, cellClassName?: string, align?: 'left'|'right', cell: (row) => React.ReactNode }>} columns
 */
export function CrmTable({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingLabel = 'Loading…',
  emptyState,
  className = '',
  footer = null,
}) {
  const colCount = columns.length;
  const alignTh = (a) => (a === 'right' ? 'text-right' : 'text-left');
  const alignTd = (a) => (a === 'right' ? 'text-right' : 'text-left');

  return (
    <div className={['overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm', className].join(' ')}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={[thBase, alignTh(col.align), col.headerClassName || ''].filter(Boolean).join(' ')}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={colCount} className={`${tdBase} py-12 text-center text-slate-500`}>
                  <CrmSpinner size="sm" label={loadingLabel} className="justify-center" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className={`${tdBase} py-12 text-center text-slate-600`}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-slate-50/80">
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={[tdBase, alignTd(col.align), col.cellClassName || ''].filter(Boolean).join(' ')}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
