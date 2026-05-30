'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ColProductGrid from '@/components/product/ColProductGrid';
import ProductPagination from '@/components/ui/ProductPagination';
import CollectionHeaderBannerLoader from '@/components/banners/CollectionHeaderBannerLoader';
import FilterSidebar from '@/components/filters/FilterSidebar';
import SectionContainer from '@/components/layout/SectionContainer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LazySection from '@/components/ui/LazySection';
import ShopByCategoryCarousel from '@/components/banners/ShopByCategoryCarousel';
import TopBrandsCarousel from '@/components/banners/TopBrandsCarousel';
import Head from 'next/head';
import { Category, Brand } from '@/types/collection';
import { Product } from '@/types/product';
import { useCollectionProducts } from '@/hooks/useCollectionProducts';
import CollectionSortDropdown from './CollectionSortDropdown';
import CollectionMobileFilterDrawer from './CollectionMobileFilterDrawer';
import CollectionEmptyState from './CollectionEmptyState';

interface CollectionPagination {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface CollectionProductsProps {
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

export default function CollectionProducts({
  fullSlug,
  category,
  categories,
  products: ssrProducts,
  initialPagination,
  brands,
  campaignSlug,
}: CollectionProductsProps) {
  const perPage = 20;
  const currentCollectionSlug = category?.slug || fullSlug.split('/').pop() || fullSlug;
  const listingQueryKey = campaignSlug ? 'campaign' : 'collection';
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage || 1);
  const [sortBy, setSortBy] = useState('popularity');
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

  const buildBreadcrumbs = (cat: Category | null | undefined, allCats: Category[], currentSlug: string) => {
    const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/' }];
    if (!cat) {
      crumbs.push({ label: 'Collections', href: '/shop/collections' }, { label: currentSlug, href: '' });
      return crumbs;
    }

    // Runtime objects have Collection shape (id: string, parentId: string|null)
    // but are typed as Category (id: number, parent: number). Use raw access.
    const toRecord = (c: Category): Record<string, unknown> => c as unknown as Record<string, unknown>;
    const getId = (c: Category): string => String(toRecord(c).id ?? '');
    const getParentId = (c: Category): string | null => {
      const v = toRecord(c).parentId;
      return v != null ? String(v) : null;
    };

    const flatMap = new Map<string, Category>();
    const flatten = (nodes: Category[]) => {
      for (const n of nodes) {
        flatMap.set(getId(n), n);
        if (n.children) flatten(n.children);
      }
    };
    flatten(allCats);

    const ancestors: Category[] = [];
    let pid = getParentId(cat);
    while (pid) {
      const parent = flatMap.get(pid);
      if (!parent) break;
      ancestors.unshift(parent);
      pid = getParentId(parent);
    }

    crumbs.push({ label: 'Collections', href: '/shop/collections' });
    for (const a of ancestors) {
      crumbs.push({ label: a.name, href: `/shop/collections/${a.slug}` });
    }
    crumbs.push({ label: cat.name, href: '' });
    return crumbs;
  };

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

      <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4 space-y-4">
        <Breadcrumbs
          paths={buildBreadcrumbs(category, categories, fullSlug)}
        />

        {/* Collection Title */}
        {category && (
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 text-sm md:text-base text-gray-600 max-w-3xl">
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
        <section className="bg-[#F7F7F7] border-t border-gray-200 w-full">
          <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block bg-white rounded-md border-2 border-gray-200">
            <div className="sticky top-4 p-4">
              <FilterSidebar
                selectedCategory={filterState.category ?? (category ? String((category as unknown as Record<string, unknown>).id ?? '') : null)}
                collectionSlug={selectedCategorySlug}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          <CollectionMobileFilterDrawer
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            selectedCategory={filterState.category ?? (category ? String((category as unknown as Record<string, unknown>).id ?? '') : null)}
            collectionSlug={selectedCategorySlug}
            onFilterChange={handleFilterChange}
          />

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
              <CollectionEmptyState categoryName={category?.name} />
            )}
          </main>
        </div>
        </SectionContainer>
        </section>
    </>
  );
}
