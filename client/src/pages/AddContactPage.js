import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components';
import { AddContactForm } from '../forms';
import { companyService, contactService } from '../services';

const COMPANIES_LIST_LIMIT = 500;

export function AddContactPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
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

  async function handleSubmit(values) {
    try {
      setError(null);
      setSubmitting(true);
      await contactService.createContact(values);
      toast.success('Contact created.');
      navigate('/contacts');
    } catch (e) {
      setError(e.message || 'Could not create contact');
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add contact</h1>
          <p className="mt-1 text-sm text-slate-600">Create a person and tie them to a company.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <AddContactForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/contacts')}
        isSubmitting={submitting}
        companies={companies}
        companiesLoading={companiesLoading}
      />
    </div>
  );
}
