'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useStore } from './StoreProvider';

// Sends signed-out visitors to /login and brings them back here afterwards.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authReady && !user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [authReady, user, router, pathname]);

  if (!authReady || !user) {
    return (
      <div className="pt-32 pb-24 px-6 bg-white min-h-screen flex items-start justify-center">
        <Loader2 className="w-8 h-8 text-saffron animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
