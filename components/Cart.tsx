'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ChevronLeft } from 'lucide-react';
import { useStore } from './StoreProvider';
import { fetchShippingConfig, getToken, type ShippingConfig } from '@/lib/api';
import { formatINR, productHref } from '@/lib/utils';

/* eslint-disable @next/next/no-img-element -- product images come from arbitrary CDN hosts */

export function Cart() {
  const router = useRouter();
  const { cart: items, cartReady, updateQuantity, removeFromCart } = useStore();
  const [config, setConfig] = useState<ShippingConfig>({ freeThreshold: 2000, charge: 150, gstPercent: 0 });

  useEffect(() => {
    fetchShippingConfig().then(setConfig);
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= config.freeThreshold ? 0 : config.charge;
  const totalGst = items.reduce((acc, item) => {
    const rate = item.gstRate ?? 0;
    return acc + Math.round(item.price * item.quantity * rate / 100);
  }, 0);
  const total = subtotal + shipping + totalGst;

  const onCheckout = () => {
    router.push(getToken() ? '/checkout' : `/login?redirect=${encodeURIComponent('/checkout')}`);
  };

  // Wait for the saved cart so a full cart never flashes "empty" on load.
  if (!cartReady) return <div className="min-h-screen bg-white" />;

  if (items.length === 0) {
    return (
      <div className="pt-16 md:pt-40 pb-24 px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-10">Looks like you haven&apos;t added any sacred items yet.</p>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-105 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-16 pb-32 md:pb-24 px-3 md:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-12">
          <Link href="/shop" aria-label="Continue shopping" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold">Your Cart</h1>
          <span className="text-gray-400 text-sm font-medium">({items.length})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-16">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="flex gap-3 md:gap-6 p-3 md:p-6 bg-gray-50 rounded-2xl md:rounded-4xl border border-gray-100"
              >
                {/* Image */}
                <Link href={productHref(item)} className="w-20 h-20 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-sm md:text-lg leading-snug line-clamp-2">
                        <Link href={productHref(item)} className="hover:text-saffron transition-colors">{item.name}</Link>
                      </h2>
                      {item.category && (
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 md:mt-0">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 bg-white rounded-full p-0.5 md:p-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 md:w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-bold text-sm md:text-lg">₹{formatINR(item.price * item.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-5 md:p-8 bg-gray-900 text-white rounded-2xl md:rounded-[3rem] shadow-2xl lg:sticky lg:top-24">
              <h2 className="text-lg md:text-2xl font-bold mb-5 md:mb-8">Order Summary</h2>
              <div className="space-y-3 md:space-y-4 mb-5 md:mb-8">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-white font-medium">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {totalGst > 0 && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>GST</span>
                    <span className="text-white font-medium">₹{formatINR(totalGst)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-white/10 flex justify-between text-base md:text-xl font-bold">
                  <span>Total</span>
                  <span className="text-saffron">₹{formatINR(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="w-full py-4 md:py-5 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-105 transition-all flex items-center justify-center gap-3 text-sm md:text-base"
              >
                Checkout Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-widest">
                Secure SSL Encrypted Payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Total</span>
          <span className="font-bold text-saffron text-lg">₹{formatINR(total)}</span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="w-full py-3.5 bg-saffron text-white rounded-full font-bold flex items-center justify-center gap-2 text-sm"
        >
          Checkout Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
