import type { Metadata } from 'next';
import { Addresses } from '@/components/Addresses';
import { RequireAuth } from '@/components/RequireAuth';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/addresses', 'Addresses');
}

export default function AddressesPage() {
  return <RequireAuth><Addresses /></RequireAuth>;
}
