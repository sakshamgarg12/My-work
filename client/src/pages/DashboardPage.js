import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { dashboardService } from '../services';

function IconBuilding() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState({ companies: null, contacts: null, leads: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.fetchDashboardStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not load dashboard data');
          setStats({ companies: 0, contacts: 0, leads: 0 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const format = (n) => (loading ? '—' : (n ?? 0).toLocaleString());

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-base">
          Overview of your pipeline — totals are loaded from the Catalyst API.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-medium">Unable to refresh stats</p>
          <p className="mt-1 text-amber-800/90">{error}</p>
          <p className="mt-2 text-xs text-amber-800/80">
            {error === 'Network Error' || /network/i.test(error) ? (
              <>
                The app could not reach the API. From <code className="rounded bg-amber-100/80 px-1">crm-app/server</code>{' '}
                run <code className="rounded bg-amber-100/80 px-1">npm start</code> (default port 5000). Then restart{' '}
                <code className="rounded bg-amber-100/80 px-1">npm start</code> in <code className="rounded bg-amber-100/80 px-1">client</code> if it was already running.
              </>
            ) : (
              <>
                If this persists, confirm MySQL is up, the server is running on port 5000, and{' '}
                <code className="rounded bg-amber-100/80 px-1">REACT_APP_API_URL</code> matches your API base when not using
                the dev proxy.
              </>
            )}
          </p>
        </div>
      )}

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Record totals
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total companies"
            value={format(stats.companies)}
            loading={loading}
            accent="blue"
            icon={<IconBuilding />}
          />
          <StatCard
            label="Total contacts"
            value={format(stats.contacts)}
            loading={loading}
            accent="emerald"
            icon={<IconUsers />}
          />
          <StatCard
            label="Total leads"
            value={format(stats.leads)}
            loading={loading}
            accent="amber"
            icon={<IconBolt />}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-600">Jump to common tasks on smaller screens or alongside the sidebar.</p>
        <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <li>
            <Link
              to="/companies/new"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Add company
            </Link>
          </li>
          <li>
            <Link
              to="/contacts/new"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Add contact
            </Link>
          </li>
          <li>
            <Link
              to="/leads/new"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Add lead
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
