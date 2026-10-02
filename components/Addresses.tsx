'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, ChevronLeft, Home, Briefcase, MoreHorizontal } from 'lucide-react';
import type { Address } from '@/lib/types';
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/api';
import { cn } from '@/lib/utils';

const LABELS = ['Home', 'Work', 'Other'];

const labelIcon = (label: string) => {
  if (label === 'Home') return <Home className="w-4 h-4" />;
  if (label === 'Work') return <Briefcase className="w-4 h-4" />;
  return <MoreHorizontal className="w-4 h-4" />;
};

const emptyForm = (): Omit<Address, '_id' | 'id'> => ({
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  isDefault: false,
});

export function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ addresses: Address[] }>('/user/addresses')
      .then(data => setAddresses(data.addresses ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  const getId = (a: Address) => a._id ?? a.id ?? '';

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(getId(a));
    setForm({
      label: a.label,
      firstName: a.firstName,
      lastName: a.lastName,
      phone: a.phone,
      address: a.address,
      city: a.city,
      state: a.state,
      zip: a.zip,
      isDefault: a.isDefault,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.address || !form.city || !form.state || !form.zip) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const data = await apiPut<{ addresses: Address[] }>(`/user/addresses/${editingId}`, form);
        setAddresses(data.addresses ?? []);
      } else {
        const data = await apiPost<{ address: Address }>('/user/addresses', form);
        const newAddr: Address = data.address ?? { ...form, _id: String(Date.now()) };
        if (form.isDefault) {
          setAddresses(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAddr]);
        } else {
          setAddresses(prev => [...prev, newAddr]);
        }
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiDelete(`/user/addresses/${id}`);
      setAddresses(prev => prev.filter(a => getId(a) !== id));
    } catch {
      // keep state
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiPut(`/user/addresses/${id}`, { isDefault: true });
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: getId(a) === id })));
    } catch {
      // fallback: update locally
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: getId(a) === id })));
    }
  };

  const inputClass = "w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm";

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/account" aria-label="Back to account" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Addresses</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your saved delivery addresses</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.length === 0 && !showForm && (
              <div className="text-center py-20 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No saved addresses yet</p>
                <p className="text-sm mt-1">Add one to speed up checkout</p>
              </div>
            )}

            {addresses.map(addr => (
              <motion.div
                key={getId(addr)}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all",
                  addr.isDefault ? "border-saffron bg-saffron/5" : "border-gray-100 bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5",
                      addr.isDefault ? "bg-saffron text-white" : "bg-white text-gray-400 border border-gray-100"
                    )}>
                      {labelIcon(addr.label)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm uppercase tracking-widest text-[11px]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-saffron text-white text-[9px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{addr.firstName} {addr.lastName}</p>
                      <p className="text-gray-500 text-sm">{addr.address}</p>
                      <p className="text-gray-500 text-sm">{addr.city}, {addr.state} — {addr.zip}</p>
                      <p className="text-gray-400 text-sm mt-1">{addr.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(addr)}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-saffron"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(getId(addr))}
                        disabled={deletingId === getId(addr)}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-red-500"
                      >
                        {deletingId === getId(addr)
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(getId(addr))}
                        className="text-[10px] uppercase tracking-widest font-bold text-saffron hover:underline"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add / Edit form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                    <h2 className="font-bold text-lg">{editingId ? 'Edit Address' : 'New Address'}</h2>

                    {/* Label pills */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Label</label>
                      <div className="flex gap-3">
                        {LABELS.map(l => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, label: l }))}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                              form.label === l
                                ? "border-saffron bg-saffron text-white"
                                : "border-gray-200 text-gray-500 hover:border-saffron/50"
                            )}
                          >
                            {labelIcon(l)} {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">First Name *</label>
                        <input className={inputClass} value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Rahul" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Last Name *</label>
                        <input className={inputClass} value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Sharma" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Phone *</label>
                        <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Full Address *</label>
                        <input className={inputClass} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="House no., Street, Area" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">City *</label>
                        <input className={inputClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">State *</label>
                          <input className={inputClass} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">PIN Code *</label>
                          <input className={inputClass} value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} placeholder="400001" />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                        className="w-4 h-4 accent-saffron"
                      />
                      <span className="text-sm font-medium text-gray-600">Set as default delivery address</span>
                    </label>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-saffron text-white rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {editingId ? 'Save Changes' : 'Add Address'}
                      </button>
                      <button onClick={closeForm} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showForm && (
              <button
                onClick={openAdd}
                className="w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-3 text-gray-400 font-bold hover:border-saffron hover:text-saffron transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Add New Address
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
