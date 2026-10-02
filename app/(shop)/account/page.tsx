import type { Metadata } from 'next';
import { Account } from '@/components/Account';
import { RequireAuth } from '@/components/RequireAuth';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/account', 'My Account');
}

export default function AccountPage() {
  return <RequireAuth><Account /></RequireAuth>;
}
