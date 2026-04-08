import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const MARK_SRC = `${process.env.PUBLIC_URL || ''}/catalyst-mark.png`;

function IconBox({ isActive, children }) {
  return (
    <span
      className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
        isActive ? 'bg-white/20 text-white' : 'bg-slate-800/80 text-slate-400',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function IconDashboard() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25H15a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z"
      />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SidebarLink({ to, end, icon, label, onNavigate }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate}>
      {({ isActive }) => (
        <span
          className={[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
          ].join(' ')}
        >
          <IconBox isActive={isActive}>{icon}</IconBox>
          {label}
        </span>
      )}
    </NavLink>
  );
}

function QuickAddLink({ to, label, onNavigate }) {
  return (
    <NavLink to={to} onClick={onNavigate}>
      {({ isActive }) => (
        <span
          className={[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
          ].join(' ')}
        >
          <span
            className={[
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
              isActive ? 'bg-white/20 text-white' : 'bg-slate-800/80 text-blue-400',
            ].join(' ')}
          >
            <IconPlus />
          </span>
          {label}
        </span>
      )}
    </NavLink>
  );
}

/**
 * Catalyst sidebar: primary navigation + quick-add links.
 */
export function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  function handleLogout() {
    setAuthToken(null);
    onNavigate?.();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-full flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="flex min-h-[4.25rem] shrink-0 items-center gap-3 border-b border-slate-800/80 px-4 py-3">
        <img
          src={MARK_SRC}
          alt=""
          className="h-11 w-11 shrink-0 object-contain"
          width={44}
          height={44}
          loading="eager"
          decoding="async"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">Catalyst</p>
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Fueling growth & connection
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Overview</p>
        <ul className="space-y-0.5">
          <li>
            <SidebarLink to="/" end icon={<IconDashboard />} label="Dashboard" onNavigate={onNavigate} />
          </li>
        </ul>

        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Records</p>
        <ul className="space-y-0.5">
          <li>
            <SidebarLink to="/companies" end icon={<IconBuilding />} label="Companies" onNavigate={onNavigate} />
          </li>
          <li>
            <SidebarLink to="/contacts" end icon={<IconUsers />} label="Contacts" onNavigate={onNavigate} />
          </li>
          <li>
            <SidebarLink to="/leads" end icon={<IconBolt />} label="Leads" onNavigate={onNavigate} />
          </li>
        </ul>

        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick add</p>
        <ul className="space-y-0.5">
          <li>
            <QuickAddLink to="/companies/new" label="Add company" onNavigate={onNavigate} />
          </li>
          <li>
            <QuickAddLink to="/contacts/new" label="Add contact" onNavigate={onNavigate} />
          </li>
          <li>
            <QuickAddLink to="/leads/new" label="Add lead" onNavigate={onNavigate} />
          </li>
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-800/80 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-800/50 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
