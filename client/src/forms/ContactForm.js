import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const defaultState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  companyId: '',
  status: 'prospect',
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

function normalizePayload(values) {
  const rawCid = values.companyId;
  const companyNum =
    rawCid === '' || rawCid == null ? NaN : Number(rawCid);
  const companyId = Number.isFinite(companyNum) && companyNum > 0 ? companyNum : null;

  const out = {
    firstName: typeof values.firstName === 'string' ? values.firstName.trim() : values.firstName,
    lastName: typeof values.lastName === 'string' ? values.lastName.trim() : values.lastName,
    email: typeof values.email === 'string' ? values.email.trim() : values.email,
    status: values.status || 'prospect',
    companyId,
  };

  if (typeof values.phone === 'string') {
    const t = values.phone.trim();
    out.phone = t === '' ? null : t;
  } else {
    out.phone = values.phone ?? null;
  }

  if (typeof values.jobTitle === 'string') {
    const t = values.jobTitle.trim();
    out.jobTitle = t === '' ? null : t;
  } else {
    out.jobTitle = values.jobTitle ?? null;
  }

  if (typeof values.notes === 'string') {
    const t = values.notes.trim();
    out.notes = t === '' ? null : t;
  } else {
    out.notes = values.notes ?? null;
  }

  return out;
}

/**
 * Create or edit a contact — matches `Contact` model and Joi validation on the API.
 */
export function ContactForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isSubmitting = false,
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
    onSubmit?.(normalizePayload(values));
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Person</h3>
        <p className="mt-1 text-sm text-slate-600">Legal first and last name as they appear in Catalyst.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="contact-firstName" label="First name *">
            <input
              id="contact-firstName"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              autoComplete="given-name"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="Jane"
            />
          </Field>
          <Field id="contact-lastName" label="Last name *">
            <input
              id="contact-lastName"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              autoComplete="family-name"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="Doe"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Reach &amp; role</h3>
        <p className="mt-1 text-sm text-slate-600">How to contact them and where they work.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="contact-email" label="Email *">
            <input
              id="contact-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="jane@company.com"
            />
          </Field>
          <Field id="contact-phone" label="Phone">
            <input
              id="contact-phone"
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
          <Field id="contact-jobTitle" label="Job title" className="sm:col-span-2">
            <input
              id="contact-jobTitle"
              name="jobTitle"
              value={values.jobTitle}
              onChange={handleChange}
              maxLength={100}
              disabled={isSubmitting}
              className={`${inputClass} max-w-xl`}
              placeholder="e.g. VP Sales"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Company</h3>
        <p className="mt-1 text-sm text-slate-600">
          {companies && companies.length > 0
            ? 'Choose which company this contact belongs to.'
            : 'Link this person to an existing company (ID from the Companies list, or load the list by opening this page with companies fetched).'}
        </p>
        <div className="mt-4 max-w-md">
          {companiesLoading ? (
            <p className="text-sm text-slate-500">Loading companies…</p>
          ) : companies && companies.length > 0 ? (
            <Field id="contact-companyId" label="Company *">
              <select
                id="contact-companyId"
                name="companyId"
                value={values.companyId}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={inputClass}
              >
                <option value="">Select a company…</option>
                {companies.map((co) => (
                  <option key={co.id} value={co.id}>
                    {co.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : companies && companies.length === 0 ? (
            <p className="text-sm text-amber-800">
              No companies yet.{' '}
              <Link to="/companies/new" className="font-medium text-blue-600 hover:underline">
                Add a company first
              </Link>
              , then return here.
            </p>
          ) : (
            <Field id="contact-companyId" label="Company ID *">
              <input
                id="contact-companyId"
                name="companyId"
                type="number"
                min="1"
                step="1"
                value={values.companyId}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={inputClass}
                placeholder="e.g. 1"
              />
            </Field>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Status &amp; notes</h3>
        <p className="mt-1 text-sm text-slate-600">Pipeline state and internal context.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="contact-status" label="Status">
            <select
              id="contact-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field id="contact-notes" label="Notes">
            <textarea
              id="contact-notes"
              name="notes"
              value={values.notes}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="Context for your team…"
            />
          </Field>
          <p className="mt-1 text-xs text-slate-500">{(values.notes || '').length}/1000 characters</p>
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

/** Defaults for the add-contact flow. */
export function AddContactForm(props) {
  return <ContactForm submitLabel="Create contact" {...props} />;
}
