import type { Metadata } from 'next';
import { Orders } from '@/components/Orders';
import { RequireAuth } from '@/components/RequireAuth';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/orders', 'Your Orders');
}

export default function OrdersPage() {
  return <RequireAuth><Orders /></RequireAuth>;
}
