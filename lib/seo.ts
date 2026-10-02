import type { Metadata } from 'next';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from './config';
import { getSeoMeta, type SeoMeta } from './server-api';

// The backend points static pages at /og-default.jpg, which isn't published yet —
// fall back to the logo so link previews never show a broken image.
const FALLBACK_OG_IMAGE = `${SITE_URL}/logo.png`;
const ogImage = (image?: string) => (!image || image.endsWith('/og-default.jpg') ? FALLBACK_OG_IMAGE : image);

type OgType = 'website' | 'article';

export function buildMetadata(
  meta: SeoMeta | null,
  fallback: { title?: string; description?: string; path: string; image?: string; type?: OgType },
  extra: Metadata = {},
): Metadata {
  const title = meta?.title || fallback.title || DEFAULT_TITLE;
  const description = meta?.description || fallback.description || DEFAULT_DESCRIPTION;
  const canonical = meta?.canonical || `${SITE_URL}${fallback.path}`;
  const image = ogImage(meta?.og?.image || fallback.image);
  // Next's OpenGraph types only model website/article; products fall back to website.
  const type: OgType = meta?.og?.type === 'article' ? 'article' : fallback.type ?? 'website';

  return {
    // `absolute` because admin-provided titles already include the brand.
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title: meta?.og?.title || title,
      description: meta?.og?.description || description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      images: [{ url: image }],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.og?.title || title,
      description: meta?.og?.description || description,
      images: [image],
    },
    ...extra,
  };
}

export const noIndex: Metadata['robots'] = { index: false, follow: true };

// Serialises JSON-LD safely for inline <script> (escapes `<` so content can't close the tag).
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Account, cart and auth pages: titled from the admin Page SEO settings but never indexed.
export async function privatePageMetadata(path: string, title: string): Promise<Metadata> {
  const meta = await getSeoMeta(path);
  return buildMetadata(meta, { title: `${title} | Crystaura`, path }, { robots: noIndex });
}
