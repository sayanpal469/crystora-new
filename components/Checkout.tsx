'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, CreditCard, ShieldCheck,
  MapPin, Mail, ArrowRight, CheckCircle2, Lock, Plus, Home, Briefcase, MoreHorizontal
} from 'lucide-react';
import type { Address } from '@/lib/types';
import { cn, formatINR } from '@/lib/utils';
import { apiPost, apiFetch, fetchShippingConfig, type ShippingConfig, getToken } from '@/lib/api';
import { useStore } from './StoreProvider';

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element -- Razorpay SDK is untyped; product images come from arbitrary CDN hosts */

const labelIcon = (label: string) => {
  if (label === 'Home') return <Home className="w-4 h-4" />;
  if (label === 'Work') return <Briefcase className="w-4 h-4" />;
  return <MoreHorizontal className="w-4 h-4" />;
};

export function Checkout() {
  const router = useRouter();
  const { cart: items, cartReady, user, clearCart } = useStore();
  const onBack = () => router.push('/cart');
  const onLoginRequired = () => router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
  const onComplete = async () => {
    await clearCart();
    router.push('/orders');
  };
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paying, setPaying] = useState(false);
  const [config, setConfig] = useState<ShippingConfig>({ freeThreshold: 2000, charge: 150, gstPercent: 0 });
  const [razorpayKey, setRazorpayKey] = useState('');

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'razorpay' as const,
  });

  useEffect(() => {
    fetchShippingConfig().then(setConfig);
    apiFetch<{ key: string }>('/payment/key').then(d => setRazorpayKey(d.key)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || !getToken()) return;
    apiFetch<{ addresses: Address[] }>('/user/addresses')
      .then(data => {
        const list = data.addresses ?? [];
        setSavedAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) {
          const id = def._id ?? def.id ?? '';
          setSelectedAddressId(id);
          setFormData(prev => ({
            ...prev,
            firstName: def.firstName,
            lastName: def.lastName,
            phone: def.phone,
            address: def.address,
            city: def.city,
            state: def.state,
            zip: def.zip,
          }));
          setShowNewAddressForm(false);
        } else if (list.length === 0) {
          setShowNewAddressForm(true);
        }
      })
      .catch(() => setShowNewAddressForm(true));
  }, [user]);

  // Auto-fill email from logged-in user (adjusted during render when the user changes)
  const [prefilledEmail, setPrefilledEmail] = useState<string | null>(null);
  if (user?.email && prefilledEmail !== user.email) {
    setPrefilledEmail(user.email);
    setFormData(prev => ({ ...prev, email: user.email }));
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= config.freeThreshold ? 0 : config.charge;
  const totalGst = items.reduce((acc, item) => {
    const rate = item.gstRate ?? 0;
    return acc + Math.round(item.price * item.quantity * rate / 100);
  }, 0);
  const total = subtotal + shipping + totalGst;


  const applyAddress = (addr: Address) => {
    const id = addr._id ?? addr.id ?? '';
    setSelectedAddressId(id);
    setFormData(prev => ({
      ...prev,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
    }));
    setShowNewAddressForm(false);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayPayment = async () => {
    if (!user) { onLoginRequired(); return; }
    if (!razorpayKey) {
      alert('Payment gateway not ready. Please refresh and try again.');
      return;
    }
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setPaying(false);
        return;
      }

      const orderItems = items.map(item => ({ productId: item.id, quantity: item.quantity }));
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      };

      // No order is created yet — it's only persisted server-side after payment
      // succeeds (inside the `handler` callback below), so cancelling or failing
      // the Razorpay checkout never leaves a phantom order behind.
      const razorpayData = await apiPost<any>('/payment/create-order', {
        items: orderItems,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      });

      const options = {
        key: razorpayKey,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'Crystaura',
        description: 'Order Payment',
        image: '/logo.png',
        order_id: razorpayData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            const { order } = await apiPost<any>('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: orderItems,
              shippingAddress,
              paymentMethod: formData.paymentMethod,
              receipt: razorpayData.receipt,
            });
            if (typeof (window as any).fbq === 'function') {
              (window as any).fbq(
                'track',
                'Purchase',
                {
                  value: total,
                  currency: 'INR',
                  contents: items.map(i => ({ id: i.id, quantity: i.quantity })),
                  content_type: 'product',
                  num_items: items.reduce((s, i) => s + i.quantity, 0),
                },
                { eventID: order.orderId }
              );
            }
            onComplete();
          } catch {
            alert('Payment succeeded but order confirmation failed. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          orderRef: razorpayData.receipt,
        },
        theme: { color: '#F59E0B' },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', (response: any) => {
        setPaying(false);
        alert(`Payment failed: ${response.error.description}`);
      });
      paymentObject.open();
      setPaying(false);
    } catch (err: any) {
      setPaying(false);
      alert(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (!user) { onLoginRequired(); return; }
    if (step === 1) {
      const { email, phone, firstName, lastName, address, city, state, zip } = formData;
      if (!email.trim()) { setFormError('Email address is required.'); return; }
      if (!phone.trim()) { setFormError('Phone number is required.'); return; }
      if (!firstName.trim()) { setFormError('First name is required.'); return; }
      if (!lastName.trim()) { setFormError('Last name is required.'); return; }
      if (!address.trim()) { setFormError('Address is required.'); return; }
      if (!city.trim()) { setFormError('City is required.'); return; }
      if (!state.trim()) { setFormError('State is required.'); return; }
      if (!zip.trim()) { setFormError('ZIP / Pincode is required.'); return; }
    }
    setFormError('');
    setStep(prev => (prev < 3 ? prev + 1 : prev) as any);
  };
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev) as any);

  if (!cartReady) return <div className="min-h-screen bg-white" />;

  const inputClass = "w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all";

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button type="button" aria-label="Back to cart" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-saffron -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(step - 1) * 50}%` }}
            />
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                  step >= s ? "bg-saffron text-white shadow-lg shadow-saffron/20" : "bg-white border-2 border-gray-100 text-gray-300"
                )}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-bold mt-3",
                  step >= s ? "text-saffron" : "text-gray-300"
                )}>
                  {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form Content */}
          <div className="lg:col-span-7">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              {/* ─── Step 1: Shipping ─── */}
              {step === 1 && (
                <div className="space-y-8">
                  {formError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold">
                      {formError}
                    </div>
                  )}
                  {/* Contact Info */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Mail className="w-6 h-6 text-saffron" /> Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input
                          type="email" name="email" value={formData.email} onChange={handleInputChange}
                          placeholder="your@email.com"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                        <input
                          type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-saffron" /> Delivery Address
                      </h2>

                      <div className="space-y-3 mb-4">
                        {savedAddresses.map(addr => {
                          const id = addr._id ?? addr.id ?? '';
                          const selected = selectedAddressId === id && !showNewAddressForm;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => applyAddress(addr)}
                              className={cn(
                                "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4",
                                selected
                                  ? "border-saffron bg-saffron/5"
                                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
                              )}
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                                selected ? "bg-saffron text-white" : "bg-white text-gray-400 border border-gray-100"
                              )}>
                                {labelIcon(addr.label)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-saffron">Default</span>
                                  )}
                                </div>
                                <p className="font-semibold text-sm">{addr.firstName} {addr.lastName}</p>
                                <p className="text-gray-500 text-sm truncate">{addr.address}, {addr.city}, {addr.state} — {addr.zip}</p>
                                <p className="text-gray-400 text-sm">{addr.phone}</p>
                              </div>
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1",
                                selected ? "border-saffron" : "border-gray-200"
                              )}>
                                {selected && <div className="w-2.5 h-2.5 bg-saffron rounded-full" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Toggle new address form */}
                      <button
                        type="button"
                        onClick={() => { setShowNewAddressForm(v => !v); setSelectedAddressId(''); }}
                        className={cn(
                          "w-full py-4 border-2 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all",
                          showNewAddressForm
                            ? "border-saffron text-saffron bg-saffron/5"
                            : "border-dashed border-gray-200 text-gray-400 hover:border-saffron hover:text-saffron"
                        )}
                      >
                        <Plus className="w-4 h-4" />
                        {showNewAddressForm ? 'Using new address' : 'Use a different address'}
                      </button>
                    </section>
                  )}

                  {/* New Address Form */}
                  <AnimatePresence>
                    {(showNewAddressForm || savedAddresses.length === 0) && (
                      <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <h2 className={cn(
                          "text-2xl font-bold mb-6 flex items-center gap-3",
                          savedAddresses.length > 0 && "hidden"
                        )}>
                          <MapPin className="w-6 h-6 text-saffron" /> Shipping Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">State</label>
                              <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">PIN Code</label>
                              <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className={inputClass} />
                            </div>
                          </div>
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ─── Step 2: Payment ─── */}
              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-saffron" /> Payment Method
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {[{ id: 'razorpay', name: 'Razorpay', icon: <CreditCard className="w-5 h-5" /> }].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id as any }))}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left",
                          formData.paymentMethod === method.id
                            ? "border-saffron bg-saffron/5 shadow-lg shadow-saffron/5"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            formData.paymentMethod === method.id ? "bg-saffron text-white" : "bg-gray-100 text-gray-400"
                          )}>
                            {method.icon}
                          </div>
                          <span className="font-bold">{method.name}</span>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          formData.paymentMethod === method.id ? "border-saffron" : "border-gray-200"
                        )}>
                          {formData.paymentMethod === method.id && <div className="w-3 h-3 bg-saffron rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {formData.paymentMethod === 'razorpay' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100"
                    >
                      <p className="text-sm text-gray-500">
                        You will be redirected to Razorpay&apos;s secure payment gateway. Supports UPI, cards, net banking, and wallets.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ─── Step 3: Review ─── */}
              {step === 3 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold mb-6">Review Order</h2>
                  <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Shipping To</p>
                        <p className="font-bold">{formData.firstName} {formData.lastName}</p>
                        <p className="text-gray-500 text-sm">{formData.address}, {formData.city}</p>
                        <p className="text-gray-500 text-sm">{formData.state}, {formData.zip}</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-saffron font-bold text-xs hover:underline">Edit</button>
                    </div>
                    <div className="flex justify-between items-start pt-8 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Method</p>
                        <p className="font-bold uppercase">{formData.paymentMethod}</p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-saffron font-bold text-xs hover:underline">Edit</button>
                    </div>
                  </div>
                </div>
              )}

              {!user && step === 1 && (
                <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-amber-800">Login required to place order</p>
                    <p className="text-xs text-amber-600 mt-1">
                      You can fill the form now, but you&apos;ll need to{' '}
                      <button onClick={onLoginRequired} className="font-bold underline underline-offset-2">
                        log in
                      </button>{' '}
                      before we can confirm your order.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-12">
                {step > 1 && (
                  <button onClick={prevStep} className="px-8 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    Back
                  </button>
                )}
                <button
                  onClick={step === 3 ? handleRazorpayPayment : nextStep}
                  disabled={paying}
                  className={cn(
                    "ml-auto px-12 py-5 bg-saffron text-white rounded-full font-bold shadow-xl shadow-saffron/20 transition-all flex items-center gap-3",
                    paying ? "opacity-75 cursor-not-allowed" : "hover:scale-105"
                  )}
                >
                  {step === 3 && paying ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Payment...
                    </>
                  ) : (
                    <>
                      {step === 3 ? 'Pay with Razorpay' : !user ? 'Login to Continue' : 'Continue'}
                      {!user && step === 1 ? <Lock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
              <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
              <div className="space-y-6 mb-8 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1">₹{formatINR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {totalGst > 0 && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>GST</span>
                    <span className="font-bold text-gray-900">₹{formatINR(totalGst)}</span>
                  </div>
                )}
                <div className="pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-saffron">₹{formatINR(total)}</span>
                </div>
              </div>

              <div className="mt-10 p-6 bg-white rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Secure Checkout</p>
                  <p className="text-[10px] text-gray-500">Your data is protected by 256-bit SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
