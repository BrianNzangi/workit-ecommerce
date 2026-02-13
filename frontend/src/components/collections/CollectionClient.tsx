'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ColProductGrid from '@/components/product/ColProductGrid';
import ProductFilters from '@/components/filters/ProductFilters';
import ProductPagination from '@/components/ui/ProductPagination';
import PageBanner from '@/components/collections/PageBanner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductSorter from './ProductSorter';
import Head from 'next/head';
import { Category, Brand } from '@/types/collection';
import { Product } from '@/types/product';

interface CollectionClientProps {
  fullSlug: string;
  category?: Category | null;
  categories: Category[];
  products: Product[];
  brands: Brand[];
}

export default function CollectionClient({
  fullSlug,
  category,
  categories,
  products,
  brands,
}: CollectionClientProps) {
  const perPage = 20;

  // We can still have local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage] = useState(products.length < perPage);
  const [sortBy, setSortBy] = useState('popularity');


  // JSON-LD for structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category?.name || fullSlug,
    description: `Products in ${category?.name || 'this collection'}`,
    hasPart: products.map((p) => ({
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

  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    }
    return sorted
  }, [products, sortBy])

  if (!category && categories.length > 0)
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

        <PageBanner title={category?.name || fullSlug} />

        {/* Unified Filter & Sort Toolbar */}
        <div className="space-y-4">
          <ProductFilters
            selectedCategory={category?.id ?? null}
            collectionSlug={category?.slug}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterChange={(filters) => {
              console.log('Filters updated:', filters);
            }}
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
            {sortedProducts.length > 0 ? (
              <div className="space-y-10">
                <ColProductGrid products={sortedProducts} />
                <ProductPagination
                  currentPage={currentPage}
                  isLastPage={isLastPage}
                  onPageChange={(page) => {
                    if (!isLastPage || page < currentPage) setCurrentPage(page);
                  }}
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
