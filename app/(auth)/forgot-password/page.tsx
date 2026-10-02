import type { Metadata } from 'next';
import { ForgotPassword } from '@/components/ForgotPassword';
import { privatePageMetadata } from '@/lib/seo';

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata('/forgot-password', 'Forgot Password');
}

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
