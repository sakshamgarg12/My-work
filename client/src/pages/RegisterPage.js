import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBrandedShell } from '../components/AuthBrandedShell';
import { useToast } from '../components';
import { API_BASE, getAuthToken, setAuthToken } from '../services/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (getAuthToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/registration-status`);
        const data = await res.json();
        if (!cancelled) setAllowed(!!data?.registrationOpen);
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.message === 'Validation error' && Array.isArray(data?.errors)) {
          throw new Error(data.errors.map((x) => x.message).join('; '));
        }
        throw new Error(data.message || 'Registration failed');
      }
      if (data.token) {
        setAuthToken(data.token);
      }
      toast.success('Account created — you are signed in');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (allowed === false) {
    return (
      <AuthBrandedShell
        title="Registration closed"
        subtitle="New sign-ups are not available. Ask an administrator to invite you."
        footer={
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Back to sign in
          </Link>
        }
      >
        <p className="text-center text-sm text-slate-600">
          The first user can register when the database is empty, or your server can set{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">ALLOW_PUBLIC_REGISTER=true</code>.
        </p>
      </AuthBrandedShell>
    );
  }

  if (allowed === null) {
    return (
      <AuthBrandedShell title="Create account" subtitle="Checking registration…">
        <p className="text-center text-sm text-slate-500">Loading…</p>
      </AuthBrandedShell>
    );
  }

  return (
    <AuthBrandedShell
      title="Create your account"
      subtitle="Set up Catalyst for your team. The first user becomes an admin."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full justify-center rounded-lg bg-[#001F3F] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-[#001F3F]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthBrandedShell>
  );
}
