import type { Metadata } from 'next';
import Link from 'next/link';
import { getSeoMeta } from '@/lib/server-api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getSeoMeta('/privacy-policy'), {
    title: 'Privacy Policy | Crystaura',
    description: 'How Crystaura collects, uses and protects your personal information when you shop with us.',
    path: '/privacy-policy',
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-saffron transition-colors mb-10 uppercase tracking-widest font-bold">
          ← Back
        </Link>

        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-saffron font-bold mb-3">Legal</p>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: May 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p>
              Welcome to Crystaura (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Name, email address, phone number, and billing/shipping address when you create an account or place an order</li>
              <li>Payment information (processed securely through Razorpay — we do not store card details)</li>
              <li>Account credentials (password stored in encrypted form)</li>
              <li>Communications you send us (support queries, feedback)</li>
            </ul>
            <p className="mt-3">We also automatically collect certain technical data such as IP address, browser type, device information, and pages visited via cookies and similar technologies.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To process and fulfil your orders and send related confirmations</li>
              <li>To manage your account and provide customer support</li>
              <li>To send transactional emails (order updates, password resets)</li>
              <li>To improve our products, services, and website experience</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do not sell, trade, or rent your personal information to third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">4. Sharing of Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li><strong>Payment processors</strong> (Razorpay) to complete transactions</li>
              <li><strong>Logistics partners</strong> to deliver your orders</li>
              <li><strong>Cloud service providers</strong> (Cloudinary for image storage)</li>
              <li><strong>Authorities</strong> when required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">5. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to maintain session state, remember your preferences, and analyse site traffic. You can instruct your browser to refuse all cookies, but some parts of the site may not function correctly without them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>Access, correct, or delete your personal data</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Withdraw consent at any time (where processing is based on consent)</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">8. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS, encrypted password storage, and JWT-based authentication to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of our services after any changes constitutes your acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-white border border-gray-100 rounded-2xl">
              <p className="font-bold text-gray-800">Crystaura</p>
              <p className="text-sm mt-1">Email: support@crystaura.com</p>
              <p className="text-sm mt-1">Address: India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
