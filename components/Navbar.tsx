'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import logo from '@/public/logo.png';
import { cn, shopHref } from '@/lib/utils';
import type { NavCategory } from '@/lib/server-api';
import { useStore } from './StoreProvider';
import { NavSearch, NavSearchFallback } from './NavSearch';

const DESKTOP_SEARCH = {
  className: 'hidden lg:flex flex-1 max-w-sm mx-10',
  inputClassName:
    'w-full bg-white/95 border border-black/8 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/25 outline-none placeholder:text-text-muted text-text-main shadow-sm',
};

const MOBILE_SEARCH_INPUT =
  'w-full bg-white border border-black/10 rounded-full pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/25 outline-none placeholder:text-text-muted text-text-main';

// How many grid columns for the subcategory list based on count
const subGridCols = (count: number) => {
  if (count <= 3) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-3';
  return 'grid-cols-4';
};

export function Navbar({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const { cartCount } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<NavCategory | null>(null);
  const [openMobileCat, setOpenMobileCat] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close menus whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIsMenuOpen(false);
    setActiveCat(null);
    setOpenMobileCat(null);
  }

  const openMega = (cat: NavCategory) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveCat(cat); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setActiveCat(null), 150); };
  const keepMega = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };

  const closeMobile = () => { setIsMenuOpen(false); setOpenMobileCat(null); };

  const tabClass = (active: boolean) => cn(
    'flex-shrink-0 flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold tracking-wider uppercase border-b-2 transition-all duration-200 whitespace-nowrap',
    active
      ? 'border-brand-primary text-brand-primary'
      : 'border-transparent text-text-soft hover:text-text-main hover:border-brand-primary/40',
  );

  return (
    <nav className="sticky top-0 left-0 right-0 z-50" aria-label="Main">

      {/* ── Row 1: Top bar ── */}
      <div className={cn(
        'bg-white transition-all duration-300',
        isScrolled ? 'shadow-sm' : 'border-b border-black/5',
      )}>
        <div className="max-w-[96%] mx-auto flex items-center justify-between px-2 lg:px-4 h-20 pb-2 lg:h-16 lg:pb-0">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Crystaura home">
            <Image
              src={logo}
              alt="Crystaura"
              priority
              className="h-16 md:h-18 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-base sm:text-xl font-black tracking-widest uppercase bg-linear-to-r from-brand-primary to-amber-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
              CRYSTAURA
            </span>
          </Link>

          {/* Search bar — desktop only, always visible */}
          <Suspense fallback={<NavSearchFallback {...DESKTOP_SEARCH} />}>
            <NavSearch {...DESKTOP_SEARCH} />
          </Suspense>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">

            {/* Search toggle — mobile only */}
            <button
              type="button"
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              onClick={() => setIsSearchOpen(v => !v)}
              className="lg:hidden p-2.5 rounded-xl transition-colors text-text-soft hover:text-text-main hover:bg-black/5"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart${cartCount ? ` (${cartCount} items)` : ''}`}
              className="relative p-2.5 rounded-xl transition-colors text-text-soft hover:text-text-main hover:bg-black/5"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-accent text-white text-[9px] flex items-center justify-center rounded-full font-black px-1"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/account"
              aria-label="My account"
              className="hidden sm:flex p-2.5 rounded-xl transition-colors text-text-soft hover:text-text-main hover:bg-black/5"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(v => !v)}
              className="lg:hidden p-2.5 rounded-xl transition-colors text-text-soft hover:bg-black/5"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search — slides down */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <Suspense fallback={<NavSearchFallback className="px-4 pb-3" inputClassName={MOBILE_SEARCH_INPUT} />}>
                <NavSearch className="px-4 pb-3" inputClassName={MOBILE_SEARCH_INPUT} autoFocus />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Row 2: Category bar — desktop only ── */}
      <div className="hidden lg:block bg-white border-b border-black/8">
        <div className="max-w-[96%] mx-auto px-2">
          <div className="flex items-center overflow-x-auto scrollbar-hide">

            {/* Shop All */}
            <Link href="/shop" className={tabClass(pathname === '/shop' && !activeCat)}>
              Shop All
            </Link>

            {/* Divider pip */}
            <span className="flex-shrink-0 w-px h-4 bg-black/10 mx-1" />

            {/* All categories — no artificial limit */}
            {categories.map(cat => (
              <Link
                key={cat._id}
                href={shopHref({ category: cat.name })}
                onMouseEnter={() => openMega(cat)}
                onMouseLeave={closeMega}
                onFocus={() => openMega(cat)}
                className={tabClass(activeCat?._id === cat._id)}
              >
                {cat.icon && <span className="text-sm leading-none">{cat.icon}</span>}
                <span>{cat.name}</span>
                <ChevronDown className={cn(
                  'w-3 h-3 opacity-50 transition-transform duration-200',
                  activeCat?._id === cat._id && 'rotate-180 opacity-100',
                )} />
              </Link>
            ))}

            {/* Divider pip */}
            <span className="flex-shrink-0 w-px h-4 bg-black/10 mx-1" />

            {/* Blog */}
            <Link href="/blog" className={tabClass(pathname.startsWith('/blog'))}>
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop Mega Menu ── */}
      <AnimatePresence>
        {activeCat && (
          <motion.div
            key={activeCat._id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="hidden lg:block absolute left-0 right-0 bg-white border-b border-black/6 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)]"
            onMouseEnter={keepMega}
            onMouseLeave={closeMega}
          >
            <div className="max-w-7xl mx-auto px-8 py-7">

              {/* Mega header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/5">
                {activeCat.icon && (
                  <span className="text-2xl leading-none">{activeCat.icon}</span>
                )}
                <div>
                  <p className="text-sm font-bold text-text-main leading-tight font-serif tracking-tight">{activeCat.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                    {activeCat.subCategories.length} collections
                  </p>
                </div>
                <Link
                  href={shopHref({ category: activeCat.name })}
                  onClick={() => setActiveCat(null)}
                  className="ml-auto text-xs font-bold text-brand-primary hover:underline underline-offset-2 flex items-center gap-1"
                >
                  View all {activeCat.name} <span className="text-sm">→</span>
                </Link>
              </div>

              {/* Subcategory grid — columns adjust to count */}
              {activeCat.subCategories.length > 0 ? (
                <div className={cn('grid gap-1', subGridCols(activeCat.subCategories.length))}>
                  {activeCat.subCategories.map(sub => (
                    <Link
                      key={sub._id}
                      href={shopHref({ category: activeCat.name, sub: sub.name })}
                      onClick={() => setActiveCat(null)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-saffron-light group text-left transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/25 group-hover:bg-brand-primary transition-colors flex-shrink-0" />
                      <span className="text-sm text-text-soft group-hover:text-text-main transition-colors font-medium">
                        {sub.name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic py-2">No subcategories yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute left-0 right-0 bg-white shadow-xl max-h-[82vh] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-0.5">

              {/* Quick links */}
              <Link href="/" onClick={closeMobile} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-soft transition-colors text-left">
                <span className="text-lg">🏠</span>
                <span className="text-sm font-semibold text-text-main">Home</span>
              </Link>
              <Link href="/shop" onClick={closeMobile} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-soft transition-colors text-left">
                <span className="text-lg">🛍️</span>
                <span className="text-sm font-semibold text-text-main">Shop All Products</span>
              </Link>
              <Link href="/blog" onClick={closeMobile} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-soft transition-colors text-left">
                <span className="text-lg">📖</span>
                <span className="text-sm font-semibold text-text-main">Blog</span>
              </Link>

              {/* Section label */}
              <div className="pt-3 pb-1 px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Categories</p>
              </div>

              {/* Category accordions */}
              {categories.map(cat => (
                <div key={cat._id}>
                  <button
                    type="button"
                    aria-expanded={openMobileCat === cat._id}
                    onClick={() => setOpenMobileCat(openMobileCat === cat._id ? null : cat._id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-soft transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {cat.icon && <span className="text-xl leading-none">{cat.icon}</span>}
                      <span className="text-sm font-semibold text-text-main">{cat.name}</span>
                      <span className="text-[10px] font-medium text-text-muted">
                        {cat.subCategories.length}
                      </span>
                    </span>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-text-muted transition-transform duration-200',
                      openMobileCat === cat._id && 'rotate-180 text-brand-primary',
                    )} />
                  </button>

                  <AnimatePresence>
                    {openMobileCat === cat._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 pl-12 pr-4 flex flex-col gap-1">
                          <Link
                            href={shopHref({ category: cat.name })}
                            onClick={closeMobile}
                            className="flex items-center gap-2 px-3 py-2 text-left"
                          >
                            <span className="text-xs font-bold text-brand-primary">View all {cat.name} →</span>
                          </Link>
                          <div className="grid grid-cols-2 gap-1">
                            {cat.subCategories.map(sub => (
                              <Link
                                key={sub._id}
                                href={shopHref({ category: cat.name, sub: sub.name })}
                                onClick={closeMobile}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-saffron-light text-left transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 shrink-0" />
                                <span className="text-xs font-medium text-text-soft">{sub.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Bottom action buttons */}
              <div className="pt-3 mt-1 border-t border-black/5 grid grid-cols-2 gap-2 pb-2">
                <Link
                  href="/account"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 py-3 bg-surface-soft rounded-xl text-xs font-bold text-text-main hover:bg-surface-deep transition-colors"
                >
                  <User className="w-4 h-4" /> My Account
                </Link>
                <Link
                  href="/cart"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 py-3 divine-gradient rounded-xl text-xs font-bold text-white shadow-[var(--shadow-glow)]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
