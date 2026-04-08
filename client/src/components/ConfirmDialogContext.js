import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    const {
      title = 'Are you sure?',
      message = '',
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      variant = 'danger',
    } = options;

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ title, message, confirmLabel, cancelLabel, variant });
    });
  }, []);

  const finish = useCallback((value) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    r?.(value);
  }, []);

  const confirmBtnClass =
    state?.variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={() => finish(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="crm-confirm-title"
            aria-describedby="crm-confirm-desc"
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 id="crm-confirm-title" className="text-lg font-semibold text-slate-900">
              {state.title}
            </h2>
            {state.message ? (
              <p id="crm-confirm-desc" className="mt-2 text-sm text-slate-600">
                {state.message}
              </p>
            ) : (
              <span id="crm-confirm-desc" className="sr-only">
                Confirm or cancel this action.
              </span>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => finish(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBtnClass}`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return ctx;
}
