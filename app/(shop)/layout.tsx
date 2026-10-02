import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getNavCategories } from '@/lib/server-api';

// Storefront chrome. Categories are fetched on the server so every category and
// sub-category link is present in the HTML for crawlers.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories();
  return (
    <>
      <Navbar categories={categories} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
