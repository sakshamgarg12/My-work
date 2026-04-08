import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CrmFilterSelect,
  CrmListPagination,
  CrmSearchBar,
  CrmTable,
  useConfirm,
  useToast,
} from '../components';
import { leadService } from '../services';

const LEAD_SEARCH_DEBOUNCE_MS = 400;

function leadStatusBadgeClass(status) {
  switch (status) {
    case 'new':
      return 'bg-sky-100 text-sky-900 ring-sky-600/20';
    case 'contacted':
      return 'bg-violet-100 text-violet-900 ring-violet-600/20';
    case 'qualified':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20';
    case 'converted':
      return 'bg-green-100 text-green-900 ring-green-600/20';
    case 'lost':
      return 'bg-red-100 text-red-800 ring-red-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/10';
  }
}

function formatSource(source) {
  if (!source) return '—';
  const map = {
    website: 'Website',
    referral: 'Referral',
    email: 'Email',
    advertisement: 'Advertisement',
    social_media: 'Social media',
    other: 'Other',
  };
  return map[source] || source;
}

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

function leadStatusFilterLabel(value) {
  return LEAD_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function leadNameHasFirstAndLast(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2;
}

function canConvertLeadToContact(lead) {
  if (!lead || lead.status === 'converted') return false;
  if (!lead.companyId) return false;
  return leadNameHasFirstAndLast(lead.name);
}

function convertLeadDisabledReason(lead) {
  if (!lead) return '';
  if (lead.status === 'converted') return 'This lead is already converted';
  if (!lead.companyId) return 'Assign a company before converting';
  if (!leadNameHasFirstAndLast(lead.name)) {
    return 'Name must include first and last name (e.g. Jane Doe)';
  }
  return '';
}

export function LeadsPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  const limit = 3;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadService.fetchLeads({
        page,
        limit,
        ...(appliedSearch ? { search: appliedSearch } : {}),
        ...(appliedStatus ? { status: appliedStatus } : {}),
      });
      setRows(Array.isArray(res.data) ? res.data : []);
      setPagination(res.pagination || null);
    } catch (e) {
      setError(e.message || 'Failed to load leads');
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, appliedStatus]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim();
      setAppliedSearch((prev) => {
        if (prev !== next) {
          setPage(1);
        }
        return next;
      });
    }, LEAD_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const next = searchInput.trim();
    setAppliedSearch(next);
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
    setAppliedStatus('');
    setPage(1);
  }

  async function handleConvert(lead) {
    if (!canConvertLeadToContact(lead)) return;
    const label = lead.name?.trim() || lead.email || 'this lead';
    const ok = await confirm({
      title: 'Convert lead to contact?',
      message: `Convert “${label}” to a contact? A contact will be created with this lead’s name, email, phone, and company. The lead will be marked as converted.`,
      confirmLabel: 'Convert',
      cancelLabel: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;

    setConvertingId(lead.id);
    try {
      const res = await leadService.convertLeadToContact(lead.id);
      toast.success(
        typeof res?.message === 'string' ? res.message : 'Lead converted to contact successfully.'
      );
      await load();
    } catch (e) {
      toast.error(e.message || 'Could not convert lead');
    } finally {
      setConvertingId(null);
    }
  }

  async function handleDelete(lead) {
    const label = lead.name?.trim() || lead.email || 'this lead';
    const ok = await confirm({
      title: 'Delete lead?',
      message: `Delete lead “${label}”? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setDeletingId(lead.id);
    try {
      await leadService.removeLead(lead.id);
      toast.success('Lead deleted.');
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = pagination?.pages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

  const columns = [
    {
      id: 'name',
      header: 'Lead name',
      cellClassName: 'whitespace-nowrap font-medium text-slate-900',
      cell: (lead) => lead.name || '—',
    },
    {
      id: 'company',
      header: 'Company',
      cellClassName: 'max-w-[10rem] truncate text-slate-700 sm:max-w-xs',
      cell: (lead) => lead.company?.name || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (lead) => (
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            leadStatusBadgeClass(lead.status),
          ].join(' ')}
        >
          {lead.status || '—'}
        </span>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      cellClassName: 'whitespace-nowrap text-slate-700',
      cell: (lead) => formatSource(lead.source),
    },
    {
      id: 'assigned',
      header: 'Assigned',
      cellClassName: 'max-w-[12rem] truncate text-slate-600',
      cell: (lead) =>
        typeof lead.assignedTo === 'string' && lead.assignedTo.trim() ? lead.assignedTo : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      headerClassName: 'text-right',
      cellClassName: 'whitespace-nowrap text-right',
      cell: (lead) => (
        <div className="inline-flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
          <Link
            to={`/leads/${lead.id}/edit`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => handleConvert(lead)}
            disabled={
              !canConvertLeadToContact(lead) || convertingId === lead.id || deletingId === lead.id
            }
            title={
              canConvertLeadToContact(lead)
                ? 'Create a contact from this lead'
                : convertLeadDisabledReason(lead)
            }
            className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {convertingId === lead.id ? 'Converting…' : 'Convert'}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(lead)}
            disabled={deletingId === lead.id || convertingId === lead.id}
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            {deletingId === lead.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ),
    },
  ];

  const emptyState = (
    <>
      No leads found
      {appliedSearch || appliedStatus ? (
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
          <Link to="/leads/new" className="font-medium text-blue-600 hover:underline">
            Add your first lead
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-600">Pipeline opportunities and assignments.</p>
        </div>
        <Link
          to="/leads/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add lead
        </Link>
      </div>

      <div
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        aria-label="Search and filter leads"
      >
        <CrmSearchBar
          id="lead-search"
          label="Search by name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSubmit={handleSearchSubmit}
          placeholder="Type a lead name or email…"
          showSubmitButton={false}
          onClear={clearSearch}
          clearLabel="Clear search"
          clearVisible={!!(searchInput.trim() || appliedSearch)}
          aria-label="Search leads by name or email"
        />
        <p className="mt-2 text-xs text-slate-500">Results update as you type. Press Enter to search immediately.</p>

        <div className="mt-6 min-w-0 border-t border-slate-100 pt-6">
          <CrmFilterSelect
            id="lead-status-filter"
            label="Filter by status"
            value={appliedStatus}
            onChange={(e) => {
              setAppliedStatus(e.target.value);
              setPage(1);
            }}
            options={LEAD_STATUS_OPTIONS}
            emptyLabel="All statuses"
          />
        </div>

        {(appliedSearch || appliedStatus) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Active filters:</span>
            {appliedSearch && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Name/email: &ldquo;{appliedSearch}&rdquo;
              </span>
            )}
            {appliedStatus && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Status: {leadStatusFilterLabel(appliedStatus)}
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
        rowKey={(lead) => lead.id}
        loading={loading}
        loadingLabel="Loading leads…"
        emptyState={emptyState}
        footer={paginationFooter}
      />
    </div>
  );
}
