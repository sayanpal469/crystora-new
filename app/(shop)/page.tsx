import type { Metadata } from 'next';
import { HomeView } from '@/components/home/HomeView';
import { getHomepage, getSeoMeta } from '@/lib/server-api';
import { buildMetadata, jsonLdString } from '@/lib/seo';
import { FAQS } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getSeoMeta('/'), { path: '/' });
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default async function HomePage() {
  const data = await getHomepage();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }} />
      <HomeView data={data} />
    </>
  );
}
