'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface NavSearchProps {
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

// Typing searches live (debounced) — on /shop the query replaces the current URL
// so existing filters stay applied; anywhere else it opens /shop with the query.
export function NavSearch({ className, inputClassName, autoFocus }: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === '/shop' ? searchParams.get('q') ?? '' : '';
  const [query, setQuery] = useState(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the box in sync when the URL changes elsewhere (chip removed, back button…)
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const navigate = (value: string) => {
    const trimmed = value.trim();
    if (pathname === '/shop') {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set('q', trimmed);
      else params.delete('q');
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
    } else if (trimmed) {
      router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const onChange = (value: string) => {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(value), 400);
  };

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        navigate(query);
      }}
    >
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          enterKeyHint="search"
          aria-label="Search products"
          placeholder="Search sacred items…"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          autoFocus={autoFocus}
        />
      </div>
    </form>
  );
}

// Static stand-in rendered on the server while search params are resolved.
export function NavSearchFallback({ className, inputClassName }: Omit<NavSearchProps, 'autoFocus'>) {
  return (
    <div className={className}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input type="text" enterKeyHint="search" aria-label="Search products" placeholder="Search sacred items…" className={inputClassName} readOnly />
      </div>
    </div>
  );
}
