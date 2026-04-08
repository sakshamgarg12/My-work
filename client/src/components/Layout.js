import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const MARK_SRC = `${process.env.PUBLIC_URL || ''}/catalyst-mark.png`;

/**
 * App shell: fixed sidebar (desktop) + slide-over (mobile), main content area.
 */
export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="catalyst-sidebar"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <img
          src={MARK_SRC}
          alt=""
          className="h-9 w-9 shrink-0 object-contain"
          width={36}
          height={36}
          loading="eager"
          decoding="async"
          aria-hidden
        />
        <span className="min-w-0 truncate text-sm font-semibold text-[#001F3F]">Catalyst</span>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        id="catalyst-sidebar"
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-out md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:z-0',
        ].join(' ')}
      >
        <Sidebar onNavigate={closeMobile} />
      </aside>

      <main className="min-h-screen flex-1 pt-14 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
