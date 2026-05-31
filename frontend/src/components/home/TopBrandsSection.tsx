'use client';

import { useEffect, useState } from 'react';
import TopBrandsCarousel from '@/components/banners/TopBrandsCarousel';
import SectionContainer from '@/components/layout/SectionContainer';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

function LoadingSkeleton() {
  return (
    <SectionContainer className="px-6 sm:px-8 lg:px-16 py-8">
      <div className="space-y-4">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] sm:w-[140px] aspect-4/3 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

export default function TopBrandsSection() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/brands/homepage-featured');
        const data = await res.json();
        const featured = data.brands || [];
        if (featured.length > 0) {
          if (!cancelled) setBrands(featured);
        } else {
          const allRes = await fetch('/api/brands');
          const allBrands = await allRes.json();
          if (!cancelled) setBrands(Array.isArray(allBrands) ? allBrands : []);
        }
      } catch {
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!brands.length) return null;

  return (
    <SectionContainer className="px-6 sm:px-8 lg:px-16 py-8">
      <TopBrandsCarousel title="Top Brands" brands={brands} />
    </SectionContainer>
  );
}
