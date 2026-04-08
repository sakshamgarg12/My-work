import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CrmSpinner, useToast } from '../components';
import { LeadForm } from '../forms';
import { companyService, leadService } from '../services';

const COMPANIES_LIST_LIMIT = 500;

function mapLeadToForm(l) {
  return {
    name: l.name ?? '',
    email: l.email ?? '',
    phone: l.phone ?? '',
    source: l.source ?? 'website',
    status: l.status ?? 'new',
    companyId: l.companyId ?? '',
    assignedTo: l.assignedTo ?? '',
    notes: l.notes ?? '',
  };
}

export function EditLeadPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState(null);
  const [companiesLoading, setCompaniesLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await leadService.fetchLead(id);
        if (!cancelled && res?.data) {
          setInitial(mapLeadToForm(res.data));
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Lead not found');
          setInitial(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values) {
    try {
      setSubmitError(null);
      setSubmitting(true);
      await leadService.updateLead(id, values);
      toast.success('Lead updated.');
      navigate('/leads');
    } catch (e) {
      setSubmitError(e.message || 'Could not update lead');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/leads"
            className="mb-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 sm:mb-0"
          >
            ← Back to leads
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit lead</h1>
          <p className="mt-1 text-sm text-slate-600">Update pipeline details and assignment.</p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CrmSpinner size="sm" label="Loading lead…" />
        </p>
      )}

      {!loading && initial && (
        <>
          {submitError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </div>
          )}
          <LeadForm
            key={id}
            initialValues={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/leads')}
            isSubmitting={submitting}
            isEdit
            companies={companies}
            companiesLoading={companiesLoading}
          />
        </>
      )}
    </div>
  );
}
