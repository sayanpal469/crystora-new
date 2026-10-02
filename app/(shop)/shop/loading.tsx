import { ProductGridSkeleton } from '@/components/ProductListing';

export default function ShopLoading() {
  return (
    <div className="pt-6 md:pt-12 pb-24 px-3 md:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="h-10 w-64 bg-gray-100 rounded-full animate-pulse mb-3" />
          <p className="text-gray-500">Loading...</p>
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
