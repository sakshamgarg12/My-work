import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const defaultState = {
  name: '',
  email: '',
  phone: '',
  source: 'website',
  status: 'new',
  companyId: '',
  assignedTo: '',
  notes: '',
};

const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50';

const labelClass = 'block text-sm font-medium text-slate-700';

function Field({ id, label, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

function mergeInitial(initialValues) {
  const merged = { ...defaultState, ...initialValues };
  if (merged.companyId != null && merged.companyId !== '') {
    merged.companyId = String(merged.companyId);
  } else {
    merged.companyId = '';
  }
  return merged;
}

function normalizePayload(values, isEdit = false) {
  const name = typeof values.name === 'string' ? values.name.trim() : values.name;
  const email = typeof values.email === 'string' ? values.email.trim() : values.email;

  let phone = null;
  if (typeof values.phone === 'string') {
    const t = values.phone.trim();
    phone = t === '' ? null : t;
  } else if (values.phone != null) {
    phone = values.phone;
  }

  let assignedTo;
  if (typeof values.assignedTo === 'string') {
    const t = values.assignedTo.trim();
    assignedTo = t === '' ? undefined : t;
  } else {
    assignedTo = values.assignedTo;
  }

  let notes = null;
  if (typeof values.notes === 'string') {
    const t = values.notes.trim();
    notes = t === '' ? null : t;
  } else if (values.notes != null) {
    notes = values.notes;
  }

  const rawCompany = values.companyId;
  const companyNum =
    rawCompany === '' || rawCompany == null ? null : Number(rawCompany);
  const companyValid = companyNum != null && !Number.isNaN(companyNum);

  const out = {
    name,
    email,
    phone,
    source: values.source || 'website',
    status: values.status || 'new',
  };

  if (isEdit) {
    out.notes = notes;
    out.companyId = companyValid ? companyNum : null;
  } else {
    if (notes != null) {
      out.notes = notes;
    }
    if (companyValid) {
      out.companyId = companyNum;
    }
  }

  if (assignedTo !== undefined && assignedTo !== null) {
    out.assignedTo = assignedTo;
  }

  return out;
}

/**
 * Create or edit a lead — matches `Lead` model and Joi validation on the API.
 */
export function LeadForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isSubmitting = false,
  isEdit = false,
  companies = null,
  companiesLoading = false,
}) {
  const [values, setValues] = useState(() => mergeInitial(initialValues));

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit?.(normalizePayload(values, isEdit));
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Lead</h3>
        <p className="mt-1 text-sm text-slate-600">Primary label for this opportunity.</p>
        <div className="mt-4 max-w-xl">
          <Field id="lead-name" label="Lead name *">
            <input
              id="lead-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="e.g. Acme expansion deal"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Contact</h3>
        <p className="mt-1 text-sm text-slate-600">How to reach this lead.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="lead-email" label="Email *">
            <input
              id="lead-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="lead@example.com"
            />
          </Field>
          <Field id="lead-phone" label="Phone">
            <input
              id="lead-phone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              inputMode="tel"
              autoComplete="tel"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="e.g. 555-123-4567"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Pipeline</h3>
        <p className="mt-1 text-sm text-slate-600">Where they came from and current stage.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="lead-source" label="Source">
            <select
              id="lead-source"
              name="source"
              value={values.source}
              onChange={handleChange}
              disabled={isSubmitting}
              className={inputClass}
            >
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="email">Email</option>
              <option value="advertisement">Advertisement</option>
              <option value="social_media">Social media</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field id="lead-status" label="Status">
            <select
              id="lead-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className={inputClass}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Company</h3>
        <p className="mt-1 text-sm text-slate-600">
          Optional — link this lead to a company for reporting and conversion.
        </p>
        <div className="mt-4 max-w-md">
          {companiesLoading ? (
            <p className="text-sm text-slate-500">Loading companies…</p>
          ) : companies && companies.length > 0 ? (
            <Field id="lead-companyId" label="Company">
              <select
                id="lead-companyId"
                name="companyId"
                value={values.companyId}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass}
              >
                <option value="">None</option>
                {companies.map((co) => (
                  <option key={co.id} value={co.id}>
                    {co.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : companies && companies.length === 0 ? (
            <p className="text-sm text-slate-600">
              No companies yet.{' '}
              <Link to="/companies/new" className="font-medium text-blue-600 hover:underline">
                Add a company
              </Link>{' '}
              if you want to link this lead.
            </p>
          ) : (
            <Field id="lead-companyId" label="Company ID">
              <input
                id="lead-companyId"
                name="companyId"
                type="number"
                min="1"
                step="1"
                value={values.companyId}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass}
                placeholder="Optional"
              />
            </Field>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Assignment &amp; notes</h3>
        <p className="mt-1 text-sm text-slate-600">Owner name and internal notes.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="lead-assignedTo" label="Assigned to">
            <input
              id="lead-assignedTo"
              name="assignedTo"
              value={values.assignedTo}
              onChange={handleChange}
              maxLength={100}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="e.g. Sales team member"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field id="lead-notes" label="Notes">
            <textarea
              id="lead-notes"
              name="notes"
              value={values.notes}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="Context, next steps, objections…"
            />
          </Field>
          <p className="mt-1 text-xs text-slate-500">{(values.notes || '').length}/2000 characters</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Defaults for the add-lead flow. */
export function AddLeadForm(props) {
  return <LeadForm submitLabel="Create lead" {...props} />;
}
