import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Adds GST (if any) on top of a base price — used everywhere a single,
// tax-inclusive price is shown to the customer (product cards, product page).
export function priceWithGst(price: number, gstRate?: number) {
  const rate = gstRate ?? 0;
  return price + Math.round(price * rate / 100);
}

// Fixed locale so server-rendered and hydrated numbers always match.
export function formatINR(value: number) {
  return value.toLocaleString('en-IN');
}

export function productHref(product: Pick<Product, 'id'> & { slug?: string | null; _id?: string }) {
  return `/product/${product.slug || product.id || product._id}`;
}

// Only allow same-site paths as post-login destinations (blocks ?redirect=https://evil.com and //evil.com).
export function safeRedirect(target: string | null | undefined, fallback = '/') {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  return target;
}

export type ShopQuery = {
  category?: string;
  sub?: string;
  purpose?: string;
  rashi?: string;
  q?: string;
  bestseller?: boolean;
  collection?: string;
  sort?: string;
  page?: number;
};

// Single source of truth for /shop URLs so every link (navbar, homepage tiles,
// chips, pagination) produces the same canonical parameter order.
export function shopHref(query: ShopQuery = {}) {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.sub) params.set('sub', query.sub);
  if (query.purpose) params.set('purpose', query.purpose);
  if (query.rashi) params.set('rashi', query.rashi);
  if (query.bestseller) params.set('bestseller', 'true');
  if (query.collection) params.set('collection', query.collection);
  if (query.q) params.set('q', query.q);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}
