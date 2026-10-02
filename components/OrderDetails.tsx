'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Truck, CheckCircle2,
  MapPin, CreditCard, ArrowLeft,
  ExternalLink, HelpCircle, XCircle,
  RefreshCw
} from 'lucide-react';
import type { Order } from '@/lib/types';
import { cn, formatINR } from '@/lib/utils';
import { fetchShipmentStatus } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element -- Shiprocket payload is untyped; product images come from arbitrary CDN hosts */

interface TrackActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

interface LiveTracking {
  courierName: string;
  currentStatus: string;
  currentCity: string;
  currentState: string;
  edd: string;
  activities: TrackActivity[];
}

const formatTimelineDate = (ts?: string) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const formatActivityDate = (ts: string) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const statusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 'text-green-600 bg-green-50';
  if (s.includes('out for delivery')) return 'text-blue-600 bg-blue-50';
  if (s.includes('transit') || s.includes('in transit')) return 'text-saffron bg-saffron/10';
  if (s.includes('pickup') || s.includes('picked')) return 'text-purple-600 bg-purple-50';
  if (s.includes('cancel')) return 'text-red-600 bg-red-50';
  return 'text-gray-600 bg-gray-100';
};

export function OrderDetails({ order }: { order: Order }) {
  const [liveTracking, setLiveTracking] = useState<LiveTracking | null>(null);
  const orderId = order._id || order.id;
  const isShipped = ['Shipped', 'Delivered'].includes(order.status) || !!order.awbCode;
  const courierName = order.courierName;

  // One order per mount, so loading starts true whenever tracking will be fetched.
  const [trackingLoading, setTrackingLoading] = useState(isShipped && !!orderId);
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    if (!isShipped || !orderId) return;

    fetchShipmentStatus(orderId)
      .then((res: any) => {
        if (res?.status === 'not_shipped') return;

        const track = res?.liveTracking?.tracking_data?.shipment_track?.[0];
        if (!track) return;

        setLiveTracking({
          courierName: track.courier_name || courierName || '',
          currentStatus: track.status || '',
          currentCity: track.current_city || '',
          currentState: track.current_state || '',
          edd: track.edd || '',
          activities: (track.shipment_track_activities || []).map((a: any) => ({
            date: a.date || '',
            status: a.status || '',
            activity: a.activity || '',
            location: a.location || '',
          })),
        });
      })
      .catch(() => setTrackingError('Could not load live tracking. Try again later.'))
      .finally(() => setTrackingLoading(false));
  }, [orderId, isShipped, courierName]);

  const timeline = order.timeline || [];
  const findEntry = (status: string) => timeline.find((t) => t.status === status);

  const confirmedEntry = timeline[0];
  const processingEntry = findEntry('Processing');
  const shippedEntry = findEntry('Shipped');
  const deliveredEntry = findEntry('Delivered');

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  const steps = [
    {
      label: 'Confirmed',
      date: confirmedEntry ? formatTimelineDate(confirmedEntry.timestamp) : '',
      icon: <CheckCircle2 className="w-5 h-5" />,
      completed: true,
    },
    {
      label: 'Processing',
      date: processingEntry ? formatTimelineDate(processingEntry.timestamp) : '',
      icon: <Package className="w-5 h-5" />,
      completed: !isCancelled,
    },
    {
      label: 'Shipped',
      date: shippedEntry ? formatTimelineDate(shippedEntry.timestamp) : '',
      icon: <Truck className="w-5 h-5" />,
      completed: isShipped,
    },
    {
      label: 'Delivered',
      date: deliveredEntry ? formatTimelineDate(deliveredEntry.timestamp) : '',
      icon: <CheckCircle2 className="w-5 h-5" />,
      completed: isDelivered,
    },
  ];

  const addr = order.shippingAddress;
  const subtotal = order.subtotal ?? order.total;
  const shippingCost = order.shipping ?? 0;

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-saffron font-bold mb-8 transition-colors group w-fit"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">Order {order.id}</h1>
              <span className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                order.status === 'Delivered' ? "bg-green-100 text-green-600" :
                order.status === 'Cancelled' ? "bg-red-100 text-red-500" :
                "bg-saffron/10 text-saffron"
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-gray-500 font-medium">Placed on {order.date}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Invoice
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Get Help
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Order Progress Steps */}
            <section className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
              <h2 className="text-xl font-bold mb-8">Tracking Status</h2>
              {isCancelled ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-500">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Order Cancelled</p>
                    {findEntry('Cancelled') && (
                      <p className="text-xs mt-0.5 opacity-70">{formatTimelineDate(findEntry('Cancelled')!.timestamp)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col md:flex-row justify-between gap-8">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
                  {steps.map((step, i) => (
                    <div key={i} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500",
                        step.completed ? "bg-saffron text-white shadow-saffron/20" : "bg-white text-gray-300 border-2 border-gray-100"
                      )}>
                        {step.icon}
                      </div>
                      <div className="md:mt-4 md:text-center">
                        <p className={cn("font-bold text-sm", step.completed ? "text-gray-900" : "text-gray-300")}>{step.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AWB + courier pills */}
              {order.awbCode && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Shipment Details</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">AWB Number</p>
                      <p className="font-bold text-sm font-mono">{order.awbCode}</p>
                    </div>
                    {order.courierName && (
                      <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Courier</p>
                        <p className="font-bold text-sm">{order.courierName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Live Shiprocket Tracking */}
            {isShipped && (
              <section className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Live Tracking</h2>
                  {trackingLoading && (
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {trackingError && (
                  <p className="text-sm text-red-400 mb-4">{trackingError}</p>
                )}

                {trackingLoading && !liveTracking && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                )}

                {liveTracking && (
                  <>
                    {/* Courier header card */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 mb-6">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Courier Partner</p>
                        <p className="font-bold text-lg">{liveTracking.courierName}</p>
                        {liveTracking.currentCity && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Currently at {liveTracking.currentCity}{liveTracking.currentState ? `, ${liveTracking.currentState}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                          statusColor(liveTracking.currentStatus)
                        )}>
                          {liveTracking.currentStatus}
                        </span>
                        {liveTracking.edd && (
                          <p className="text-xs text-gray-500 font-medium">
                            Expected by <span className="text-gray-900 font-bold">
                              {new Date(liveTracking.edd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Scan activity timeline */}
                    {liveTracking.activities.length > 0 && (
                      <div className="relative">
                        {/* vertical line */}
                        <div className="absolute left-4.75 top-2 bottom-2 w-0.5 bg-gray-200" />
                        <div className="space-y-0">
                          {liveTracking.activities.map((a, i) => (
                            <div key={i} className="relative flex gap-5 pb-6 last:pb-0">
                              {/* dot */}
                              <div className={cn(
                                "relative z-10 mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                i === 0
                                  ? "bg-saffron text-white shadow-md shadow-saffron/20"
                                  : "bg-white border-2 border-gray-200 text-gray-400"
                              )}>
                                {i === 0 ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                              </div>

                              <div className={cn(
                                "flex-1 p-4 rounded-2xl border transition-all",
                                i === 0
                                  ? "bg-white border-saffron/20 shadow-sm"
                                  : "bg-white border-gray-100"
                              )}>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                  <div>
                                    <p className={cn(
                                      "font-bold text-sm",
                                      i === 0 ? "text-gray-900" : "text-gray-600"
                                    )}>
                                      {a.activity}
                                    </p>
                                    {a.location && (
                                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {a.location}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap shrink-0">
                                    {formatActivityDate(a.date)}
                                  </p>
                                </div>
                                {a.status && a.status.toLowerCase() !== a.activity.toLowerCase() && (
                                  <span className={cn(
                                    "inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                    statusColor(a.status)
                                  )}>
                                    {a.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {liveTracking.activities.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">No scan activity yet. Check back soon.</p>
                    )}
                  </>
                )}

                {!trackingLoading && !liveTracking && !trackingError && (
                  <p className="text-sm text-gray-400 text-center py-6">Tracking details will appear once the shipment is picked up.</p>
                )}
              </section>
            )}

            {/* Items */}
            <section>
              <h2 className="text-xl font-bold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.length > 0 ? order.items.map((item, i) => (
                  <div key={item.id || i} className="flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-md transition-all">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold group-hover:text-saffron transition-colors">{item.name}</h3>
                      {item.category && <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{formatINR(item.price)}</p>
                      <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 bg-gray-50 rounded-3xl text-center text-gray-500 italic">
                    No items found.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <section className="p-8 bg-gray-900 text-white rounded-[3rem] shadow-xl">
              <h2 className="text-xl font-bold mb-6">Payment Details</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Shipping</span>
                  <span className="text-white font-bold">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-saffron">₹{formatINR(order.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                <CreditCard className="w-5 h-5 text-saffron" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    Paid via {order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod || 'Online'}
                  </p>
                  <p className="text-xs font-bold capitalize">{order.paymentStatus || 'completed'}</p>
                </div>
              </div>
            </section>

            {addr && (
              <section className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-saffron shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{addr.firstName} {addr.lastName}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">
                      {addr.address}<br />
                      {addr.city}, {addr.state} {addr.zip}<br />
                      India
                    </p>
                    <p className="text-gray-500 text-xs mt-3 font-bold">+91 {addr.phone}</p>
                    <p className="text-gray-400 text-xs mt-1">{addr.email}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
