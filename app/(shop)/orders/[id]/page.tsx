import type { Metadata } from 'next';
import { OrderDetailsLoader } from '@/components/OrderDetailsLoader';
import { RequireAuth } from '@/components/RequireAuth';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Order Details',
  robots: noIndex,
};

export default async function OrderDetailsPage({ params }: PageProps<'/orders/[id]'>) {
  const { id } = await params;
  return (
    <RequireAuth>
      <OrderDetailsLoader id={id} />
    </RequireAuth>
  );
}
