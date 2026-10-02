import type { ShopQuery } from './utils';

export const SORT_OPTIONS = [
  { key: 'newest',     label: 'Newest First',       sort: 'createdAt',   order: 'desc' },
  { key: 'price-asc',  label: 'Price: Low to High', sort: 'price',       order: 'asc'  },
  { key: 'price-desc', label: 'Price: High to Low', sort: 'price',       order: 'desc' },
  { key: 'rating',     label: 'Highest Rated',      sort: 'rating',      order: 'desc' },
  { key: 'reviews',    label: 'Most Reviewed',      sort: 'reviewCount', order: 'desc' },
] as const;

export const PAGE_SIZE = 15;

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function parseShopQuery(raw: RawParams): Required<Pick<ShopQuery, 'sort' | 'page'>> & ShopQuery {
  const sortKey = first(raw.sort);
  const page = Number.parseInt(first(raw.page) ?? '1', 10);
  return {
    category: first(raw.category),
    sub: first(raw.sub),
    purpose: first(raw.purpose),
    rashi: first(raw.rashi),
    q: first(raw.q),
    bestseller: first(raw.bestseller) === 'true',
    collection: first(raw.collection),
    sort: SORT_OPTIONS.some((o) => o.key === sortKey) ? sortKey! : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function shopHeading(query: ShopQuery) {
  if (query.bestseller) return 'Best Sellers';
  if (query.collection === 'bracelet') return 'Bracelet Collection';
  if (query.category) return query.category;
  if (query.purpose) return `Purpose: ${query.purpose}`;
  if (query.rashi) return `Rashi: ${query.rashi}`;
  return 'Divine Collection';
}
