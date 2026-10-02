import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

// 404s raised inside the storefront (unknown product / blog post) keep the navbar & footer.
export default function ShopNotFound() {
  return <NotFoundContent />;
}
