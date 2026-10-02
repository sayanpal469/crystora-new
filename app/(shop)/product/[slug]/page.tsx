import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ProductDetails } from '@/components/ProductDetails';
import { getProductBySlug, getRelatedProducts, getSeoMeta } from '@/lib/server-api';
import { buildMetadata, jsonLdString } from '@/lib/seo';
import { SITE_URL } from '@/lib/config';
import { priceWithGst, productHref, shopHref } from '@/lib/utils';
import type { Product } from '@/lib/types';

// Rendered on first visit, then cached and refreshed in the background (ISR) —
// crawlers get cached HTML instead of waiting on the backend.
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

const AVAILABILITY: Record<Product['stockStatus'], string> = {
  'In Stock': 'https://schema.org/InStock',
  'Low Stock': 'https://schema.org/LimitedAvailability',
  'Out of Stock': 'https://schema.org/OutOfStock',
};

// Resolves the URL param to a product, sending legacy ObjectId URLs and renamed
// slugs to the current canonical URL with a permanent (308) redirect.
async function resolveProduct(slug: string) {
  const result = await getProductBySlug(slug);
  if (!result) notFound();
  if ('redirectTo' in result) permanentRedirect(result.redirectTo);
  const { product } = result;
  if (OBJECT_ID_RE.test(slug) && product.slug && product.slug !== slug) {
    permanentRedirect(productHref(product));
  }
  return product;
}

export async function generateMetadata({ params }: PageProps<'/product/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  const path = productHref(product);
  const meta = await getSeoMeta(path);
  return buildMetadata(meta, {
    title: product.meta_title || `${product.name} | Crystaura`,
    description: product.meta_description || product.description?.slice(0, 160),
    path,
    image: product.image,
  });
}

export default async function ProductPage({ params }: PageProps<'/product/[slug]'>) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  const related = await getRelatedProducts(product.id);
  const url = `${SITE_URL}${productHref(product)}`;
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];

  // Built here (not taken from the backend) so the structured-data price matches
  // the GST-inclusive price shown on the page.
  const jsonLd = [
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      ...(images.length && { image: images }),
      ...(product.category && { category: product.category }),
      brand: { '@type': 'Brand', name: 'Crystaura' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: priceWithGst(product.price, product.gstRate),
        availability: AVAILABILITY[product.stockStatus] ?? AVAILABILITY['In Stock'],
        url,
        itemCondition: 'https://schema.org/NewCondition',
      },
      ...(product.reviews > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(product.rating).toFixed(1),
          reviewCount: product.reviews,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: 'Home', item: SITE_URL },
        { name: 'Shop', item: `${SITE_URL}/shop` },
        ...(product.category ? [{ name: product.category, item: `${SITE_URL}${shopHref({ category: product.category })}` }] : []),
        { name: product.name, item: url },
      ].map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <ProductDetails product={product} related={related} />
    </>
  );
}
