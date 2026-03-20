'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ColProductGrid from '@/components/product/ColProductGrid';
import ProductFilters from '@/components/filters/ProductFilters';
import ProductPagination from '@/components/ui/ProductPagination';
import CollectionHeaderBanner from '@/components/banners/CollectionHeaderBanner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductSorter from './ProductSorter';
import Head from 'next/head';
import { Category, Brand } from '@/types/collection';
import { Product } from '@/types/product';
import type { StoreBanner } from '@/lib/banner-target';

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
  collectionBanner?: StoreBanner | null;
  campaignSlug?: string | null;
}

export default function CollectionClient({
  fullSlug,
  category,
  categories,
  products,
  initialPagination,
  brands,
  collectionBanner,
  campaignSlug,
}: CollectionClientProps) {
  const perPage = 20;
  const currentCollectionSlug = category?.slug || fullSlug.split('/').pop() || fullSlug;
  const listingQueryKey = campaignSlug ? 'campaign' : 'collection';
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage || 1);
  const [sortBy, setSortBy] = useState('popularity');
  const [serverProducts, setServerProducts] = useState<Product[]>(products);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pagination, setPagination] = useState<CollectionPagination>(initialPagination);
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

  useEffect(() => {
    setServerProducts(products);
  }, [products]);

  useEffect(() => {
    setPagination(initialPagination);
  }, [initialPagination]);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams({
          limit: String(perPage),
          offset: String((currentPage - 1) * perPage),
          sortBy,
        });
        params.set(listingQueryKey, campaignSlug || selectedCategorySlug);

        if (filterState.brand?.length) {
          params.set('brand', String(filterState.brand[0]));
        }
        if (filterState.onSale) {
          params.set('onSale', 'true');
        }
        if (filterState.inStock) {
          params.set('inStock', 'true');
        }
        if (filterState.shippingMethodId) {
          params.set('shippingMethodId', filterState.shippingMethodId);
        }
        if (filterState.minPrice !== undefined) {
          params.set('minPrice', String(filterState.minPrice));
        }
        if (filterState.maxPrice !== undefined) {
          params.set('maxPrice', String(filterState.maxPrice));
        }

        const response = await fetch(`/api/store/products?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setServerProducts(data.products || []);
          setPagination(data.pagination || {
            total: data.products?.length || 0,
            limit: perPage,
            offset: (currentPage - 1) * perPage,
            currentPage,
            totalPages: Math.max(1, Math.ceil((data.products?.length || 0) / perPage)),
            hasMore: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch collection products:', error);
        if (!cancelled) {
          setServerProducts([]);
          setPagination({
            total: 0,
            limit: perPage,
            offset: 0,
            currentPage: 1,
            totalPages: 1,
            hasMore: false,
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    perPage,
    selectedCategorySlug,
    campaignSlug,
    listingQueryKey,
    filterState.brand,
    filterState.inStock,
    filterState.maxPrice,
    filterState.minPrice,
    filterState.onSale,
    filterState.shippingMethodId,
    sortBy,
  ]);

  // JSON-LD for structured data
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

      <div className="max-w-[1280px] mx-auto px-4 py-4 space-y-8">
        <Breadcrumbs
          paths={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: category?.name || fullSlug, href: '' },
          ]}
        />

        <CollectionHeaderBanner
          title={category?.name || fullSlug}
          collectionSlug={campaignSlug || currentCollectionSlug}
          banner={collectionBanner}
        />

        {/* Unified Filter & Sort Toolbar */}
        <div className="space-y-4">
          <ProductFilters
            selectedCategory={filterState.category ?? category?.id ?? null}
            collectionSlug={selectedCategorySlug}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterChange={handleFilterChange}
          />

          {/* Brands Quick-Access (Optional) */}
          {brands.length > 0 && (
            <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
              {brands.slice(0, 10).map((brand) => (
                <a
                  key={brand.id}
                  href={brand.link || '#'}
                  className="shrink-0 border border-gray-100 rounded-lg p-2 w-24 h-24 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {brand.image ? (
                    <Image
                      src={brand.image.src}
                      alt={brand.name}
                      width={80}
                      height={80}
                      className="max-h-20 w-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold text-center px-1">{brand.name}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="w-full">
            {loadingProducts ? (
              <div className="rounded-xl border border-gray-100 bg-white p-16 text-center shadow-sm">
                <p className="text-gray-500">Loading products...</p>
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
          </section>
        </div>
      </div>
    </>
  );
}
