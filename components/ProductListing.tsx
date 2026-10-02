'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronDown, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { cn, shopHref, type ShopQuery } from '@/lib/utils';
import { SORT_OPTIONS, shopHeading } from '@/lib/shop';
import type { Product } from '@/lib/types';

interface ProductListingProps {
  query: ShopQuery & { sort: string; page: number };
  products: Product[];
  total: number;
  pages: number;
}

export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl md:rounded-[3rem] p-3 md:p-5 border border-gray-100 animate-pulse">
    <div className="aspect-4/5 rounded-xl md:rounded-[2.5rem] bg-gray-100 mb-3 md:mb-8" />
    <div className="px-1 md:px-2 space-y-2 md:space-y-3">
      <div className="h-2 md:h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-4 md:h-5 bg-gray-100 rounded-full w-3/4" />
      <div className="h-4 md:h-6 bg-gray-100 rounded-full w-1/4 mt-2 md:mt-4" />
    </div>
  </div>
);

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
    {Array.from({ length: 15 }).map((_, i) => <ProductSkeleton key={i} />)}
  </div>
);

const Chip = ({ children, onRemove, tone = 'saffron' }: { children: React.ReactNode; onRemove: () => void; tone?: 'saffron' | 'emerald' | 'teal' }) => (
  <div className={cn(
    'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold',
    tone === 'saffron' && 'bg-saffron/10 text-saffron',
    tone === 'emerald' && 'bg-emerald-50 text-emerald-600',
    tone === 'teal' && 'bg-teal-50 text-teal-600',
  )}>
    {children}
    <button type="button" aria-label="Remove filter" onClick={onRemove} className="hover:text-gray-900 transition-colors">
      <X className="w-3 h-3" />
    </button>
  </div>
);

export function ProductListing({ query, products, total, pages }: ProductListingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const page = query.page;
  const sortIndex = Math.max(0, SORT_OPTIONS.findIndex((o) => o.key === query.sort));

  // Every filter change resets to page 1, like the original listing.
  const go = (next: ShopQuery, opts: { scroll?: boolean } = {}) => {
    startTransition(() => {
      router.push(shopHref({ ...query, page: 1, ...next }), { scroll: opts.scroll ?? false });
    });
  };

  const pageHref = (n: number) => shopHref({ ...query, page: n });

  return (
    <div className="pt-6 md:pt-12 pb-24 px-3 md:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            {query.category && (
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Divine Collection
              </p>
            )}
            <h1 className="text-4xl font-serif font-bold mb-2">
              {shopHeading(query)}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-gray-500">
                {isPending ? 'Loading...' : `Showing ${total} sacred item${total !== 1 ? 's' : ''}`}
              </p>
              {query.category && (
                <Chip onRemove={() => go({ category: undefined, sub: undefined })}>{query.category}</Chip>
              )}
              {query.sub && (
                <Chip onRemove={() => go({ sub: undefined })}>{query.sub}</Chip>
              )}
              {query.purpose && (
                <Chip onRemove={() => go({ purpose: undefined })}>Purpose: {query.purpose}</Chip>
              )}
              {query.rashi && (
                <Chip onRemove={() => go({ rashi: undefined })}>Rashi: {query.rashi}</Chip>
              )}
              {query.bestseller && (
                <Chip tone="emerald" onRemove={() => go({ bestseller: false })}>🏆 Best Sellers</Chip>
              )}
              {query.collection === 'bracelet' && (
                <Chip tone="teal" onRemove={() => go({ collection: undefined })}>💎 Bracelet Collection</Chip>
              )}
              {query.q && (
                <Chip onRemove={() => go({ q: undefined })}>Search: &quot;{query.q}&quot;</Chip>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={sortDropdownOpen}
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                onBlur={() => setTimeout(() => setSortDropdownOpen(false), 150)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:border-saffron transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline">Sort: {SORT_OPTIONS[sortIndex].label}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {sortDropdownOpen && (
                <div role="listbox" className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 w-52 overflow-hidden">
                  {SORT_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.key}
                      type="button"
                      role="option"
                      aria-selected={sortIndex === i}
                      onMouseDown={() => { setSortDropdownOpen(false); go({ sort: opt.key }); }}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-saffron/5 transition-colors',
                        sortIndex === i ? 'text-saffron font-bold' : 'text-gray-700',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isPending ? (
          <ProductGridSkeleton />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
              {products.map(product => (
                <ProductCard key={product.id} product={product} source="shop" />
              ))}
            </div>

            {/* Pagination — real links so every page is crawlable */}
            {pages > 1 && (
              <nav aria-label="Pagination" className="flex items-center justify-center gap-3 mt-16">
                <PageLink
                  href={pageHref(Math.max(1, page - 1))}
                  disabled={page === 1}
                  label="Previous page"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-saffron hover:text-saffron transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </PageLink>

                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const n = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      aria-current={page === n ? 'page' : undefined}
                      className={cn(
                        'w-10 h-10 rounded-full text-sm font-bold transition-all flex items-center justify-center',
                        page === n
                          ? 'bg-saffron text-white shadow-lg shadow-saffron/30'
                          : 'hover:bg-gray-50 text-gray-700 border border-gray-200',
                      )}
                    >
                      {n}
                    </Link>
                  );
                })}

                <PageLink
                  href={pageHref(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  label="Next page"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-saffron hover:text-saffron transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </PageLink>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-[3rem]">
            <div className="w-20 h-20 divine-gradient rounded-full flex items-center justify-center text-white mx-auto mb-6 opacity-20">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No items found</h2>
            <p className="text-gray-500">Try adjusting your filters to find what you&apos;re looking for.</p>
            <Link href="/shop" className="inline-block mt-8 text-saffron font-bold hover:underline">
              Clear all filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PageLink({ href, disabled, label, className, children }: {
  href: string; disabled: boolean; label: string; className: string; children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(className, 'opacity-30 cursor-not-allowed')}>
        {children}
      </span>
    );
  }
  return <Link href={href} aria-label={label} className={className}>{children}</Link>;
}
