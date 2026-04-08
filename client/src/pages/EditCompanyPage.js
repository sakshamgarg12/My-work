import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CrmSpinner, useToast } from '../components';
import { CompanyForm } from '../forms';
import { companyService } from '../services';

function mapCompanyToForm(c) {
  return {
    name: c.name ?? '',
    industry: c.industry ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    website: c.website ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    state: c.state ?? '',
    zipCode: c.zipCode ?? '',
    country: c.country ?? '',
    description: c.description ?? '',
    status: c.status ?? 'prospect',
  };
}

export function EditCompanyPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await companyService.fetchCompany(id);
        if (!cancelled && res.data) {
          setInitial(mapCompanyToForm(res.data));
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e.message || 'Company not found');
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
      await companyService.updateCompany(id, values);
      toast.success('Company updated.');
      navigate('/companies');
    } catch (e) {
      setSubmitError(e.message || 'Could not update company');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/companies"
            className="mb-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800 sm:mb-0"
          >
            ← Back to companies
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit company</h1>
          <p className="mt-1 text-sm text-slate-600">Update organization details.</p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CrmSpinner size="sm" label="Loading company…" />
        </p>
      )}

      {!loading && initial && (
        <>
          {submitError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </div>
          )}
          <CompanyForm
            key={id}
            initialValues={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/companies')}
            isSubmitting={submitting}
          />
        </>
      )}
    </div>
  );
}
