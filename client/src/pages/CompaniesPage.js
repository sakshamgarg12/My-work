import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CrmFilterSelect,
  CrmListPagination,
  CrmSearchBar,
  CrmTable,
  useConfirm,
  useToast,
} from '../components';
import { companyService } from '../services';

function statusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20';
    case 'inactive':
      return 'bg-slate-100 text-slate-700 ring-slate-600/10';
    case 'prospect':
      return 'bg-amber-100 text-amber-900 ring-amber-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/10';
  }
}

export function CompaniesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nameInput, setNameInput] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [appliedIndustry, setAppliedIndustry] = useState('');
  const [industries, setIndustries] = useState([]);
  const [industriesLoading, setIndustriesLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const limit = 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIndustriesLoading(true);
      try {
        const res = await companyService.fetchCompanyIndustries();
        if (!cancelled && Array.isArray(res.data)) {
          setIndustries(res.data);
        }
      } catch {
        if (!cancelled) {
          setIndustries([]);
        }
      } finally {
        if (!cancelled) {
          setIndustriesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyService.fetchCompanies({
        page,
        limit,
        ...(appliedName ? { name: appliedName } : {}),
        ...(appliedIndustry ? { industry: appliedIndustry } : {}),
      });
      setRows(Array.isArray(res.data) ? res.data : []);
      setPagination(res.pagination || null);
    } catch (e) {
      setError(e.message || 'Failed to load companies');
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, appliedName, appliedIndustry]);

  useEffect(() => {
    load();
  }, [load]);

  function handleNameSearchSubmit(e) {
    e.preventDefault();
    setAppliedName(nameInput.trim());
    setPage(1);
  }

  function clearNameSearch() {
    setNameInput('');
    setAppliedName('');
    setPage(1);
  }

  function clearAllFilters() {
    setNameInput('');
    setAppliedName('');
    setAppliedIndustry('');
    setPage(1);
  }

  const industryOptions = useMemo(
    () => industries.map((ind) => ({ value: ind, label: ind })),
    [industries]
  );

  const totalPages = pagination?.pages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

  async function handleDelete(c) {
    const ok = await confirm({
      title: 'Delete company?',
      message: `Delete “${c.name}”? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setDeletingId(c.id);
    try {
      await companyService.removeCompany(c.id);
      toast.success('Company deleted.');
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed to delete company');
    } finally {
      setDeletingId(null);
    }
  }

  const columns = [
    {
      id: 'name',
      header: 'Name',
      cellClassName: 'whitespace-nowrap font-medium text-slate-900',
      cell: (c) => c.name,
    },
    {
      id: 'industry',
      header: 'Industry',
      cellClassName: 'text-slate-700',
      cell: (c) => c.industry || '—',
    },
    {
      id: 'location',
      header: 'Location',
      headerClassName: 'hidden md:table-cell',
      cellClassName: 'hidden max-w-[12rem] truncate md:table-cell text-slate-600',
      cell: (c) => [c.city, c.state].filter(Boolean).join(', ') || '—',
    },
    {
      id: 'email',
      header: 'Email',
      headerClassName: 'hidden lg:table-cell',
      cellClassName: 'hidden max-w-[14rem] truncate lg:table-cell text-slate-600',
      cell: (c) => c.email || '—',
    },
    {
      id: 'phone',
      header: 'Phone',
      headerClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden whitespace-nowrap sm:table-cell text-slate-600',
      cell: (c) => c.phone || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c) => (
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            statusBadgeClass(c.status),
          ].join(' ')}
        >
          {c.status || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      headerClassName: 'text-right',
      cellClassName: 'whitespace-nowrap text-right',
      cell: (c) => (
        <div className="inline-flex flex-shrink-0 items-center justify-end gap-1.5">
          <Link
            to={`/companies/${c.id}/edit`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(c)}
            disabled={deletingId === c.id}
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            {deletingId === c.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ),
    },
  ];

  const emptyState = (
    <>
      No companies found
      {appliedName || appliedIndustry ? (
        <>
          {' '}
          with your current filters.{' '}
          <button type="button" className="font-medium text-blue-600 hover:underline" onClick={clearAllFilters}>
            Clear filters
          </button>
        </>
      ) : (
        <>
          .{' '}
          <Link to="/companies/new" className="font-medium text-blue-600 hover:underline">
            Add your first company
          </Link>
        </>
      )}
    </>
  );

  const paginationFooter =
    !loading && rows.length > 0 && pagination ? (
      <CrmListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={pagination.total}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-600">All organizations in Catalyst.</p>
        </div>
        <Link
          to="/companies/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add company
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <CrmSearchBar
            id="company-name-search"
            label="Search by company name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onSubmit={handleNameSearchSubmit}
            placeholder="Type a company name…"
            onClear={clearNameSearch}
            clearVisible={!!appliedName}
          />
          <CrmFilterSelect
            id="company-industry-filter"
            label="Filter by industry"
            value={appliedIndustry}
            onChange={(e) => {
              setAppliedIndustry(e.target.value);
              setPage(1);
            }}
            options={industryOptions}
            emptyLabel="All industries"
            disabled={industriesLoading}
            helperText={
              industriesLoading
                ? 'Loading industries…'
                : industries.length === 0
                  ? 'Add a company with an industry to enable this filter.'
                  : undefined
            }
          />
        </div>

        {(appliedName || appliedIndustry) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Active filters:</span>
            {appliedName && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Name: &ldquo;{appliedName}&rdquo;
              </span>
            )}
            {appliedIndustry && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Industry: {appliedIndustry}
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <CrmTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        loading={loading}
        loadingLabel="Loading companies…"
        emptyState={emptyState}
        footer={paginationFooter}
      />
    </div>
  );
}
