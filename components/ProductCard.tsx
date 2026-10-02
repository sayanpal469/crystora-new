'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ShieldCheck } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatINR, priceWithGst, productHref } from '@/lib/utils';
import { trackProductClick } from '@/lib/api';
import { useStore } from './StoreProvider';

interface ProductCardProps {
  product: Product;
  /** where the card is shown — sent with click analytics */
  source?: string;
}

export function ProductCard({ product, source = 'shop' }: ProductCardProps) {
  const { addToCart } = useStore();
  const outOfStock = product.stockStatus === 'Out of Stock';

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void addToCart(product);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl md:rounded-[3rem] p-3 md:p-5 shadow-premium hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 group relative cursor-pointer border border-brand-primary/5"
    >
      <Link
        href={productHref(product)}
        onClick={() => trackProductClick(product.id, source)}
        className="block"
      >
        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2.5rem] overflow-hidden mb-3 md:mb-8 bg-surface-base">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-text-main/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Badges */}
          <div className="absolute top-2 left-2 md:top-5 md:left-5 flex flex-col gap-1 md:gap-2 z-10">
            {outOfStock && (
              <span className="px-2 py-0.5 md:px-4 md:py-1.5 bg-gray-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-wide rounded-full shadow-lg">Out of Stock</span>
            )}
            {product.isBestseller && (
              <span className="px-2 py-0.5 md:px-4 md:py-1.5 bg-text-main text-white text-[8px] md:text-[9px] font-black uppercase tracking-wide rounded-full shadow-lg">Best</span>
            )}
            {product.isEnergized && (
              <motion.span
                animate={{ boxShadow: ['0 0 0px hsla(30, 100%, 55%, 0)', '0 0 15px hsla(30, 100%, 55%, 0.4)', '0 0 0px hsla(30, 100%, 55%, 0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-0.5 md:px-4 md:py-1.5 bg-brand-primary text-white text-[8px] md:text-[9px] font-black uppercase tracking-wide rounded-full flex items-center gap-1 shadow-glow"
              >
                <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="hidden md:inline">Energized</span>
                <span className="md:hidden">✓</span>
              </motion.span>
            )}
          </div>

          {/* Quick Add to Cart — desktop hover only */}
          {!outOfStock && (
            <div className="hidden md:flex absolute bottom-6 left-6 right-6 flex-col gap-3 translate-y-24 group-hover:translate-y-0 transition-transform duration-500 z-20">
              <button
                type="button"
                onClick={onAdd}
                className="w-full py-4 bg-white text-text-main rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          )}
        </div>

        <div className="px-1 md:px-2">
          <div className="flex items-center justify-between mb-1.5 md:mb-4">
            <span className="text-[8px] md:text-[9px] font-black text-brand-primary uppercase tracking-wide truncate max-w-[70%]">{product.category || ''}</span>
            <div className="flex items-center gap-0.5 text-[9px] font-black text-text-muted bg-surface-base px-1.5 py-0.5 rounded-lg shrink-0">
              <Star className="w-2.5 h-2.5 fill-brand-secondary text-brand-secondary" /> {product.rating || '5.0'}
            </div>
          </div>

          <h3 className="font-bold text-sm md:text-xl mb-1 md:mb-2 text-text-main group-hover:text-brand-primary transition-colors line-clamp-2 font-serif italic tracking-tight leading-snug">{product.name}</h3>

          <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-brand-primary/5 mt-2 md:mt-4">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] font-medium text-text-muted">₹</span>
              <p className="text-base md:text-2xl font-serif font-black text-text-main">{formatINR(priceWithGst(Number(product.price) || 0, product.gstRate))}</p>
            </div>

            {/* Mobile: inline cart button */}
            {!outOfStock && (
              <button
                type="button"
                aria-label={`Add ${product.name} to cart`}
                onClick={onAdd}
                className="md:hidden p-2 bg-brand-primary text-white rounded-xl active:scale-95 transition-transform"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
