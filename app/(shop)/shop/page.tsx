import type { Metadata } from 'next';
import { ProductListing } from '@/components/ProductListing';
import { getNavCategories, getProducts, getSeoMeta } from '@/lib/server-api';
import { buildMetadata, jsonLdString, noIndex } from '@/lib/seo';
import { PAGE_SIZE, SORT_OPTIONS, parseShopQuery, shopHeading } from '@/lib/shop';
import { productHref, shopHref } from '@/lib/utils';
import { SITE_URL } from '@/lib/config';

export async function generateMetadata({ searchParams }: PageProps<'/shop'>): Promise<Metadata> {
  const query = parseShopQuery(await searchParams);

  // Category, sub-category, purpose & rashi each have admin-editable meta
  // (resolved by the backend with priority sub > category > purpose > rashi).
  // URLs carry display names; the backend looks categories up by their id.
  const categories = await getNavCategories();
  const lower = (v?: string) => v?.toLowerCase();
  const cat = categories.find((c) => lower(c.name) === lower(query.category));
  const sub = cat?.subCategories.find((sc) => lower(sc.name) === lower(query.sub));
  let seoQuery = '';
  if (query.category) seoQuery += `&category=${encodeURIComponent(cat?.id ?? query.category)}`;
  if (query.sub) seoQuery += `&sub=${encodeURIComponent(sub?.id ?? query.sub)}`;
  if (query.purpose) seoQuery += `&purpose=${encodeURIComponent(query.purpose)}`;
  if (query.rashi) seoQuery += `&rashi=${encodeURIComponent(query.rashi)}`;
  const meta = await getSeoMeta('/shop', seoQuery);

  const hasTaxonomy = Boolean(query.category || query.sub || query.purpose || query.rashi);
  const special = !hasTaxonomy && (query.bestseller || query.collection === 'bracelet');

  // Canonical: the filtered listing itself (never the search/sort variant), plus
  // the page number so paginated listings aren't collapsed into page 1.
  const canonicalPath = shopHref({
    category: query.category,
    sub: query.sub,
    purpose: query.purpose,
    rashi: query.rashi,
    bestseller: special ? query.bestseller : undefined,
    collection: special ? query.collection : undefined,
    page: query.page,
  });

  return buildMetadata(
    special
      ? { title: `${shopHeading(query)} | Crystaura`, description: meta?.description ?? '' }
      : meta && { ...meta, canonical: `${SITE_URL}${canonicalPath}` },
    { path: canonicalPath },
    // Internal search results shouldn't be indexed (thin/duplicate content).
    query.q ? { robots: noIndex } : {},
  );
}

export default async function ShopPage({ searchParams }: PageProps<'/shop'>) {
  const query = parseShopQuery(await searchParams);
  const sortOption = SORT_OPTIONS.find((o) => o.key === query.sort) ?? SORT_OPTIONS[0];

  const result = await getProducts({
    page: query.page,
    limit: PAGE_SIZE,
    sort: sortOption.sort,
    order: sortOption.order,
    search: query.q,
    category: query.category,
    subCategory: query.sub,
    purpose: query.purpose,
    rashi: query.rashi,
    isBestseller: query.bestseller,
    isBraceletCollection: query.collection === 'bracelet',
  });

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: shopHeading(query),
    itemListElement: result.products.map((p, i) => ({
      '@type': 'ListItem',
      position: (query.page - 1) * PAGE_SIZE + i + 1,
      url: `${SITE_URL}${productHref(p)}`,
      name: p.name,
    })),
  };

  return (
    <>
      {result.products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd) }} />
      )}
      <ProductListing
        query={query}
        products={result.products}
        total={result.total}
        pages={result.pages}
      />
    </>
  );
}
