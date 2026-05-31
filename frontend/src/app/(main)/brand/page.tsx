'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import SectionContainer from '@/components/layout/SectionContainer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getImageUrl } from '@/lib/image/image-utils';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  count?: number;
}

function BrandDirectoryPage() {
  const { data: brands = [], isLoading } = useQuery<BrandItem[]>({
    queryKey: ['brands-directory'],
    queryFn: async () => {
      const res = await fetch('/api/brands', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch brands');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-16">
          <div className="space-y-8">
            <div className="h-12 w-64 bg-gray-100 animate-pulse rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </SectionContainer>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-16">
          <Breadcrumbs paths={[{ label: 'Home', href: '/' }, { label: 'Brands' }]} />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-6 mb-4">Shop by Brand</h1>
          <p className="text-gray-500">No brands available yet.</p>
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SectionContainer className="px-10 sm:px-12 lg:px-16 py-16">
        <Breadcrumbs paths={[{ label: 'Home', href: '/' }, { label: 'Brands' }]} />

        <div className="mt-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Shop by Brand
          </h1>
          <p className="mt-2 text-gray-600">
            Browse products from {brands.length} brand{brands.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white p-3 mb-4">
                {brand.logoUrl ? (
                  <img
                    src={getImageUrl(brand.logoUrl)}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-300 uppercase">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-900 transition-colors">
                {brand.name}
              </h3>
              {brand.count !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {brand.count} product{brand.count !== 1 ? 's' : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}

export default function BrandPage() {
  return <BrandDirectoryPage />;
}
