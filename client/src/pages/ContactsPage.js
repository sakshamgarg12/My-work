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
import { companyService, contactService } from '../services';

const COMPANIES_LIST_LIMIT = 500;

function contactStatusBadgeClass(status) {
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

function contactDisplayName(c) {
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

export function ContactsPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCompanyId, setAppliedCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const limit = 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCompaniesLoading(true);
      try {
        const res = await companyService.fetchCompanies({ page: 1, limit: COMPANIES_LIST_LIMIT });
        if (!cancelled && Array.isArray(res.data)) {
          setCompanies(
            [...res.data].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
          );
        }
      } catch {
        if (!cancelled) {
          setCompanies([]);
        }
      } finally {
        if (!cancelled) {
          setCompaniesLoading(false);
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
      const res = await contactService.fetchContacts({
        page,
        limit,
        ...(appliedSearch ? { search: appliedSearch } : {}),
        ...(appliedCompanyId ? { companyId: appliedCompanyId } : {}),
      });
      setRows(Array.isArray(res.data) ? res.data : []);
      setPagination(res.pagination || null);
    } catch (e) {
      setError(e.message || 'Failed to load contacts');
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, appliedCompanyId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  }

  function clearAllFilters() {
    setSearchInput('');
    setAppliedSearch('');
    setAppliedCompanyId('');
    setPage(1);
  }

  const companyOptions = useMemo(
    () => companies.map((co) => ({ value: String(co.id), label: co.name })),
    [companies]
  );

  const selectedCompanyName =
    appliedCompanyId && companies.length
      ? companies.find((co) => String(co.id) === String(appliedCompanyId))?.name
      : null;

  const totalPages = pagination?.pages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

  async function handleDelete(c) {
    const label = contactDisplayName(c);
    const ok = await confirm({
      title: 'Delete contact?',
      message: `Delete contact “${label}”? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setDeletingId(c.id);
    try {
      await contactService.removeContact(c.id);
      toast.success('Contact deleted.');
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  }

  const columns = [
    {
      id: 'contact',
      header: 'Contact',
      cellClassName: 'whitespace-nowrap font-medium text-slate-900',
      cell: (c) => contactDisplayName(c),
    },
    {
      id: 'company',
      header: 'Company',
      cellClassName: 'max-w-[10rem] truncate text-slate-700 sm:max-w-xs',
      cell: (c) => c.company?.name || '—',
    },
    {
      id: 'email',
      header: 'Email',
      cellClassName: 'max-w-[12rem] truncate text-slate-600',
      cell: (c) => c.email || '—',
    },
    {
      id: 'phone',
      header: 'Phone',
      cellClassName: 'whitespace-nowrap text-slate-600',
      cell: (c) => c.phone || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c) => (
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            contactStatusBadgeClass(c.status),
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
            to={`/contacts/${c.id}/edit`}
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
      No contacts found
      {appliedSearch || appliedCompanyId ? (
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
          <Link to="/contacts/new" className="font-medium text-blue-600 hover:underline">
            Add your first contact
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Contacts</h1>
          <p className="mt-1 text-sm text-slate-600">People linked to your companies.</p>
        </div>
        <Link
          to="/contacts/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add contact
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <CrmSearchBar
            id="contact-search"
            label="Search by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="First name, last name, full name, or email…"
            onClear={clearSearch}
            clearVisible={!!appliedSearch}
            aria-label="Search contacts by name or email"
          />
          <CrmFilterSelect
            id="contact-company-filter"
            label="Filter by company"
            value={appliedCompanyId}
            onChange={(e) => {
              setAppliedCompanyId(e.target.value);
              setPage(1);
            }}
            options={companyOptions}
            emptyLabel="All companies"
            disabled={companiesLoading}
            helperText={
              companiesLoading
                ? 'Loading companies…'
                : companies.length === 0
                  ? 'No companies yet — add a company to filter contacts.'
                  : undefined
            }
          />
        </div>

        {(appliedSearch || appliedCompanyId) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Active filters:</span>
            {appliedSearch && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Name/email: &ldquo;{appliedSearch}&rdquo;
              </span>
            )}
            {appliedCompanyId && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Company: {selectedCompanyName || `ID ${appliedCompanyId}`}
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
        loadingLabel="Loading contacts…"
        emptyState={emptyState}
        footer={paginationFooter}
      />
    </div>
  );
}
