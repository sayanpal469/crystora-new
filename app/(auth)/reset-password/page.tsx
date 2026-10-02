import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPassword } from '@/components/ResetPassword';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/reset-password', 'Reset Password');
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPassword /></Suspense>;
}
