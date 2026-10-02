'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackProductClick } from '@/lib/api';

// Link to a product that records a click for Admin > Analytics > Product Clicks.
export function TrackedProductLink({ productId, source, onClick, ...props }: ComponentProps<typeof Link> & { productId: string; source: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackProductClick(productId, source);
        onClick?.(e);
      }}
    />
  );
}
