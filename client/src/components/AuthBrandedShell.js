import React from 'react';

const MARK_SRC = `${process.env.PUBLIC_URL || ''}/catalyst-mark.png`;

/**
 * Centered card layout for login / register (no app sidebar).
 */
export function AuthBrandedShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src={MARK_SRC}
              alt=""
              className="h-14 w-14 object-contain drop-shadow-sm"
              width={56}
              height={56}
              aria-hidden
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#001F3F]">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-8">
            {children}
          </div>
          {footer ? <div className="mt-6 text-center text-sm text-slate-600">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
