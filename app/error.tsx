'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif font-bold text-text-main mb-4">
          Something went <span className="italic font-medium text-brand-primary">wrong</span>
        </h1>
        <p className="text-text-soft mb-10">We couldn&apos;t load this page. Please try again in a moment.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="px-10 py-4 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-105 transition-all"
          >
            Try Again
          </button>
          <Link href="/" className="px-10 py-4 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
