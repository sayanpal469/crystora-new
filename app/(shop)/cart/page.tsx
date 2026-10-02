import type { Metadata } from 'next';
import { Cart } from '@/components/Cart';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/cart', 'Your Cart');
}

export default function CartPage() {
  return <Cart />;
}
