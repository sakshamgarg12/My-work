import axios from 'axios';

/**
 * Base URL for Express `/api` routes (axios paths are like `/leads` → full URL …/api/leads).
 *
 * Ports (this project):
 * - React dev server: usually 3000+ (CRA). NOT the API.
 * - Express API: default 5000 (`server` PORT / .env). Must match `proxy` in package.json
 *   when using relative `/api` in development.
 *
 * Development:
 * - Default: `/api` (same origin as the browser) → CRA proxy forwards to package.json `proxy`.
 * - Override: set REACT_APP_API_URL to http://localhost:5000 or http://localhost:5000/api
 *   (not …/api/auth) if the backend runs elsewhere or you are not using the proxy.
 *
 * Production build:
 * - Default: http://localhost:5000/api unless REACT_APP_API_URL is set.
 */
/**
 * Fix common mistake: REACT_APP_API_URL=http://localhost:5000/api/auth
 * would otherwise become .../api/auth/api + /auth/login → 404 "Route not found".
 */
function normalizeApiRootInput(input) {
  let s = String(input).trim().replace(/\/+$/, '');
  if (!s) return '';
  if (/\/api\/auth$/i.test(s)) {
    return s.replace(/\/auth$/i, '');
  }
  if (/\/auth$/i.test(s) && !/\/api$/i.test(s)) {
    return s.replace(/\/auth$/i, '');
  }
  return s;
}

function ensureEndsWithApiPath(base) {
  const trimmed = normalizeApiRootInput(base);
  if (!trimmed) return '/api';
  if (trimmed.startsWith('/')) {
    if (trimmed === '/api' || trimmed.endsWith('/api')) {
      return trimmed;
    }
    return `${trimmed}/api`.replace(/\/+/g, '/');
  }
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
}

/**
 * In dev, if REACT_APP_API_URL points at the default local API (localhost:5000 or no port),
 * use relative "/api" so Create React App's proxy always forwards to the backend. That avoids
 * mis-set paths like …/api/auth causing 404 on login.
 */
function shouldUseCraProxyInDev(raw) {
  if (!raw || !String(raw).trim()) return true;
  try {
    const s = String(raw).trim();
    const u = new URL(s.includes('://') ? s : `http://${s}`);
    const hostOk = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const p = u.port;
    const portOk = !p || p === '5000';
    return hostOk && portOk;
  } catch {
    return false;
  }
}

function resolveApiBase() {
  const raw =
    typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
      ? String(process.env.REACT_APP_API_URL).trim()
      : '';

  if (process.env.NODE_ENV === 'development') {
    if (shouldUseCraProxyInDev(raw)) {
      return '/api';
    }
    if (raw) {
      return ensureEndsWithApiPath(raw);
    }
    return '/api';
  }

  if (raw) {
    return ensureEndsWithApiPath(raw);
  }

  return 'http://localhost:5000/api';
}

const API_BASE = resolveApiBase();

let unauthorizedHandler = null;

/** Register a callback invoked when an authenticated API call returns 401 (e.g. expired JWT). */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
}

/** localStorage key for JWT used by `/api` routes (companies, contacts, leads, …). */
export const AUTH_TOKEN_STORAGE_KEY = 'crm_auth_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Pass `null` or `''` to remove the token. */
export function setAuthToken(token) {
  try {
    if (token == null || token === '') {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, String(token));
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Fetches `/auth/dev-token` from the same API base as Axios (proxy in dev, REACT_APP_API_URL or localhost in prod).
 * Server returns 404 when dev-token is disabled (e.g. production without ALLOW_DEV_TOKEN).
 */
export async function fetchDevTokenIfMissing() {
  if (process.env.REACT_APP_SKIP_DEV_TOKEN === 'true') return false;
  if (getAuthToken()) return true;
  const url = `${API_BASE}/auth/dev-token`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token) {
      setAuthToken(data.token);
      return true;
    }
  } catch {
    /* API unreachable */
  }
  return false;
}

/**
 * Shared Axios instance for the Catalyst backend (companies, contacts, leads, etc.).
 */
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function errorMessage(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  if (data?.message === 'Validation error' && Array.isArray(data?.errors)) {
    return data.errors.map((e) => e.message).join('; ');
  }
  if (typeof data?.message === 'string' && data.message) {
    return data.message;
  }
  if (status === 401) {
    return 'Authentication required (no or invalid JWT). Store a token with setAuthToken() after login.';
  }
  return error.response?.statusText || error.message || 'Request failed';
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && unauthorizedHandler) {
      setAuthToken(null);
      unauthorizedHandler();
    }
    return Promise.reject(new Error(errorMessage(error)));
  }
);

export function get(path, config) {
  return apiClient.get(path, config);
}

export function post(path, body, config) {
  return apiClient.post(path, body, config);
}

export function put(path, body, config) {
  return apiClient.put(path, body, config);
}

export function del(path, config) {
  return apiClient.delete(path, config);
}

export { API_BASE };
