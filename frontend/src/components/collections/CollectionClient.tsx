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

  if (category && products.length === 0)
    return (
      <div className="container mx-auto px-4 py-10 font-sans text-center space-y-4">
        <h1 className="text-3xl font-bold">No products found</h1>
        <p className="text-gray-600">
          We are currently adding more products. Check back soon for new arrivals!
        </p>
        <p className="text-gray-500">Explore other categories while we stock up.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Shop Popular Items
        </Link>
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

      <div className="container mx-auto px-4 py-4 space-y-6">
        <Breadcrumbs
          paths={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: category?.name || fullSlug, href: '' },
          ]}
        />
        <PageBanner title={category?.name || fullSlug} />

        {/* Brands + Sort */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex overflow-x-auto gap-2">
            {brands.slice(0, 8).map((brand) => (
              <a
                key={brand.id}
                href={brand.link || '#'}
                className="flex-shrink-0 border border-gray-200 rounded p-1 w-20 h-20 flex items-center justify-center bg-white"
              >
                {brand.image ? (
                  <Image
                    src={brand.image.src}
                    alt={brand.name}
                    width={64}
                    height={64}
                    className="max-h-16 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-500 text-center">{brand.name}</span>
                )}
              </a>
            ))}
          </div>

          <ProductSorter sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="hidden md:block col-span-1 border border-gray-100 rounded-sm p-4 bg-white shadow-xs self-start">
            <ProductFilters
              selectedCategory={category?.id ?? null}
              collectionSlug={category?.slug}
              onFilterChange={({ category: newCategory }) => {
                console.log('Filter change:', newCategory);
              }}
            />
          </aside>

          <section className="col-span-3">
            <ColProductGrid products={sortedProducts} />

            <ProductPagination
              currentPage={currentPage}
              isLastPage={isLastPage}
              onPageChange={(page) => {
                if (!isLastPage || page < currentPage) setCurrentPage(page);
              }}
            />
          </section>
        </div>
      </div>
    </>
  );
}
