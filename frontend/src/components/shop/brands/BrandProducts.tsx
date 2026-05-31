'use client';

import { useState, useMemo, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColProductGrid from '@/components/product/cards/ColProductGrid';
import ProductPagination from '@/components/ui/ProductPagination';
import SectionContainer from '@/components/layout/SectionContainer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Head from 'next/head';
import { Product } from '@/types/product';
import { useBrandProducts } from '@/hooks/useBrandProducts';
import CollectionSortDropdown from '@/components/shop/collections/CollectionSortDropdown';
import BrandHero from './BrandHero';
import BrandEmptyState from './BrandEmptyState';

interface BrandPagination {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface BrandData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  productCount?: number;
}

interface BrandProductsProps {
  brand: BrandData;
  products: Product[];
  initialPagination: BrandPagination;
}

export default function BrandProducts({
  brand,
  products: ssrProducts,
  initialPagination,
}: BrandProductsProps) {
  const perPage = 20;
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage || 1);
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState<{
    onSale?: boolean;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }>({});

  const hasActiveFilters = filterState.onSale || filterState.inStock || filterState.minPrice !== undefined || filterState.maxPrice !== undefined;

  const brandProductsParams = useMemo(() => ({
    brandId: brand.id,
    limit: perPage,
    offset: (currentPage - 1) * perPage,
    sortBy,
    onSale: filterState.onSale || undefined,
    inStock: filterState.inStock || undefined,
    minPrice: filterState.minPrice,
    maxPrice: filterState.maxPrice,
  }), [brand.id, perPage, currentPage, sortBy, filterState]);

  const { data: productsData, isLoading: loadingProducts } = useBrandProducts(
    brandProductsParams,
    ssrProducts.length > 0 && currentPage === 1 && sortBy === 'popularity' && !hasActiveFilters
      ? { products: ssrProducts, pagination: initialPagination }
      : undefined,
  );

  const serverProducts = productsData?.products || [];
  const pagination = productsData?.pagination || initialPagination;

  const toggleFilter = useCallback((key: keyof typeof filterState, value?: number) => {
    setFilterState(prev => {
      const next = { ...prev };
      if (value !== undefined) {
        if (key === 'minPrice') next.minPrice = next.minPrice === value ? undefined : value;
        else if (key === 'maxPrice') next.maxPrice = next.maxPrice === value ? undefined : value;
      } else {
        (next as any)[key] = !(prev as any)[key];
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const setPriceRange = useCallback((min?: number, max?: number) => {
    setFilterState(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= (pagination.totalPages || 1)) {
      setCurrentPage(page);
    }
  }, [pagination.totalPages]);

  const totalPages = pagination.totalPages || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const isLastPage = !pagination.hasMore;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name} Products`,
    description: `Products by ${brand.name}`,
    hasPart: serverProducts.map((p) => ({
      '@type': 'Product',
      name: p.name,
      image: p.image,
      url: `/product/${p.slug}`,
      brand: { '@type': 'Brand', name: brand.name },
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'KSH',
        availability: p.canBuy ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    })),
  };

  return (
    <>
      <Head>
        <title>{brand.name} | Workit</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4 space-y-4">
        <Breadcrumbs
          paths={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brand' },
            { label: brand.name, href: '' },
          ]}
        />

        <BrandHero
          name={brand.name}
          slug={brand.slug}
          logoUrl={brand.logoUrl}
          description={brand.description}
          productCount={brand.productCount}
        />
      </SectionContainer>

      {/* Filter Bar + Product Grid */}
      <section className="bg-[#F7F7F7] border-t border-gray-200 w-full">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Simple Filter Toggles */}
            <div className="bg-white rounded-md border-2 border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-900"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-primary-900" />
                  )}
                </button>

                {showFilters && (
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!filterState.onSale}
                        onChange={() => toggleFilter('onSale')}
                        className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                      />
                      On Sale
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!filterState.inStock}
                        onChange={() => toggleFilter('inStock')}
                        className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                      />
                      In Stock
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min price"
                        value={filterState.minPrice || ''}
                        onChange={e => setPriceRange(e.target.value ? Number(e.target.value) : undefined, filterState.maxPrice)}
                        className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-900 focus:border-primary-900 outline-none"
                      />
                      <span className="text-gray-300 text-sm">—</span>
                      <input
                        type="number"
                        placeholder="Max price"
                        value={filterState.maxPrice || ''}
                        onChange={e => setPriceRange(filterState.minPrice, e.target.value ? Number(e.target.value) : undefined)}
                        className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-900 focus:border-primary-900 outline-none"
                      />
                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary-900 hover:underline font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sort Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                {pagination.total > 0
                  ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`
                  : ''}
              </p>
              <CollectionSortDropdown
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {/* Product Grid */}
            {loadingProducts ? (
              <div className="rounded-xl border border-gray-100 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-900" />
              </div>
            ) : serverProducts.length > 0 ? (
              <div className="space-y-10">
                <ColProductGrid products={serverProducts} />
                <ProductPagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  isLastPage={isLastPage}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <BrandEmptyState brandName={brand.name} />
            )}
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
