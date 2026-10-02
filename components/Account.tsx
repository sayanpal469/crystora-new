'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { User as UserIcon, Package, MapPin, LogOut, ChevronRight, Camera, Loader2 } from 'lucide-react';
import { useStore } from './StoreProvider';

/* eslint-disable @next/next/no-img-element -- avatar is hosted on Cloudinary */

const MotionLink = motion.create(Link);

export function Account() {
  const router = useRouter();
  const { user, logout, updateAvatar: onAvatarChange } = useStore();
  const onLogout = async () => {
    await logout();
    router.push('/');
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await onAvatarChange(file);
    } catch {
      alert('Failed to update profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: <Package className="w-5 h-5" />, title: "My Orders", desc: "Track, return, or buy things again", href: '/orders' },
    { icon: <MapPin className="w-5 h-5" />, title: "Addresses", desc: "Edit addresses for orders and gifts", href: '/addresses' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full divine-gradient p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-saffron" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">{user.name}</h1>
            <p className="text-gray-500 font-medium mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {user.isDivineMember && (
                <span className="px-4 py-1.5 bg-saffron/10 text-saffron text-[10px] font-bold tracking-widest uppercase rounded-full">
                  Divine Member
                </span>
              )}
              <span className="px-4 py-1.5 bg-divine-yellow/10 text-divine-yellow text-[10px] font-bold tracking-widest uppercase rounded-full">
                {user.karmaPoints} Karma Points
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {menuItems.map((item, i) => (
            <MotionLink
              key={i}
              href={item.href}
              whileHover={{ scale: 1.02 }}
              className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-saffron shadow-sm group-hover:bg-saffron group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-saffron transition-colors" />
            </MotionLink>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 text-red-500 font-bold hover:underline"
          >
            <LogOut className="w-5 h-5" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
