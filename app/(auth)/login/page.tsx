import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Login } from '@/components/Login';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/login', 'Sign In');
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
