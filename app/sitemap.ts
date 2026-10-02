import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';
import {
  getAllBlogPostsForSitemap,
  getAllProductsForSitemap,
  getHomepage,
  getNavCategories,
} from '@/lib/server-api';
import { shopHref } from '@/lib/utils';

// Regenerated at most once an hour.
export const revalidate = 3600;

const url = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
const date = (value?: string) => (value ? new Date(value) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories, homepage] = await Promise.all([
    getAllProductsForSitemap(),
    getAllBlogPostsForSitemap(),
    getNavCategories(),
    getHomepage(),
  ]);

  const now = new Date();

  return [
    { url: url('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: url('/shop'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: url('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/privacy-policy'), changeFrequency: 'yearly', priority: 0.3 },
    { url: url('/terms'), changeFrequency: 'yearly', priority: 0.3 },

    ...products.map((p) => ({
      url: url(`/product/${p.slug}`),
      lastModified: date(p.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Same URLs the navbar links to, so the sitemap matches internal linking.
    ...categories.flatMap((cat) => [
      { url: url(shopHref({ category: cat.name })), changeFrequency: 'weekly' as const, priority: 0.7 },
      ...cat.subCategories.map((sub) => ({
        url: url(shopHref({ category: cat.name, sub: sub.name })),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...homepage.purposes.map((p: any) => ({
      url: url(shopHref({ purpose: p.name })),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...homepage.rashis.map((r: any) => ({
      url: url(shopHref({ rashi: r.name })),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),

    ...posts.map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
