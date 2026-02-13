"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/home/ProductGrid";
import ProductFilters from "@/components/filters/ProductFilters";
import { useProductFilter } from "@/hooks/useProductFilter";

export default function CollectionsClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Parse category ID from search params
  const initialCategoryId = category ? parseInt(category) : undefined;

  const {
    products,
    categories,
    currentCategory,
    loading,
    error,
    changeCategory
  } = useProductFilter(initialCategoryId);

  const [sortBy, setSortBy] = useState('popularity');

  const handleFilterChange = (filters: {
    category?: number | null;
    tag?: number[];
    brand?: number[];
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
  }) => {
    if (filters.category !== undefined) {
      changeCategory(filters.category || 0);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans py-8">
      <div className="max-w-[1280px] mx-auto px-4 space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {currentCategory ? `Products in ${currentCategory.name}` : search ? `Search results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 font-medium">
            {loading ? 'Loading...' : error ? 'Error loading products' : `${products.length} products found`}
          </p>

          <ProductFilters
            selectedCategory={currentCategory?.id ? parseInt(currentCategory.id) : null}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="w-full">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
