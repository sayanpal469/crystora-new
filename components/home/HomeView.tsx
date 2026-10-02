'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sun, Star, Truck, Heart, ArrowRight, Zap, ChevronDown, User } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { cn, productHref, shopHref } from '@/lib/utils';
import { trackProductClick } from '@/lib/api';
import { FAQS, HERO_SLIDES, PURPOSE_ICON_MAP, RASHI_ICON_MAP, TESTIMONIALS } from '@/lib/constants';
import type { HomepageData } from '@/lib/server-api';
import type { Product } from '@/lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element -- admin-managed homepage JSON; remote images of unknown hosts */

const HeroCarousel = ({ heroSlides: slides }: { heroSlides: any[] }) => {
  const items = slides.length ? slides : HERO_SLIDES;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const slide = items[current];

  return (
    <section className="relative h-[100dvh] md:h-[110vh] md:min-h-[800px] overflow-hidden" aria-roledescription="carousel">
      {/* initial={false}: the first slide is painted immediately (no fade-in from the
          server HTML), which keeps it as a fast Largest Contentful Paint. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <picture>
              {slide.mobileImage && (
                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              )}
              <img
                src={slide.image}
                alt={slide.meta_title || slide.title || ''}
                className="absolute inset-0 w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
                fetchPriority={current === 0 ? 'high' : 'auto'}
              />
            </picture>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

// Admin-controlled homepage "Big Offer" section: exactly 3 poster image cards,
// each optionally tagged to a product from the admin panel.
const OfferSection = ({ cards }: { cards: any[] }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-10 md:py-16 px-4 md:px-12 bg-text-main relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[260px] h-[260px] md:w-[500px] md:h-[500px] bg-brand-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center md:text-left mb-6 md:mb-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2 md:mb-4">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-brand-primary animate-pulse" />
            <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">Limited Sacred Offer</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">Big <span className="text-brand-primary italic">Offer</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card) => {
            const product: Product | null = card.taggedProduct;
            const inner = (
              <>
                <img
                  src={card.image}
                  alt={product?.name || 'Sacred Offer'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              </>
            );
            return (
              <motion.div
                key={card._id}
                whileHover={{ y: -5 }}
                className={cn(
                  'relative rounded-[2rem] overflow-hidden aspect-3/4 w-full max-w-xs mx-auto sm:max-w-none group bg-white/5 border border-white/10',
                  product ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                {product ? (
                  <Link
                    href={productHref(product)}
                    onClick={() => trackProductClick(product.id, 'home')}
                    className="block w-full h-full"
                  >
                    {inner}
                  </Link>
                ) : inner}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ProductGrid = ({ products, gap, source, animation = 'rise' }: { products: Product[]; gap: string; source: string; animation?: 'rise' | 'scale' }) => (
  <div className={cn('grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4', gap)}>
    {products.map((product, i) => (
      <motion.div
        key={product.id}
        initial={animation === 'scale' ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: 30 }}
        whileInView={animation === 'scale' ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * (animation === 'scale' ? 0.1 : 0.08) }}
      >
        <ProductCard product={product} source={source} />
      </motion.div>
    ))}
  </div>
);

const NewArrivals = ({ products }: { products: Product[] }) => {
  if (!products.length) return null;
  return (
    <section id="fresh-arrivals" className="py-16 md:py-32 px-4 md:px-12 bg-surface-base scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-20">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1 bg-brand-secondary/10 text-brand-secondary text-[9px] font-black tracking-widest uppercase rounded-md mb-4">Just Energized</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-text-main leading-tight">Crystaura <span className="text-brand-secondary italic">Bracelet Collection</span></h2>
            <p className="text-text-soft font-light text-lg mt-4">The latest treasures from the Himalayas and traditional artisan clusters.</p>
          </div>
        </div>

        <ProductGrid products={products} gap="gap-4 md:gap-12" source="home" animation="scale" />

        <div className="flex justify-center mt-12">
          <Link href={shopHref({ collection: 'bracelet' })} className="flex items-center gap-3 px-10 py-4 border border-brand-secondary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all">
            Explore All New Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const PyramidCollection = ({ products }: { products: Product[] }) => {
  if (!products.length) return null;
  return (
    <section className="py-16 md:py-40 px-4 md:px-12 bg-white rounded-[5rem] shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-24">
          <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Elite Collection</span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-text-main">Crystaura Pyramid Collection</h2>
          <p className="text-text-soft font-light text-lg">Most sought-after spiritual tools for the modern seeker, and a testament to timeless wisdom.</p>
        </div>

        <ProductGrid products={products} gap="gap-4 md:gap-12" source="home" />

        <div className="mt-20 text-center">
          <Link href={shopHref({ category: 'Space Healing', sub: 'Pyramids' })} className="inline-block px-16 py-5 border border-brand-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm">
            View Full Collection
          </Link>
        </div>
      </div>
    </section>
  );
};

const DomTreeCollection = ({ products }: { products: Product[] }) => {
  if (!products.length) return null;
  return (
    <section className="py-16 md:py-32 px-4 md:px-12 bg-surface-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div>
            <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">You May Also Like</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-text-main leading-tight">
              Crystaura <span className="italic font-medium text-brand-primary">Dom Tree Collection</span>
            </h2>
          </div>
          <Link
            href={shopHref({ category: 'Space Healing', sub: 'Healing Trees' })}
            className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:tracking-[0.2em] transition-all shrink-0"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={products.slice(0, 4)} gap="gap-4 md:gap-10" source="home" />
      </div>
    </section>
  );
};

const ShopByPurpose = ({ purposes }: { purposes: any[] }) => {
  if (!purposes || purposes.length === 0) return null;
  return (
    <section className="py-16 md:py-32 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Spiritual Intention</span>
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-text-main">Shop by <span className="italic font-medium text-brand-primary">Purpose</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {purposes.map((purpose) => (
            <motion.div
              key={purpose._id ?? purpose.id ?? purpose.name}
              whileHover={{ y: -10, scale: 1.02 }}
              className={cn(
                'rounded-4xl md:rounded-[3rem] text-center cursor-pointer transition-all border border-brand-primary/5 group overflow-hidden',
                'bg-gradient-to-br', purpose.color,
              )}
            >
              <Link href={shopHref({ purpose: purpose.name })} className="block p-5 md:p-10">
                <div className="text-3xl md:text-4xl mb-3 md:mb-6 transform group-hover:scale-125 transition-transform duration-500">
                  {PURPOSE_ICON_MAP[purpose.name] ?? purpose.icon}
                </div>
                <h3 className="font-bold text-[10px] md:text-sm tracking-widest uppercase text-text-main mb-2 truncate">{purpose.name}</h3>
                <div className="w-6 md:w-8 h-px bg-text-main/20 mx-auto group-hover:w-12 md:group-hover:w-16 group-hover:bg-brand-primary transition-all duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ShopByRashi = ({ rashis }: { rashis: any[] }) => {
  if (!rashis || rashis.length === 0) return null;
  return (
    <section className="py-16 md:py-32 px-4 md:px-12 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Celestial Guidance</span>
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-text-main">Shop by <span className="italic font-medium text-brand-primary">Rashi</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {rashis.map((rashi) => (
            <motion.div
              key={rashi._id ?? rashi.name}
              whileHover={{ y: -5, scale: 1.05 }}
              className="bg-surface-base rounded-4xl md:rounded-[2.5rem] text-center cursor-pointer shadow-sm border border-brand-primary/5 hover:border-brand-primary/20 transition-all group overflow-hidden"
            >
              <Link href={shopHref({ rashi: rashi.name })} className="block p-4 md:p-8">
                <div className="text-3xl md:text-4xl mb-2 md:mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">
                  {RASHI_ICON_MAP[rashi.name] ?? rashi.icon}
                </div>
                <h3 className="font-bold text-text-main text-[10px] md:text-sm tracking-widest uppercase mb-1 truncate">{rashi.name}</h3>
                <p className="text-[9px] md:text-[10px] text-brand-primary font-medium italic truncate">{rashi.sanskrit}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DivineCollections = ({ products }: { products: Product[] }) => {
  if (!products.length) return null;
  return (
    <section className="py-16 md:py-32 px-4 md:px-12 bg-surface-base">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-20">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-text-main leading-tight">Divine <span className="text-brand-primary italic">Collections</span></h2>
          </div>
        </div>

        <ProductGrid products={products} gap="gap-4 md:gap-10" source="home" />

        <div className="flex justify-center mt-12">
          <Link
            href="/shop"
            className="flex items-center gap-3 px-10 py-4 border border-brand-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const DivineTrust = () => {
  const features = [
    { icon: <ShieldCheck className="w-8 h-8" />, title: 'Authentic Products', desc: '100% genuine items verified by experts.' },
    { icon: <Sun className="w-8 h-8" />, title: 'Pandit Energized', desc: 'Rituals performed by Vedic scholars.' },
    { icon: <Truck className="w-8 h-8" />, title: 'Safe Delivery', desc: 'Secure packaging for sacred items.' },
    { icon: <Heart className="w-8 h-8" />, title: 'Devotee Support', desc: 'Guidance for your spiritual journey.' },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 divine-gradient rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-12 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RitualProcess = () => {
  const steps = [
    { title: 'Ethical Sourcing', desc: 'Hand-selected from Himalayan foothills and artisan clusters.', icon: '🏔️' },
    { title: 'Vedic Cleaning', desc: 'Purified with Panchamrut and Ganga Jal to clear old energies.', icon: '💧' },
    { title: 'Prana Pratishta', desc: 'Blessed with specific Beej Mantras by Vedic scholars.', icon: '✨' },
    { title: 'Sacred Packaging', desc: 'Wrapped in organic cotton with a personal ritual guide.', icon: '📦' },
  ];

  return (
    <section className="py-16 md:py-32 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-24">
          <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">The Journey of Your Artifact</span>
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-text-main">Sacred <span className="italic font-medium text-brand-primary">Preparation</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center relative z-10"
            >
              <div className="w-24 h-24 bg-surface-base rounded-[2rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-sm border border-brand-primary/5 group-hover:bg-brand-primary transition-all">
                {step.icon}
              </div>
              <div className="inline-block px-4 py-1 bg-brand-primary/10 rounded-full text-[9px] font-black tracking-widest text-brand-primary uppercase mb-4">Step 0{i + 1}</div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-text-soft text-sm font-light leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-40 px-4 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-24">
          <span className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Common Queries</span>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={cn(
                'rounded-[3rem] border transition-all duration-500 overflow-hidden',
                openIndex === i ? 'border-brand-primary/30 bg-brand-primary/[0.02]' : 'border-gray-100 bg-white',
              )}
            >
              <button
                type="button"
                aria-expanded={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-6 md:px-10 md:py-10 flex items-center justify-between text-left group"
              >
                <h3 className={cn(
                  'text-xl font-bold transition-colors',
                  openIndex === i ? 'text-brand-primary' : 'text-text-main group-hover:text-brand-primary',
                )}>
                  {faq.question}
                </h3>
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0',
                  openIndex === i ? 'bg-brand-primary text-white rotate-180' : 'bg-surface-base text-text-muted group-hover:bg-brand-primary/10',
                )}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 md:px-10 md:pb-10 text-base md:text-lg text-text-soft font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSlider = () => {
  const [current, setCurrent] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(TESTIMONIALS.length / perPage);

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % pages), 4000);
    return () => clearInterval(t);
  }, [pages]);

  const visible = TESTIMONIALS.slice(current * perPage, current * perPage + perPage);

  return (
    <section className="py-16 md:py-40 px-4 md:px-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-24">
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-text-main">Wall of Devotion</h2>
          <div className="w-32 h-1 bg-brand-primary mx-auto mt-8 opacity-20" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {visible.map((r) => (
              <div
                key={r.name}
                className="relative p-10 bg-surface-base rounded-[3rem] border border-brand-primary/5 group"
              >
                <div className="absolute top-8 right-8 text-[72px] font-serif italic text-brand-primary opacity-5 group-hover:opacity-10 transition-opacity leading-none">&quot;</div>
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-brand-secondary text-brand-secondary" />)}
                </div>
                <p className="text-text-soft italic text-lg mb-10 leading-relaxed">&quot;{r.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-main">{r.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{r.location} · Verified Devotee</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonials page ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-brand-primary' : 'w-2.5 h-2.5 bg-brand-primary/20 hover:bg-brand-primary/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export function HomeView({ data }: { data: HomepageData }) {
  return (
    <div className="bg-surface-base">
      {/* The hero is image-only, so give the page a real (visually hidden) h1 for search engines and screen readers. */}
      <h1 className="sr-only">Crystaura — Authentic Energized Crystals, Rudraksha, Yantras &amp; Spiritual Products</h1>

      <HeroCarousel heroSlides={data.heroSlides} />

      <OfferSection cards={data.offerCards} />

      <NewArrivals products={data.braceletCollection} />

      <PyramidCollection products={data.pyramidCollection} />

      <DomTreeCollection products={data.domTreeCollection} />

      <ShopByPurpose purposes={data.purposes} />

      <ShopByRashi rashis={data.rashis} />

      <DivineCollections products={data.collections} />

      <DivineTrust />

      <RitualProcess />

      <FAQSection />

      <TestimonialsSlider />
    </div>
  );
}
