import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, ShoppingBag, Star } from 'lucide-react';
import { getBlogPost, getSeoMeta } from '@/lib/server-api';
import { buildMetadata, jsonLdString } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/config';
import { formatINR } from '@/lib/utils';
import { TrackedProductLink } from '@/components/TrackedProductLink';
import type { BlogPost } from '@/lib/types';

/* eslint-disable @next/next/no-img-element -- blog images come from arbitrary CDN hosts */

// Rendered on first visit, then cached and refreshed in the background (ISR) —
// crawlers get cached HTML instead of waiting on the backend.
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const meta = await getSeoMeta(`/blog/${slug}`);
  return buildMetadata(meta, {
    title: post.meta_title || `${post.title} | Crystaura Blog`,
    description: post.meta_description || post.excerpt?.slice(0, 160),
    path: `/blog/${slug}`,
    image: post.image,
    type: 'article',
  });
}

export default async function BlogPostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const [post, meta] = await Promise.all([getBlogPost(slug), getSeoMeta(`/blog/${slug}`)]);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${slug}`;
  const jsonLd = meta?.jsonLd?.length
    ? meta.jsonLd
    : [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt || '',
          ...(post.image && { image: post.image }),
          datePublished: post.createdAt,
          author: { '@type': 'Person', name: post.author || SITE_NAME },
          publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        },
      ];

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      {/* Back bar */}
      <div className="sticky top-[var(--navbar-height,80px)] z-10 bg-white/90 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Blog
          </Link>
          {post.category && (
            <>
              <span className="text-stone-200">/</span>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">{post.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Hero image */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {post.image && (
          <img src={post.image} alt={post.title} fetchPriority="high" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">

        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {post.category && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
          )}
          {post.date && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
          )}
          {post.author && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
              <User className="w-3 h-3" />
              {post.author}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-stone-800 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-stone-500 leading-relaxed mb-8 border-l-4 border-amber-300 pl-5 italic">
            {post.excerpt}
          </p>
        )}

        <hr className="border-black/6 mb-8" />

        {/* Content (admin-authored HTML from the blog editor) */}
        {post.content ? (
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-stone-400 italic text-center py-8">Content coming soon…</p>
        )}

        {/* ── Remedy CTA ── */}
        {post.taggedProduct && typeof post.taggedProduct === 'object' && (
          <RemedyCTA product={post.taggedProduct} />
        )}

        {/* Bottom back link */}
        <div className="mt-10 pt-8 border-t border-black/6">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-amber-600 font-bold hover:gap-3 transition-all group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to all articles
          </Link>
        </div>
      </article>
    </div>
  );
}

// ── Remedy CTA Card ───────────────────────────────────────────────────────────
function RemedyCTA({ product }: { product: NonNullable<BlogPost['taggedProduct']> }) {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="mt-12 rounded-3xl overflow-hidden border border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-yellow-50 shadow-lg shadow-amber-100/50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-amber-100/80">
        <div className="flex items-center gap-2 text-amber-700">
          <span className="text-xl">✨</span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Recommended Remedy</span>
        </div>
        <p className="text-stone-500 text-sm mt-1.5 leading-snug">
          Based on what you just read, this product is your next step toward transformation.
        </p>
      </div>

      {/* Product card */}
      <div className="p-5 flex items-center gap-5">
        {/* Image */}
        <div className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-white border border-amber-100 shadow-sm">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
          {discount && (
            <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-serif tracking-tight font-bold text-stone-800 text-base leading-snug line-clamp-2 mb-1">
            {product.name}
          </p>
          {product.benefit && (
            <p className="text-[12px] text-stone-500 line-clamp-1 mb-2">{product.benefit}</p>
          )}
          {product.rating != null && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-semibold text-stone-600">{product.rating.toFixed(1)}</span>
              {product.reviewCount != null && (
                <span className="text-[11px] text-stone-400">({product.reviewCount} reviews)</span>
              )}
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-stone-800">₹{formatINR(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-stone-400 line-through">₹{formatINR(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div className="px-5 pb-6">
        <TrackedProductLink
          href={`/product/${product.slug || product._id}`}
          productId={product._id}
          source="blog-post"
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop This Remedy
          <span className="text-amber-200">→</span>
        </TrackedProductLink>
      </div>
    </div>
  );
}
