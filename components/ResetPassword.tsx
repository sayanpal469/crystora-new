'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api';
import Image from 'next/image';
import logo from '@/public/logo.png';

export function ResetPassword() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await apiPost('/auth/reset-password', { token, newPassword: password });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-primary/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-accent/5 blur-[100px] rounded-full" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
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

              <h1 className="text-4xl font-serif font-bold text-text-main mb-4 italic">
                New <span className="text-brand-primary">Password</span>
              </h1>
              <p className="text-text-soft text-[10px] font-bold uppercase tracking-widest mb-10 leading-relaxed">
                Choose a new sacred password to protect your devotee portal.
              </p>

              {!token && !error && (
                <div className="flex items-center gap-3 p-4 mb-8 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-medium text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>This reset link is missing its token. Please use the link from your email, or request a new one.</span>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-8 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    aria-label="New Password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-16 pr-14 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    aria-label="Confirm New Password"
                    autoComplete="new-password"
                    required
                    className="w-full pl-16 pr-14 py-5 bg-surface-base border border-brand-primary/5 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:bg-white transition-all text-sm font-medium"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 divine-gradient text-white rounded-full font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Reset Password<ArrowRight className="w-5 h-5" /></>
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

              <h2 className="text-4xl font-serif font-bold text-text-main mb-6 italic">
                Password <span className="text-green-600 font-medium">Reset!</span>
              </h2>
              <p className="text-text-soft text-sm font-medium mb-12 leading-relaxed">
                Your password has been updated. You may now sign in with your new credentials.
              </p>

              <Link
                href="/login"
                className="w-full py-5 divine-gradient text-white rounded-full font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase"
              >
                Sign In Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
