'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { OrderDetails } from './OrderDetails';
import { fetchOrderById } from '@/lib/api';
import type { Order } from '@/lib/types';

// Orders are private, so they're loaded in the browser with the user's token.
export function OrderDetailsLoader({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchOrderById(id)
      .then((o) => { if (!cancelled) setOrder(o); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load order'); });
    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto text-center py-24 bg-red-50 rounded-[3rem]">
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <Link href="/orders" className="text-saffron font-bold text-sm hover:underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 pb-24 px-6 bg-white min-h-screen flex items-start justify-center">
        <Loader2 className="w-8 h-8 text-saffron animate-spin" />
      </div>
    );
  }

  return <OrderDetails order={order} />;
}
