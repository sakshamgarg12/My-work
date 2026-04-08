import React, { useState } from 'react';

const defaultState = {
  name: '',
  industry: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  description: '',
  status: 'prospect',
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

function normalizePayload(values) {
  const out = { ...values };
  const optionalStrings = [
    'industry',
    'email',
    'phone',
    'website',
    'address',
    'city',
    'state',
    'zipCode',
    'country',
    'description',
  ];
  for (const key of optionalStrings) {
    if (typeof out[key] === 'string') {
      const t = out[key].trim();
      out[key] = t === '' ? null : t;
    }
  }
  if (typeof out.name === 'string') {
    out.name = out.name.trim();
  }
  return out;
}

/**
 * Create or edit a company — fields match the `Company` model and API validation.
 */
export function CompanyForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isSubmitting = false,
}) {
  const [values, setValues] = useState({ ...defaultState, ...initialValues });

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
        <h3 className="text-base font-semibold text-slate-900">Company details</h3>
        <p className="mt-1 text-sm text-slate-600">Legal name and classification.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="company-name" label="Company name *">
            <input
              id="company-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              maxLength={100}
              autoComplete="organization"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="e.g. Acme Corporation"
            />
          </Field>
          <Field id="company-industry" label="Industry">
            <input
              id="company-industry"
              name="industry"
              value={values.industry}
              onChange={handleChange}
              maxLength={50}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="e.g. Software"
            />
          </Field>
          <Field id="company-status" label="Status">
            <select
              id="company-status"
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Contact &amp; web</h3>
        <p className="mt-1 text-sm text-slate-600">How you reach this company online.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="company-email" label="Email">
            <input
              id="company-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClass}
              placeholder="contact@company.com"
            />
          </Field>
          <Field id="company-phone" label="Phone">
            <input
              id="company-phone"
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
          <Field id="company-website" label="Website" className="sm:col-span-2">
            <input
              id="company-website"
              name="website"
              type="url"
              value={values.website}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`${inputClass} max-w-xl`}
              placeholder="https://example.com"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Address</h3>
        <p className="mt-1 text-sm text-slate-600">Head office or primary location.</p>
        <div className="mt-4 grid gap-4">
          <Field id="company-address" label="Street address">
            <input
              id="company-address"
              name="address"
              value={values.address}
              onChange={handleChange}
              maxLength={255}
              disabled={isSubmitting}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="company-city" label="City">
              <input
                id="company-city"
                name="city"
                value={values.city}
                onChange={handleChange}
                maxLength={50}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
            <Field id="company-state" label="State / region">
              <input
                id="company-state"
                name="state"
                value={values.state}
                onChange={handleChange}
                maxLength={50}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
            <Field id="company-zipCode" label="ZIP / postal">
              <input
                id="company-zipCode"
                name="zipCode"
                value={values.zipCode}
                onChange={handleChange}
                maxLength={20}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
            <Field id="company-country" label="Country">
              <input
                id="company-country"
                name="country"
                value={values.country}
                onChange={handleChange}
                maxLength={50}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Additional</h3>
        <p className="mt-1 text-sm text-slate-600">Notes for your team (optional).</p>
        <div className="mt-4">
          <Field id="company-description" label="Description">
            <textarea
              id="company-description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="Relationship context, size, key contacts…"
            />
          </Field>
          <p className="mt-1 text-xs text-slate-500">
            {(values.description || '').length}/1000 characters
          </p>
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

/** Opinionated defaults for the “add company” flow. */
export function AddCompanyForm(props) {
  return <CompanyForm submitLabel="Create company" {...props} />;
}
