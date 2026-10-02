import type { Metadata } from 'next';
import Link from 'next/link';
import { getSeoMeta } from '@/lib/server-api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getSeoMeta('/terms'), {
    title: 'Terms & Conditions | Crystaura',
    description: 'The terms and conditions that govern your use of the Crystaura website and purchases.',
    path: '/terms',
  });
}

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-saffron transition-colors mb-10 uppercase tracking-widest font-bold">
          ← Back
        </Link>

        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-saffron font-bold mb-3">Legal</p>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-400">Last updated: May 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Crystaura website and services, you agree to be bound by these Terms &amp; Conditions. If you do not agree to all of these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">2. Use of the Website</h2>
            <p>You agree to use the website only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>Use the site in any way that violates applicable local, national, or international laws</li>
              <li>Transmit unsolicited or unauthorised advertising material</li>
              <li>Attempt to gain unauthorised access to our systems or data</li>
              <li>Engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">3. Account Registration</h2>
            <p>
              To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use of your account. We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">4. Products and Pricing</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any product at any time without notice. All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time. In the event of a pricing error, we reserve the right to cancel orders placed at the incorrect price and offer a refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">5. Orders and Payment</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All orders are subject to acceptance and availability</li>
              <li>We accept payment via credit/debit cards, UPI, net banking, and cash on delivery (where available)</li>
              <li>Payments are processed securely through Razorpay</li>
              <li>We reserve the right to refuse or cancel any order for any reason, including suspected fraud</li>
              <li>Free shipping is available on orders above ₹2,000; a flat shipping fee of ₹150 applies otherwise</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">6. Delivery</h2>
            <p>
              Estimated delivery times are provided in good faith but are not guaranteed. Crystaura is not liable for delays caused by logistics partners, natural events, or other circumstances beyond our control. Risk of loss or damage passes to you upon delivery of the product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">7. Cancellations</h2>
            <p>
              Orders may be cancelled before they are dispatched. Once dispatched, cancellations are not accepted. To request a cancellation, please contact our support team as soon as possible with your order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">8. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, graphics, logos, and product descriptions — is the property of Crystaura and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">9. Karma Points</h2>
            <p>
              Karma Points are a loyalty reward offered at our sole discretion. They have no monetary value, cannot be transferred, and may be modified or discontinued at any time without notice. Points are governed by the terms specified in our loyalty programme documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">10. Disclaimer of Warranties</h2>
            <p>
              Products are provided &quot;as is.&quot; Crystaura makes no representations or warranties of any kind, express or implied, regarding the accuracy of product descriptions or the fitness of products for any particular spiritual or other purpose. Product images are illustrative; actual items may vary slightly due to handcrafted or natural material variations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">11. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Crystaura shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products. Our total liability to you for any claim shall not exceed the amount paid for the specific product giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">12. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-3">13. Contact Us</h2>
            <p>For questions about these Terms &amp; Conditions, please reach out to us:</p>
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
