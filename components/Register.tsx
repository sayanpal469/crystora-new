'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from './StoreProvider';
import { cn, safeRedirect } from '@/lib/utils';
import Image from 'next/image';
import logo from '@/public/logo.png';

export function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get('redirect'));
  const { register } = useStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setIsLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password);
      router.replace(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Decoration Side */}
      <div className="hidden lg:flex w-1/2 relative bg-text-main overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545061930-bc9945f74234?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-40 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 via-transparent to-transparent z-10" />

        <div className="relative z-20 text-center p-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-5 mb-10"
          >
            <Image src={logo} alt="Crystaura" className="h-28 w-auto object-contain drop-shadow-2xl" />
            <span className="text-3xl font-black tracking-widest uppercase bg-linear-to-r from-brand-primary to-amber-400 bg-clip-text text-transparent">
              CRYSTAURA
            </span>
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed tracking-wide font-medium uppercase text-[10px]"
          >
            Join a community of 10,000+ devotees. Access exclusive energized artifacts and personalized Vedic guidance.
          </motion.p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative">
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute top-12 left-12 p-3 bg-surface-base hover:bg-white rounded-full border border-brand-primary/10 transition-all hover:scale-110 shadow-sm text-text-soft"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Link>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <div className="flex items-center gap-2.5 mb-8">
              <Image src={logo} alt="Crystaura" className="h-12 w-auto object-contain" />
              <span className="text-xl font-black tracking-widest uppercase bg-linear-to-r from-brand-primary to-amber-600 bg-clip-text text-transparent">CRYSTAURA</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-text-main mb-3">Create <span className="italic font-medium">Account</span></h1>
            <p className="text-text-soft text-sm font-medium">Step into a world of sacred serenity.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 mb-8 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  aria-label="Full Name"
                  autoComplete="name"
                  required
                  className="w-full pl-16 pr-6 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  aria-label="Email Address"
                  autoComplete="email"
                  required
                  className="w-full pl-16 pr-6 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="new-password"
                  required
                  className="w-full pl-16 pr-14 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="px-2">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  className="mt-1 w-4 h-4 accent-brand-primary border-brand-primary/10 rounded"
                />
                <span className="text-[10px] font-bold text-text-soft group-hover:text-text-main transition-colors uppercase tracking-[0.1em] leading-relaxed">
                  I agree to the <Link href="/terms" target="_blank" className="text-brand-primary font-black hover:underline">Sacred Terms</Link> and <Link href="/privacy-policy" target="_blank" className="text-brand-primary font-black hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreeTerms || isLoading}
              className={cn(
                "w-full py-5 text-white rounded-full font-bold transition-all flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase",
                agreeTerms && !isLoading
                  ? "divine-gradient shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-200 cursor-not-allowed opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Begin Journey<ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-text-soft">
            Already a devotee? {' '}
            <Link
              href={redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
              className="text-brand-primary font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
