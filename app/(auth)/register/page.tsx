import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Register } from '@/components/Register';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/register', 'Create Account');
}

export default function RegisterPage() {
  return <Suspense><Register /></Suspense>;
}
