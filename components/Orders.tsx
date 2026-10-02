'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Package, ChevronRight, CheckCircle2, Truck, XCircle, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { fetchOrders } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';

/* eslint-disable @next/next/no-img-element -- product images come from arbitrary CDN hosts */

const statusIcon = (status: Order['status']) => {
  if (status === 'Delivered') return <CheckCircle2 className="w-4 h-4" />;
  if (status === 'Cancelled') return <XCircle className="w-4 h-4" />;
  return <Truck className="w-4 h-4" />;
};

const statusColor = (status: Order['status']) => {
  if (status === 'Delivered') return 'text-green-600';
  if (status === 'Cancelled') return 'text-red-500';
  return 'text-saffron';
};

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchOrders(1)
      .then(({ orders, pages }) => { setOrders(orders); setPages(pages); setPage(1); })
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = () => {
    setLoadingMore(true);
    fetchOrders(page + 1)
      .then(({ orders: more, pages: p }) => {
        setOrders(prev => [...prev, ...more]);
        setPages(p);
        setPage(prev => prev + 1);
      })
      .catch((err) => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold">Your Orders</h1>
          <Link href="/shop" className="text-saffron font-bold text-sm hover:underline">
            Continue Shopping
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-saffron animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-24 bg-red-50 rounded-[3rem]">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-[3rem]">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-gray-500">Your spiritual journey starts with your first order.</p>
            <Link
              href="/shop"
              className="inline-block mt-8 px-10 py-4 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 hover:scale-105 transition-all"
            >
              Explore Collection
            </Link>
          </div>
        )}

        <div className="space-y-8">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 group hover:shadow-xl transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-saffron shadow-sm">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{order.id}</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{order.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Status</p>
                    <div className={cn('flex items-center gap-2 text-sm font-bold', statusColor(order.status))}>
                      {statusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                  {order.awbCode && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">AWB</p>
                      <p className="text-xs font-bold text-gray-700 font-mono">{order.awbCode}</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total</p>
                    <p className="text-lg font-bold">₹{formatINR(order.total)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex -space-x-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-50 bg-white overflow-hidden shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {item.name[0]}
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-full border-4 border-gray-50 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <Link
                  href={`/orders/${order._id ?? order.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-saffron transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {page < pages && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="px-10 py-4 border-2 border-gray-200 rounded-full font-bold text-sm hover:border-saffron hover:text-saffron transition-all disabled:opacity-60 flex items-center gap-3"
            >
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              Load More Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
