'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ColProductGrid from '@/components/product/ColProductGrid';
import ProductPagination from '@/components/ui/ProductPagination';
import CollectionHeaderBannerLoader from '@/components/banners/CollectionHeaderBannerLoader';
import FilterSidebar from '@/components/filters/FilterSidebar';
import SectionContainer from '@/components/layout/SectionContainer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LazySection from '@/components/ui/LazySection';
import ShopByCategoryCarousel from '@/components/collections/ShopByCategoryCarousel';
import TopBrandsCarousel from '@/components/collections/TopBrandsCarousel';
import Head from 'next/head';
import { Category, Brand } from '@/types/collection';
import { Product } from '@/types/product';
import { useCollectionProducts } from '@/hooks/useCollectionProducts';

interface CollectionPagination {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface CollectionClientProps {
  fullSlug: string;
  category?: Category | null;
  categories: Category[];
  products: Product[];
  initialPagination: CollectionPagination;
  brands: Brand[];
  campaignSlug?: string | null;
}

interface FeaturedBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

const SORT_OPTIONS = [
  { val: 'popularity', label: 'Relevance' },
  { val: 'price_asc', label: 'Price: Low to High' },
  { val: 'price_desc', label: 'Price: High to Low' },
];

export default function CollectionClient({
  fullSlug,
  category,
  categories,
  products: ssrProducts,
  initialPagination,
  brands,
  campaignSlug,
}: CollectionClientProps) {
  const perPage = 20;
  const currentCollectionSlug = category?.slug || fullSlug.split('/').pop() || fullSlug;
  const listingQueryKey = campaignSlug ? 'campaign' : 'collection';
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage || 1);
  const [sortBy, setSortBy] = useState('popularity');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterState, setFilterState] = useState<{
    category?: string | number | null;
    tag?: Array<string | number>;
    brand?: Array<string | number>;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    inStock?: boolean;
    shippingMethodId?: string;
  }>({});
  const [featuredBrands, setFeaturedBrands] = useState<FeaturedBrand[]>([]);
  const [featuredBrandsLoading, setFeaturedBrandsLoading] = useState(false);

  const isL1Collection = !campaignSlug && (category?.parent === 0 || category?.parent === null || category?.parent === undefined);

  const subCategories = useMemo(() => {
    if (!category || !categories.length) return [];
    const match = categories.find(c => String(c.id) === String(category.id));
    if (!match?.children?.length) return [];

    if (isL1Collection) {
      const groups = match.children as Category[];
      return groups.flatMap(g => g.children || []) as Category[];
    }
    return match.children as Category[];
  }, [isL1Collection, category, categories]);

  useEffect(() => {
    if (!currentCollectionSlug) return;
    setFeaturedBrandsLoading(true);
    fetch(`/api/brands/featured?collectionSlug=${currentCollectionSlug}`)
      .then(res => res.json())
      .then(data => {
        setFeaturedBrands(data.brands || []);
      })
      .catch(() => setFeaturedBrands([]))
      .finally(() => setFeaturedBrandsLoading(false));
  }, [currentCollectionSlug]);

  const flattenCategories = useCallback((items: Category[] = []): Category[] => {
    const flattened: Category[] = [];
    items.forEach((item) => {
      flattened.push(item);
      if (item.children?.length) {
        flattened.push(...flattenCategories(item.children));
      }
    });
    return flattened;
  }, []);

  const categoryList = useMemo(() => flattenCategories(categories), [categories, flattenCategories]);
  const selectedCategorySlug = useMemo(() => {
    const categoryId = filterState.category;
    if (categoryId === undefined || categoryId === null || categoryId === '') {
      return currentCollectionSlug;
    }

    return categoryList.find((item) => String(item.id) === String(categoryId))?.slug || currentCollectionSlug;
  }, [categoryList, currentCollectionSlug, filterState.category]);

  const collectionProductsParams = useMemo(() => ({
    listingQueryKey,
    listingValue: campaignSlug || selectedCategorySlug,
    limit: perPage,
    offset: (currentPage - 1) * perPage,
    sortBy,
    brand: filterState.brand?.length ? String(filterState.brand[0]) : undefined,
    onSale: filterState.onSale || undefined,
    inStock: filterState.inStock || undefined,
    shippingMethodId: filterState.shippingMethodId || undefined,
    minPrice: filterState.minPrice,
    maxPrice: filterState.maxPrice,
  }), [
    listingQueryKey, campaignSlug, selectedCategorySlug,
    perPage, currentPage, sortBy,
    filterState.brand, filterState.onSale, filterState.inStock,
    filterState.shippingMethodId, filterState.minPrice, filterState.maxPrice,
  ]);

  const { data: productsData, isLoading: loadingProducts } = useCollectionProducts(
    collectionProductsParams,
    ssrProducts.length > 0 && currentPage === 1 && sortBy === 'popularity' && Object.keys(filterState).length === 0
      ? { products: ssrProducts, pagination: initialPagination }
      : undefined,
  );

  const serverProducts = productsData?.products || [];
  const pagination = productsData?.pagination || initialPagination;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category?.name || fullSlug,
    description: `Products in ${category?.name || 'this collection'}`,
    hasPart: serverProducts.map((p) => ({
      '@type': 'Product',
      name: p.name,
      image: p.image,
      url: `/product/${p.slug}`,
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'KSH',
        availability:
          p.canBuy
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    })),
  };

  const totalPages = pagination.totalPages || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const isLastPage = !pagination.hasMore;
  const handleFilterChange = useCallback((nextFilters: {
    category?: string | number | null;
    tag?: Array<string | number>;
    brand?: Array<string | number>;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    inStock?: boolean;
    shippingMethodId?: string;
  }) => {
    setFilterState(nextFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  const getSortLabel = (val: string) => {
    return SORT_OPTIONS.find(o => o.val === val)?.label || 'Relevance';
  };

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  if (!category && !campaignSlug && categories.length > 0)
    return (
      <div className="container mx-auto px-4 py-10 font-sans text-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600">
          The category path <strong>{fullSlug}</strong> does not exist.
        </p>
      </div>
    );

  return (
    <>
      <Head>
        <title>{category?.name || 'Collection'}</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <SectionContainer className="px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <Breadcrumbs
          paths={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: category?.name || fullSlug, href: '' },
          ]}
        />

        {/* Collection Title */}
        {category && (
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 text-base md:text-lg text-gray-600 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>
        )}

        <CollectionHeaderBannerLoader
          title={category?.name || fullSlug}
          collectionSlug={campaignSlug || currentCollectionSlug}
          campaignSlug={campaignSlug}
        />

        {/* Shop by Category + Top Brands carousels (lazy loaded) */}
        <div className="space-y-8">
          {subCategories.length > 0 && (
            <LazySection
              placeholder={
                <div className="h-50 bg-gray-50 rounded-lg animate-pulse" />
              }
            >
              <ShopByCategoryCarousel
                title="Shop by Category"
                parentSlug={currentCollectionSlug}
                categories={subCategories.map((c: any) => ({
                  id: String(c.id),
                  name: c.name,
                  slug: c.slug,
                  parentSlug: currentCollectionSlug,
                  image: c.asset?.preview || c.asset?.source || null,
                }))}
              />
            </LazySection>
          )}
          <LazySection
            placeholder={
              <div className="space-y-4">
                <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-30 sm:w-35 aspect-4/3 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            }
          >
            {featuredBrandsLoading ? (
              <div className="space-y-4">
                <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-30 sm:w-35 aspect-4/3 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : featuredBrands.length > 0 ? (
              <TopBrandsCarousel
                title="Top Brands"
                brands={featuredBrands}
              />
            ) : null}
          </LazySection>
        </div>

        </SectionContainer>

        {/* Filter Sidebar + Product Grid */}
        <div className="bg-[#F5F5F5] border-t border-gray-200 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block bg-white rounded-md border-2 border-gray-200">
            <div className="sticky top-4 p-4">
              <FilterSidebar
                selectedCategory={filterState.category ?? category?.id ?? null}
                collectionSlug={selectedCategorySlug}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-primary-900" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <FilterSidebar
                    selectedCategory={filterState.category ?? category?.id ?? null}
                    collectionSlug={selectedCategorySlug}
                    onFilterChange={handleFilterChange}
                  />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-primary-900 text-white text-sm font-bold rounded-lg hover:bg-primary-800 transition-colors"
                  >
                    Show Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="space-y-6 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden h-10 px-4 flex items-center gap-2 border border-gray-200 bg-white text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {(filterState.brand?.length || filterState.minPrice !== undefined || filterState.maxPrice !== undefined) && (
                    <span className="w-2 h-2 rounded-full bg-primary-900" />
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  {pagination.total > 0
                    ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`
                    : ''}
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                  className="h-10 px-4 flex items-center gap-2 border border-gray-200 bg-white text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sort by: <span className="font-bold">{getSortLabel(sortBy)}</span>
                  <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded shadow-xl z-40 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="py-1">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            setSortBy(opt.val);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                            sortBy === opt.val ? 'font-bold bg-gray-50 text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <div className="bg-white border border-gray-100 rounded-xl p-16 text-center space-y-8 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">No products found</h2>
                  <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
                    We are currently adding more products to <strong>{category?.name}</strong>. Check back soon for new arrivals!
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
                    href="/"
                    className="inline-flex items-center justify-center px-10 py-4 bg-primary-900 text-white font-black rounded-xl shadow-xl hover:bg-primary-800 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
                  >
                    Shop Popular Items
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
        </div>
        </div>
    </>
  );
}
