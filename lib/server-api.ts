// Server-side data layer. Every read is cached with ISR (`revalidate`) so crawlers
// and shoppers get fully rendered HTML without hitting the backend on every request.
import { cache } from 'react';
import { SERVER_API_BASE_URL } from './config';
import { normalizeProduct } from './normalize';
import type { BlogPost, Product } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any -- raw backend JSON */

type FetchResult<T> = { ok: true; data: T } | { ok: false; status: number };

async function serverFetch<T>(path: string, revalidate: number): Promise<FetchResult<T>> {
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}${path}`, {
      next: { revalidate },
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
    });
    // The product-by-slug endpoint answers renamed slugs with a 301 + JSON body
    // ({ redirectTo }) instead of a Location header, so 3xx bodies are data too.
    const isJsonRedirect = res.status >= 300 && res.status < 400;
    if (!res.ok && !isJsonRedirect) return { ok: false, status: res.status };
    const json = await res.json();
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

// A failed backend call must never be cached as a real answer (an empty homepage,
// or a 404 for a product that exists). Outside of `next build`, throw instead: ISR
// then keeps serving the last good page, and uncached pages return a retryable 500.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

function assertReachable(res: FetchResult<unknown>, path: string) {
  if (!res.ok && res.status !== 404 && !isBuildPhase) {
    throw new Error(`Backend request failed (${res.status || 'network error'}): ${path}`);
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavSubCategory {
  _id: string;
  id: string;
  name: string;
}

export interface NavCategory {
  _id: string;
  id: string;
  name: string;
  icon?: string;
  image?: string;
  subCategories: NavSubCategory[];
}

export async function getNavCategories(): Promise<NavCategory[]> {
  const res = await serverFetch<{ categories: NavCategory[] }>('/categories/navbar', 600);
  assertReachable(res, '/categories/navbar');
  return res.ok ? res.data.categories ?? [] : [];
}

// ─── Homepage ────────────────────────────────────────────────────────────────

export interface HomepageData {
  heroSlides: any[];
  offerCards: any[];
  collections: Product[];
  purposes: any[];
  rashis: any[];
  braceletCollection: Product[];
  pyramidCollection: Product[];
  domTreeCollection: Product[];
}

export async function getHomepage(): Promise<HomepageData> {
  const res = await serverFetch<any>('/homepage', 300);
  assertReachable(res, '/homepage');
  const d = res.ok ? res.data : {};
  const products = (list: any) => (Array.isArray(list) ? list.map(normalizeProduct) : []);
  return {
    heroSlides: d.heroSlides ?? [],
    offerCards: (d.offerCards ?? []).map((card: any) => ({
      ...card,
      taggedProduct: card.taggedProduct ? normalizeProduct(card.taggedProduct) : null,
    })),
    collections: products(d.collections),
    purposes: d.purposes ?? [],
    rashis: d.rashis ?? [],
    braceletCollection: products(d.braceletCollection),
    pyramidCollection: products(d.pyramidCollection),
    domTreeCollection: products(d.domTreeCollection),
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductListParams {
  page: number;
  limit: number;
  sort: string;
  order: string;
  search?: string;
  category?: string;
  subCategory?: string;
  purpose?: string;
  rashi?: string;
  isBestseller?: boolean;
  isBraceletCollection?: boolean;
}

export async function getProducts(p: ProductListParams) {
  const params = new URLSearchParams({ page: String(p.page), limit: String(p.limit), sort: p.sort, order: p.order });
  if (p.search) params.set('search', p.search);
  if (p.category) params.set('category', p.category);
  if (p.subCategory) params.set('subCategory', p.subCategory);
  if (p.purpose) params.set('purpose', p.purpose.toLowerCase());
  if (p.rashi) params.set('rashi', p.rashi);
  if (p.isBestseller) params.set('isBestseller', 'true');
  if (p.isBraceletCollection) params.set('isBraceletCollection', 'true');

  const res = await serverFetch<any>(`/products?${params}`, 120);
  assertReachable(res, '/products');
  if (!res.ok) return { products: [] as Product[], total: 0, pages: 1, failed: true };
  return {
    products: (res.data.products ?? []).map(normalizeProduct) as Product[],
    total: Number(res.data.total ?? 0),
    pages: Number(res.data.pages ?? 1),
    failed: false,
  };
}

// Deduplicated per request so generateMetadata and the page share one fetch.
type ProductLookup = { product: Product } | { redirectTo: string } | null;

export const getProductBySlug = cache(async (slug: string): Promise<ProductLookup> => {
  const res = await serverFetch<any>(`/products/slug/${encodeURIComponent(slug)}`, 300);
  assertReachable(res, `/products/slug/${slug}`);
  if (!res.ok) return null;
  if (res.data?.redirectTo) return { redirectTo: res.data.redirectTo as string };
  return { product: normalizeProduct(res.data.product ?? res.data) };
});

export async function getRelatedProducts(id: string): Promise<Product[]> {
  const res = await serverFetch<any>(`/products/${id}/related`, 300);
  return res.ok ? (res.data.products ?? []).map(normalizeProduct) : [];
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export async function getBlogPosts(page: number, limit: number) {
  const res = await serverFetch<{ posts: BlogPost[]; total: number; pages: number }>(
    `/blogs?page=${page}&limit=${limit}`,
    300,
  );
  assertReachable(res, '/blogs');
  if (!res.ok) return { posts: [] as BlogPost[], total: 0, pages: 1, failed: true };
  return { posts: res.data.posts ?? [], total: res.data.total ?? 0, pages: res.data.pages ?? 1, failed: false };
}

export const getBlogPost = cache(async (slug: string) => {
  const res = await serverFetch<{ post: BlogPost }>(`/blogs/${encodeURIComponent(slug)}`, 300);
  assertReachable(res, `/blogs/${slug}`);
  return res.ok ? res.data.post : null;
});

// ─── Sitemap ─────────────────────────────────────────────────────────────────

async function collectPages<T>(fetchPage: (page: number) => Promise<{ items: T[]; pages: number } | null>, maxPages = 50) {
  const all: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetchPage(page);
    if (!res) break;
    all.push(...res.items);
    if (page >= res.pages) break;
  }
  return all;
}

type SitemapEntry = { slug: string; updatedAt?: string };

export async function getAllProductsForSitemap() {
  return collectPages<SitemapEntry>(async (page) => {
    const res = await serverFetch<any>(`/products?page=${page}&limit=100&sort=createdAt&order=desc`, 3600);
    assertReachable(res, '/products (sitemap)');
    if (!res.ok) return null;
    return {
      items: (res.data.products ?? []).map((p: any) => ({ slug: p.slug || p._id, updatedAt: p.updatedAt as string | undefined })),
      pages: Number(res.data.pages ?? 1),
    };
  });
}

export async function getAllBlogPostsForSitemap() {
  return collectPages<SitemapEntry>(async (page) => {
    const res = await serverFetch<any>(`/blogs?page=${page}&limit=50`, 3600);
    assertReachable(res, '/blogs (sitemap)');
    if (!res.ok) return null;
    return {
      items: (res.data.posts ?? []).filter((p: any) => p.slug).map((p: any) => ({ slug: p.slug as string, updatedAt: p.updatedAt as string | undefined })),
      pages: Number(res.data.pages ?? 1),
    };
  });
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  og?: { title?: string; description?: string; image?: string; url?: string; type?: string };
  jsonLd?: Record<string, unknown>[] | null;
}

// Admin-editable meta (Settings > Page SEO, per-category/purpose/rashi, per-product,
// per-post) resolved by backend/controllers/seo.controller.js.
export const getSeoMeta = cache(async (path: string, query = ''): Promise<SeoMeta | null> => {
  const res = await serverFetch<SeoMeta>(`/seo/meta?path=${encodeURIComponent(path)}${query}`, 300);
  return res.ok ? res.data : null;
});
