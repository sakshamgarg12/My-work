import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components';
import { AddCompanyForm } from '../forms';
import { companyService } from '../services';

export function AddCompanyPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values) {
    try {
      setError(null);
      setSubmitting(true);
      await companyService.createCompany(values);
      toast.success('Company created.');
      navigate('/companies');
    } catch (e) {
      setError(e.message || 'Could not create company');
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add company</h1>
          <p className="mt-1 text-sm text-slate-600">Create a new organization in Catalyst.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <AddCompanyForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/companies')}
        isSubmitting={submitting}
      />
    </div>
  );
}
