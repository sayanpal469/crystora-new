import Link from 'next/link';
import { Search } from 'lucide-react';

export function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 divine-gradient rounded-full flex items-center justify-center text-white mx-auto mb-8 opacity-30">
          <Search className="w-10 h-10" />
        </div>
        <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">404</p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-4">
          Page <span className="italic font-medium text-brand-primary">Not Found</span>
        </h1>
        <p className="text-text-soft mb-10">
          The sacred item or page you&apos;re looking for has moved or no longer exists.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="px-10 py-4 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-105 transition-all">
            Browse Collection
          </Link>
          <Link href="/" className="px-10 py-4 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
