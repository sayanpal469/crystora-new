// Browser-side API client. Tokens live in web storage, so everything here must
// only run in Client Components (event handlers / effects), never during SSR.
import { API_BASE_URL as BASE_URL } from './config';
import { normalizeOrder } from './normalize';
import type { Order } from './types';

const isBrowser = typeof window !== 'undefined';

// "Remember me" controls where new tokens are written: localStorage persists
// across browser restarts, sessionStorage is cleared when the tab/browser closes.
// The preference itself is persisted in localStorage so a page reload doesn't
// silently upgrade a session-only login back to persistent on the next refresh.
const rememberMe = () => !isBrowser || localStorage.getItem('rememberMe') !== 'false';
export const setRememberMe = (remember: boolean) => {
  if (isBrowser) localStorage.setItem('rememberMe', String(remember));
};

const activeStorage = () => (rememberMe() ? localStorage : sessionStorage);

export const getToken = () =>
  isBrowser ? localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken') : null;
export const setToken = (token: string) => activeStorage().setItem('accessToken', token);
export const clearToken = () => {
  if (!isBrowser) return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};
export const getRefreshToken = () =>
  isBrowser ? localStorage.getItem('refreshToken') ?? sessionStorage.getItem('refreshToken') : null;
export const setRefreshToken = (token: string) => activeStorage().setItem('refreshToken', token);

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `API error: ${res.status}`);
  return json.data as T;
}

// Prevent concurrent refresh requests
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearToken();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      return null;
    }

    const data = await res.json();
    const newAccessToken: string = data.data.accessToken;
    setToken(newAccessToken);
    setRefreshToken(data.data.refreshToken);

    refreshQueue.forEach((cb) => cb(newAccessToken));
    refreshQueue = [];
    return newAccessToken;
  } catch {
    clearToken();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeaders(),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Auto-refresh on 401, but not for auth endpoints to avoid loops
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const newToken = await tryRefresh();
    if (newToken) {
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
      return handleResponse<T>(retryRes);
    }
    throw new Error('Session expired. Please log in again.');
  }

  return handleResponse<T>(res);
}

export async function apiFetch<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// For multipart/form-data uploads — no Content-Type header so the browser
// sets it (with the correct boundary) automatically.
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'PUT', body: formData });
}

export interface ShippingConfig {
  freeThreshold: number;
  charge: number;
  gstPercent: number;
}

let _shippingConfigCache: ShippingConfig | null = null;

export async function fetchShippingConfig(): Promise<ShippingConfig> {
  if (_shippingConfigCache) return _shippingConfigCache;
  try {
    const data = await apiFetch<ShippingConfig>('/settings/shipping');
    _shippingConfigCache = data;
    return data;
  } catch {
    return { freeThreshold: 2000, charge: 150, gstPercent: 18 };
  }
}

export async function fetchOrders(page = 1, limit = 10): Promise<{ orders: Order[]; total: number; pages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiFetch<{ orders: any[]; total: number; pages: number }>(`/orders?page=${page}&limit=${limit}`);
  return { ...data, orders: data.orders.map(normalizeOrder) };
}

export async function fetchOrderById(id: string): Promise<Order> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiFetch<{ order: any }>(`/orders/${id}`);
  return normalizeOrder(data.order);
}

export interface ShipmentStatus {
  orderId: string;
  status: string;
  awbCode: string | null;
  courierName: string;
  edd: string;
  timeline: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  liveTracking: any;
}

export async function fetchShipmentStatus(orderId: string): Promise<ShipmentStatus> {
  return apiFetch(`/shipping/order/${orderId}`);
}

// Fire-and-forget click tracking (admin panel > Analytics > Product Clicks).
// keepalive lets the request finish even if the click immediately navigates away;
// failures are swallowed since a missed analytics ping must never affect the shopper.
export function trackProductClick(productId: string, source: string) {
  if (!isBrowser || !productId) return;
  const token = getToken();
  fetch(`${BASE_URL}/analytics/track`, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId, source }),
  }).catch(() => { /* analytics is best-effort */ });
}
