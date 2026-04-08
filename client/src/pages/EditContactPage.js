import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CrmSpinner, useToast } from '../components';
import { ContactForm } from '../forms';
import { companyService, contactService } from '../services';

const COMPANIES_LIST_LIMIT = 500;

function mapContactToForm(c) {
  return {
    firstName: c.firstName ?? '',
    lastName: c.lastName ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    jobTitle: c.jobTitle ?? '',
    companyId: c.companyId ?? '',
    status: c.status ?? 'prospect',
    notes: c.notes ?? '',
  };
}

export function EditContactPage() {
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
        const res = await contactService.fetchContact(id);
        if (!cancelled && res.data) {
          setInitial(mapContactToForm(res.data));
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Contact not found');
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
      await contactService.updateContact(id, values);
      toast.success('Contact updated.');
      navigate('/contacts');
    } catch (e) {
      setSubmitError(e.message || 'Could not update contact');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/contacts"
            className="mb-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 sm:mb-0"
          >
            ← Back to contacts
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit contact</h1>
          <p className="mt-1 text-sm text-slate-600">Update person details and company link.</p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CrmSpinner size="sm" label="Loading contact…" />
        </p>
      )}

      {!loading && initial && (
        <>
          {submitError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </div>
          )}
          <ContactForm
            key={id}
            initialValues={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/contacts')}
            isSubmitting={submitting}
            companies={companies}
            companiesLoading={companiesLoading}
          />
        </>
      )}
    </div>
  );
}
