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

export default function TopBrandsSection() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brands/homepage-featured')
      .then((res) => res.json())
      .then((data) => {
        setBrands(data.brands || []);
      })
      .catch(() => {
        setBrands([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!brands.length) return null;

  return (
    <SectionContainer className="px-10 sm:px-12 lg:px-16 py-8">
      <TopBrandsCarousel title="Top Brands" brands={brands} />
    </SectionContainer>
  );
}
