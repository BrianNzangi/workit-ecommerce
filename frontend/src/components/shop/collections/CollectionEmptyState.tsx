import Link from 'next/link';
import { Package } from 'lucide-react';

interface CollectionEmptyStateProps {
  categoryName?: string;
  categorySlug?: string;
  parentSlug?: string;
}

export default function CollectionEmptyState({ categoryName, categorySlug, parentSlug }: CollectionEmptyStateProps) {
  const linkHref = parentSlug ? `/shop/collections/${parentSlug}` : '/shop/collections';
  const linkLabel = parentSlug ? `Shop ${categoryName || 'Popular Items'}` : 'Browse Collections';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-16 text-center space-y-8 shadow-sm">
      <div className="space-y-6">
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">No products found</h2>
        <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
          We are currently adding more products to <strong>{categoryName || 'this collection'}</strong>. Check back soon for new arrivals!
        </p>
      </div>

      <div className="pt-6 space-y-8">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gray-200"></span>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
            Explore our popular picks
          </p>
          <span className="h-px w-12 bg-gray-200"></span>
        </div>

        <Link
          href={linkHref}
          className="inline-flex items-center justify-center px-10 py-4 bg-primary-900 text-white font-black rounded-xl shadow-xl hover:bg-primary-800 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
        >
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}
