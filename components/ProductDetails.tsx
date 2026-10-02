'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Sun, Truck, Minus, Plus, ShoppingBag, ChevronRight, Info, Loader2, X, ArrowLeft } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { useStore } from './StoreProvider';
import { apiFetch, apiPost, getToken } from '@/lib/api';
import { normalizeProduct } from '@/lib/normalize';
import { cn, formatINR, priceWithGst, shopHref } from '@/lib/utils';

/* eslint-disable @next/next/no-img-element -- product images come from arbitrary CDN hosts */

interface ProductDetailsProps {
  product: Product;
  related: Product[];
}

type Tab = 'description' | 'how-to-use' | 'reviews';

export function ProductDetails({ product: initialProduct, related }: ProductDetailsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useStore();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [selectedImage, setSelectedImage] = useState<string>(initialProduct.image);

  // Reset local state when navigating between products (component is reused)
  const [lastId, setLastId] = useState(initialProduct.id);
  if (initialProduct.id !== lastId) {
    setLastId(initialProduct.id);
    setProduct(initialProduct);
    setSelectedImage(initialProduct.image);
    setQuantity(1);
    setActiveTab('description');
  }

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmitting] = useState(false);

  const goLogin = () => router.push(`/login?redirect=${encodeURIComponent(pathname)}`);

  const onBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/shop');
  };

  // Re-fetch after a review so it shows immediately (server copy is cached).
  const refreshProduct = () => {
    apiFetch<{ product: unknown }>(`/products/${product.id}`)
      .then((data) => setProduct(normalizeProduct(data.product ?? data)))
      .catch(() => {});
  };

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const thumbs: string[] = product.images && product.images.length > 1
    ? product.images.slice(0, 4)
    : [product.image, product.image, product.image, product.image];

  const reviewsList = product.reviewsList ?? [];

  return (
    <div className="pt-32 pb-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-saffron transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/shop" className="hover:text-saffron transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category ? (
            <Link href={shopHref({ category: product.category })} className="capitalize hover:text-saffron transition-colors">
              {product.category.replace(/-/g, ' ')}
            </Link>
          ) : (
            <span className="capitalize" />
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Product Images */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 relative group"
            >
              <img
                src={selectedImage}
                alt={product.name}
                fetchPriority="high"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {product.isEnergized && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-saffron text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Pandit Energized
                </div>
              )}
            </motion.div>

            {/* Thumbnail strip — use extra images if available */}
            <div className="grid grid-cols-4 gap-4">
              {thumbs.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setSelectedImage(src)}
                  className={cn(
                    'aspect-square rounded-2xl overflow-hidden bg-gray-50 border cursor-pointer transition-all',
                    selectedImage === src ? 'border-saffron ring-2 ring-saffron/20' : 'border-gray-100 hover:border-gray-300',
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className={cn('w-full h-full object-cover transition-opacity', selectedImage === src ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-saffron/10 text-saffron text-[10px] font-bold tracking-widest uppercase rounded-full">
                  {product.energyLevel} Energy
                </span>
                {product.isBestseller && (
                  <span className="px-3 py-1 bg-divine-yellow/10 text-divine-yellow text-[10px] font-bold tracking-widest uppercase rounded-full">
                    Bestseller
                  </span>
                )}
                {product.isTrending && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold tracking-widest uppercase rounded-full">
                    Trending
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'w-4 h-4',
                          s <= Math.floor(product.rating) ? 'fill-divine-yellow text-divine-yellow' : 'text-gray-200',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-400">{product.reviews} Devotee Reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-10">
              <div className="flex items-baseline gap-4 mb-2 flex-wrap">
                <span className="text-4xl font-bold text-gray-900">₹{formatINR(priceWithGst(product.price, product.gstRate))}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{formatINR(priceWithGst(product.originalPrice, product.gstRate))}</span>
                    <span className="text-saffron font-bold text-sm">{discountPct}% OFF</span>
                  </>
                )}
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">(incl. GST)</span>
              </div>
              {product.gstRate && product.gstRate > 0 ? (
                <p className="text-gray-500 text-sm">
                  Inclusive of ₹{formatINR(Math.round(product.price * product.gstRate / 100))} GST ({product.gstRate}%) &middot; Base price ₹{formatINR(product.price)}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No GST applicable</p>
              )}
            </div>

            {/* Benefit */}
            {product.benefit && (
              <div className="p-6 bg-gray-50 rounded-3xl mb-10 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-saffron" />
                  <span className="font-bold text-sm">Spiritual Benefit</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{product.benefit}</p>
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-200 rounded-full p-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm">
                  <span className={cn('font-bold', product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-orange-500')}>
                    {product.stockStatus}
                  </span>
                  {product.stock != null && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {product.stock > 0 ? `${product.stock} left in stock` : 'Ships in 24-48 hours'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stockStatus === 'Out of Stock'}
                  className="flex-1 py-5 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:bg-saffron-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => { void addToCart(product, quantity); router.push('/checkout'); }}
                  disabled={product.stockStatus === 'Out of Stock'}
                  className="px-8 py-5 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Trust icons */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-saffron mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Sun className="w-6 h-6 text-saffron mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Energized</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-saffron mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-24">
          <div role="tablist" className="flex border-b border-gray-100 mb-10 overflow-x-auto scrollbar-hide">
            {(['description', 'how-to-use', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap',
                  activeTab === tab ? 'text-saffron' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {tab === 'how-to-use' ? 'How to Use' : tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-saffron" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {/* Description stays in the DOM (hidden when inactive) so the full
                product copy is always part of the server-rendered HTML. */}
            <motion.div
              initial={false}
              animate={activeTab === 'description' ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              className={cn('max-w-3xl', activeTab !== 'description' && 'hidden')}
            >
              <p className="text-gray-600 leading-relaxed mb-10 text-lg">{product.description}</p>
              {product.features.length > 0 && (
                <>
                  <h2 className="font-bold text-xl mb-6">Key Features</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {product.crystals && product.crystals.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-bold text-xl mb-2">Crystals &amp; Stones</h2>
                  <p className="text-gray-400 text-sm mb-6">This product contains the following crystals</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.crystals.map((crystal, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-lg">
                          💎
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{crystal.name}</p>
                          {crystal.benefit && (
                            <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{crystal.benefit}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {activeTab === 'how-to-use' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                {product.howToUse ? (
                  <div className="space-y-4">
                    {product.howToUse.split('\n').filter(line => line.trim()).map((line, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-saffron/10 text-saffron flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{line.replace(/^\d+[.)]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No usage instructions available for this product.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Devotee Reviews</h2>
                    <p className="text-gray-500 text-sm">Real experiences from our spiritual community.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => getToken() ? setShowReviewForm(true) : goLogin()}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 text-saffron" />
                    Write a Review
                  </button>
                </div>

                {reviewsList.length > 0 ? (
                  <div className="space-y-6 max-w-3xl">
                    {reviewsList.map((r) => (
                      <div key={r._id} className="p-6 bg-gray-50 rounded-3xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-bold text-sm">
                              {r.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-sm">{r.name}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn('w-3.5 h-3.5', s <= r.rating ? 'fill-divine-yellow text-divine-yellow' : 'text-gray-200')} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                        <p className="text-gray-400 text-xs mt-3">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500 mb-8">Be the first to share your spiritual experience with this item.</p>
                    <button
                      type="button"
                      onClick={() => getToken() ? setShowReviewForm(true) : goLogin()}
                      className="px-8 py-4 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all"
                    >
                      Write a Review
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">You May Also Like</h2>
              <Link
                href={product.category ? shopHref({ category: product.category }) : '/shop'}
                className="text-saffron font-bold flex items-center gap-2 hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} source="details" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowReviewForm(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowReviewForm(false)}
              className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-10">
              <h2 id="review-title" className="text-3xl font-bold mb-2">Write a Review</h2>
              <p className="text-gray-500">Share your experience with this sacred artifact.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!getToken()) {
                goLogin();
                return;
              }
              setIsSubmitting(true);
              try {
                await apiPost(`/products/${product.id}/reviews`, {
                  rating: reviewRating,
                  comment: reviewComment,
                });
                alert('Thank you for your review!');
                setShowReviewForm(false);
                setReviewComment('');
                setReviewRating(5);
                refreshProduct();
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to submit review');
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-8">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={`${s} star${s > 1 ? 's' : ''}`}
                      onClick={() => setReviewRating(s)}
                      className="p-1 transition-transform active:scale-90"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-all',
                          s <= reviewRating ? 'fill-divine-yellow text-divine-yellow' : 'text-gray-200',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Your Experience</label>
                <textarea
                  id="review-comment"
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others how this item helped your spiritual journey..."
                  rows={4}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-5 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Review</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
