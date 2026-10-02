'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/lib/types';

export function BlogCard({ post }: { post: BlogPost }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group rounded-3xl overflow-hidden border border-black/5 bg-white shadow-sm hover:shadow-lg hover:shadow-amber-100/60 transition-all duration-300 cursor-pointer">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Cover image */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          {!imgError && post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🪷</div>
          )}
          {/* Category badge */}
          {post.category && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-amber-700 border border-amber-100/60 shadow-sm">
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] text-stone-400 font-medium mb-3">
            {post.date && <span>{post.date}</span>}
            {post.author && (
              <>
                <span className="w-1 h-1 rounded-full bg-stone-200" />
                <span>{post.author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="text-stone-800 font-bold text-base leading-snug mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-5">
              {post.excerpt}
            </p>
          )}

          {/* Read more */}
          <div className="flex items-center gap-1.5 text-amber-600 text-sm font-bold group-hover:gap-2.5 transition-all">
            Read article <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}
