import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthBrandedShell } from '../components/AuthBrandedShell';
import { useToast } from '../components';
import { API_BASE, getAuthToken, setAuthToken, fetchDevTokenIfMissing } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/registration-status`);
        const data = await res.json();
        if (!cancelled && data?.registrationOpen) setRegistrationOpen(true);
      } catch {
        /* ignore */
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
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.message === 'Validation error' && Array.isArray(data?.errors)) {
          throw new Error(data.errors.map((x) => x.message).join('; '));
        }
        throw new Error(data.message || 'Sign-in failed');
      }
      if (data.token) {
        setAuthToken(data.token);
      }
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDevToken() {
    setSubmitting(true);
    try {
      const ok = await fetchDevTokenIfMissing();
      if (ok && getAuthToken()) {
        toast.success('Development token applied');
        navigate(from, { replace: true });
      } else {
        toast.error('Dev token unavailable (start API or enable ALLOW_DEV_TOKEN)');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthBrandedShell
      title="Welcome back"
      subtitle="Sign in to Catalyst to manage companies, contacts, and leads."
      footer={
        <p>
          {registrationOpen ? (
            <>
              New to Catalyst?{' '}
              <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">
                Create an account
              </Link>
            </>
          ) : (
            <span className="text-slate-500">Contact your admin for an account.</span>
          )}
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        {process.env.NODE_ENV === 'development' ? (
          <p className="text-xs text-slate-500">
            <button
              type="button"
              onClick={handleDevToken}
              disabled={submitting}
              className="font-medium text-blue-700 underline decoration-blue-700/30 hover:decoration-blue-700 disabled:opacity-50"
            >
              Use development token
            </button>{' '}
            (no password; requires API dev-token route)
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full justify-center rounded-lg bg-[#001F3F] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-[#001F3F]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthBrandedShell>
  );
}
