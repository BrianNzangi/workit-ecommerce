'use client';

import { getImageUrl } from '@/lib/image/image-utils';

interface BrandHeroProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  productCount?: number;
}

export default function BrandHero({ name, slug, logoUrl, description, productCount }: BrandHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white p-3">
        {logoUrl ? (
          <img
            src={getImageUrl(logoUrl)}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-3xl font-bold text-gray-300 uppercase">
            {name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          {name}
        </h1>
        {description && (
          <p className="mt-1 text-sm md:text-base text-gray-600 max-w-3xl">
            {description}
          </p>
        )}
        {productCount !== undefined && (
          <p className="mt-1 text-sm text-gray-500">
            {productCount} product{productCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
