import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ToastProvider, ConfirmDialogProvider } from './components';
async function startApp() {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <ConfirmDialogProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </React.StrictMode>
  );
}

startApp();
