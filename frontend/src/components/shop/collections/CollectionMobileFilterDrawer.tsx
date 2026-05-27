'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '@/components/filters/FilterSidebar';

interface CollectionMobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: string | number | null;
  collectionSlug: string;
  onFilterChange: (filters: {
    category?: string | number | null;
    tag?: Array<string | number>;
    brand?: Array<string | number>;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    inStock?: boolean;
    shippingMethodId?: string;
  }) => void;
}

export default function CollectionMobileFilterDrawer({
  open,
  onClose,
  selectedCategory,
  collectionSlug,
  onFilterChange,
}: CollectionMobileFilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary-900" />
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <FilterSidebar
            selectedCategory={selectedCategory}
            collectionSlug={collectionSlug}
            onFilterChange={onFilterChange}
          />
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-900 text-white text-sm font-bold rounded-lg hover:bg-primary-800 transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
