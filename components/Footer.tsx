import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { shopHref } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2.5 mb-8">
              <Image src={logo} alt="Crystaura" className="h-12 w-auto object-contain" />
              <span className="text-xl font-black tracking-widest uppercase bg-linear-to-r from-brand-primary to-amber-600 bg-clip-text text-transparent">CRYSTAURA</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-8">
              Dedicated to bringing the sacred wisdom and energy of Sanatan into modern homes through authentic spiritual products.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-bold mb-8 uppercase tracking-widest text-[11px]">Shop</h2>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href={shopHref({ bestseller: true })} className="hover:text-saffron transition-colors">Bestsellers</Link></li>
              <li><Link href="/#fresh-arrivals" className="hover:text-saffron transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop" className="hover:text-saffron transition-colors">All Collections</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-bold mb-8 uppercase tracking-widest text-[11px]">Company</h2>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><Link href="/blog" className="hover:text-saffron transition-colors">Blog</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-saffron transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-saffron transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-center gap-6 text-[11px] text-gray-400 uppercase tracking-widest font-bold">
          <p>© {new Date().getFullYear()} Crystaura. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
