import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogCard } from '@/components/BlogCard';
import { getBlogPosts, getSeoMeta } from '@/lib/server-api';
import { buildMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/config';

const LIMIT = 9;

const parsePage = (raw: string | string[] | undefined) => {
  const n = Number.parseInt(Array.isArray(raw) ? raw[0] : raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const pageHref = (n: number) => (n > 1 ? `/blog?page=${n}` : '/blog');

export async function generateMetadata({ searchParams }: PageProps<'/blog'>): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const meta = await getSeoMeta('/blog');
  const path = pageHref(page);
  return buildMetadata(meta && { ...meta, canonical: `${SITE_URL}${path}` }, {
    title: 'Spiritual Blog | Crystaura',
    path,
  });
}

export default async function BlogPage({ searchParams }: PageProps<'/blog'>) {
  const page = parsePage((await searchParams).page);
  const { posts, total, pages, failed } = await getBlogPosts(page, LIMIT);

  const navBtn = 'p-2.5 rounded-2xl border border-black/8 text-stone-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-colors';

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-100 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #b45309 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200/60 text-amber-700 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Spiritual Knowledge
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-800 leading-tight mb-5">
            Spiritual <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto leading-relaxed">
            Dive into ancient wisdom, crystal healing, and sacred practices — curated to guide your spiritual journey.
          </p>
          {total > 0 && (
            <p className="text-stone-400 text-sm mt-4 font-medium">{total} article{total !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Error */}
        {failed && (
          <div className="text-center py-24">
            <p className="text-stone-400 mb-4">Failed to load blog posts. Please try again.</p>
            <Link href="/blog" className="text-amber-600 font-semibold hover:underline text-sm">
              Try again
            </Link>
          </div>
        )}

        {/* Empty */}
        {!failed && posts.length === 0 && (
          <div className="text-center py-32">
            <div className="text-6xl mb-6">📿</div>
            <h2 className="text-xl font-bold text-stone-700 mb-2">No articles yet</h2>
            <p className="text-stone-400">Check back soon — sacred wisdom is on its way.</p>
          </div>
        )}

        {/* Grid */}
        {!failed && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <nav aria-label="Pagination" className="flex items-center justify-center gap-3 mt-14">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} aria-label="Previous page" className={navBtn}>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <span aria-disabled="true" className={`${navBtn} opacity-30 pointer-events-none`}>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                )}

                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`w-10 h-10 rounded-2xl text-sm font-bold transition-all flex items-center justify-center ${
                      p === page
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                        : 'border border-black/8 text-stone-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                {page < pages ? (
                  <Link href={pageHref(page + 1)} aria-label="Next page" className={navBtn}>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span aria-disabled="true" className={`${navBtn} opacity-30 pointer-events-none`}>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
