import type { Metadata } from 'next';
import { Checkout } from '@/components/Checkout';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/checkout', 'Checkout');
}

export default function CheckoutPage() {
  return <Checkout />;
}
