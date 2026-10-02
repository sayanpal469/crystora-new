'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api';
import Image from 'next/image';
import logo from '@/public/logo.png';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      await apiPost('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/mandala.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-primary/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-accent/5 blur-[100px] rounded-full" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="divine-glass p-12 rounded-[3.5rem] border-brand-primary/10 shadow-premium text-center"
            >
              <div className="flex items-center justify-center gap-2.5 mb-8">
                <Image src={logo} alt="Crystaura" className="h-12 w-auto object-contain" />
                <span className="text-xl font-black tracking-widest uppercase bg-linear-to-r from-brand-primary to-amber-600 bg-clip-text text-transparent">CRYSTAURA</span>
              </div>

              <h1 className="text-4xl font-serif font-bold text-text-main mb-4 italic">Reset <span className="text-brand-primary">Blessings</span></h1>
              <p className="text-text-soft text-sm font-medium mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
                Enter your email address and we&apos;ll send you a sacred link to regain your portal access.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-2 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Sacred Email Address"
                    aria-label="Email Address"
                    autoComplete="email"
                    required
                    className="w-full pl-16 pr-6 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 divine-gradient text-white rounded-full font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Send Divine Link<ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <div className="mt-10">
                <Link
                  href="/login"
                  className="text-xs font-bold text-text-muted hover:text-brand-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2 mx-auto w-fit"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Return to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="divine-glass p-12 rounded-[3.5rem] border-brand-primary/10 shadow-premium text-center"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <h2 className="text-4xl font-serif font-bold text-text-main mb-6 italic">Blessings <span className="text-green-600 font-medium">Sent!</span></h2>
              <p className="text-text-soft text-sm font-medium mb-12 leading-relaxed">
                If an account exists for <span className="text-text-main font-bold">{email}</span>, you will receive a reset link shortly. Please check your Inbox and Spam folders.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 p-4 bg-surface-base rounded-2xl border border-brand-primary/5">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">Check your email sanctuary</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-5 bg-text-main text-white rounded-full font-bold shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase"
                >
                  Return to Sanctuary
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
