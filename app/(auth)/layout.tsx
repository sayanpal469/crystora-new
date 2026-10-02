import type { Metadata } from 'next';
import { noIndex } from '@/lib/seo';

// Sign-in flows render full-screen without the storefront navbar/footer.
export const metadata: Metadata = { robots: noIndex };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
