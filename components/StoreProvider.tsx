'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem, Product, User } from '@/lib/types';
import {
  apiDelete,
  apiFetch,
  apiPost,
  apiPut,
  apiUpload,
  clearToken,
  getToken,
  setRefreshToken,
  setRememberMe,
  setToken,
} from '@/lib/api';
import { mapApiCartItem, mapApiUser } from '@/lib/normalize';

/* eslint-disable @typescript-eslint/no-explicit-any -- raw backend JSON */

const CART_KEY = 'divine_cart';

interface StoreValue {
  user: User | null;
  /** true once the saved session (if any) has been checked */
  authReady: boolean;
  cart: CartItem[];
  /** true once the saved cart has been read from storage */
  cartReady: boolean;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

// Backend items take priority; items only present locally are appended.
function mergeCarts(backend: CartItem[], local: CartItem[]) {
  const merged = [...backend];
  const localOnly: CartItem[] = [];
  for (const item of local) {
    if (!merged.find((b) => b.id === item.id)) {
      merged.push(item);
      localOnly.push(item);
    }
  }
  return { merged, localOnly };
}

// Push guest-only items to the account, then reload the server cart so every
// item carries its backend cartItemId (needed for later updates/removals).
async function syncGuestItems(items: CartItem[], setCart: React.Dispatch<React.SetStateAction<CartItem[]>>) {
  await Promise.all(
    items.map((item) => apiPost('/cart', { productId: item.id, quantity: item.quantity }).catch(() => {})),
  );
  try {
    const { cart: backendItems } = await apiFetch<{ cart: any[] }>('/cart');
    setCart((prev) => mergeCarts(backendItems.map(mapApiCartItem), prev).merged);
  } catch { /* keep local cart */ }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const cartRef = useRef<CartItem[]>([]);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Load the saved cart and restore the session after hydration (web storage is
  // browser-only, so this can't happen during server rendering).
  useEffect(() => {
    let localCart: CartItem[] = [];
    try {
      const saved = localStorage.getItem(CART_KEY);
      localCart = saved ? JSON.parse(saved) : [];
    } catch { /* corrupted storage — start empty */ }
    // Web storage only exists in the browser, so the saved cart can only be
    // restored after hydration — this is the one-time sync from that external store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(localCart);
    setCartReady(true);

    if (!getToken()) {
      setAuthReady(true);
      return;
    }
    apiFetch<{ user: any }>('/user/profile')
      .then(({ user }) => {
        setUser(mapApiUser(user));
        return apiFetch<{ cart: any[] }>('/cart');
      })
      .then(({ cart: backendItems }) => {
        const backendCart = backendItems.map(mapApiCartItem);
        // Merge against the CURRENT in-memory cart so items added while this
        // request was in flight aren't lost.
        setCart((prev) => mergeCarts(backendCart, prev).merged);
      })
      .catch((err: any) => {
        if (err.message?.includes('Session expired') || err.message?.includes('Unauthorized')) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  // Persist cart on every change (after the initial load)
  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch { /* ignore quota errors */ }
  }, [cart, cartReady]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const productId = product.id;
    // Optimistic local update
    setCart((prev) => {
      const found = prev.find((item) => item.id === productId);
      if (found) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...prev, { ...product, quantity }];
    });

    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'INR',
      });
    }

    if (getToken()) {
      try {
        // POST increments the quantity when the product is already in the cart.
        const data = await apiPost<{ cart?: any[] }>('/cart', { productId, quantity });
        // Pick up the subdocument id so later quantity updates / removals hit the backend.
        const saved = data?.cart?.find((i: any) => String(i.product?._id ?? i.product) === productId);
        if (saved?._id) {
          setCart((prev) => prev.map((i) => (i.id === productId ? { ...i, cartItemId: saved._id } : i)));
        }
      } catch {
        // Keep local state as-is if API fails
      }
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    const cartItemId = cartRef.current.find((item) => item.id === productId)?.cartItemId;
    setCart((prev) => prev.filter((item) => item.id !== productId));
    if (getToken() && cartItemId) {
      try {
        await apiDelete(`/cart/${cartItemId}`);
      } catch { /* keep local state */ }
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const cartItemId = cartRef.current.find((item) => item.id === productId)?.cartItemId;
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)));
    if (getToken() && cartItemId) {
      try {
        await apiPut(`/cart/${cartItemId}`, { quantity });
      } catch { /* keep local state */ }
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch { /* ignore */ }
    if (getToken()) {
      try { await apiDelete('/cart'); } catch { /* ignore */ }
    }
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    setRememberMe(remember);
    // Snapshot guest cart before any async operation
    const guestCart = cartRef.current;
    const data = await apiPost<any>('/auth/login', { email, password });
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(mapApiUser(data.user));

    let mergedCart = guestCart;
    try {
      const { cart: backendItems } = await apiFetch<{ cart: any[] }>('/cart');
      const { merged, localOnly } = mergeCarts(backendItems.map(mapApiCartItem), guestCart);
      mergedCart = merged;
      if (localOnly.length) void syncGuestItems(localOnly, setCart);
    } catch { /* keep guest cart if backend cart fetch fails */ }
    setCart(mergedCart);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const guestCart = cartRef.current;
    const data = await apiPost<any>('/auth/register', { name, email, password });
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(mapApiUser(data.user));
    if (guestCart.length) void syncGuestItems(guestCart, setCart);
  }, []);

  const logout = useCallback(async () => {
    try { await apiPost('/auth/logout'); } catch { /* ignore */ }
    clearToken();
    setUser(null);
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch { /* ignore */ }
  }, []);

  const updateAvatar = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const data = await apiUpload<{ user: any }>('/user/profile', formData);
    setUser(mapApiUser(data.user));
  }, []);

  const value = useMemo<StoreValue>(() => ({
    user,
    authReady,
    cart,
    cartReady,
    cartCount: cart.reduce((acc, item) => acc + item.quantity, 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    login,
    register,
    logout,
    updateAvatar,
  }), [user, authReady, cart, cartReady, addToCart, removeFromCart, updateQuantity, clearCart, login, register, logout, updateAvatar]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
