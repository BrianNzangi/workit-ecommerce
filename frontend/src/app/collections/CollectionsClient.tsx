"use client";

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
    <main className="min-h-screen bg-gray-50 font-[DM_SANS]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters
              selectedCategory={currentCategory?.id || null}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentCategory ? `Products in ${currentCategory.name}` : search ? `Search results for "${search}"` : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {loading ? 'Loading...' : error ? 'Error loading products' : `${products.length} products found`}
              </p>
            </div>

            {error && (
              <div className="text-red-600 mb-4">
                {error}
              </div>
            )}

            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
