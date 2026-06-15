import type { Metadata } from 'next';
import BrandProducts from '@/components/shop/brands/BrandProducts';
import { Product } from '@/types/product';
import { SITE_CONFIG } from '@/lib/meta/meta';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { normalizeProducts } from '@/lib/product/product-normalization';

interface Props {
  params: Promise<{ slug: string }>
}

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

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const brandResponse = await proxyFetch(`/store/brands/${slug}`, {
      cache: 'no-store',
      useRequestContext: false,
    });

    if (brandResponse.ok) {
      const data = await brandResponse.json();
      const brand = data.brand as BrandData;

      const title = `${brand.name} | ${SITE_CONFIG.name}`;
      const description = brand.description
        ? brand.description.replace(/<[^>]*>/g, '').trim()
        : `Find the best ${brand.name} products at Workit. Browse our selection with fast delivery and great prices.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${SITE_CONFIG.url}/brand/${slug}`,
          siteName: SITE_CONFIG.name,
          type: "website",
          images: brand.logoUrl ? [{ url: brand.logoUrl, width: 1200, height: 630, alt: brand.name }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch brand for metadata:', error);
  }

  return {
    title: `Brand - ${SITE_CONFIG.name}`,
    description: `Browse products by brand at Workit.`,
    robots: "noindex, nofollow",
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let brand: BrandData | null = null;
  try {
    const brandResponse = await proxyFetch(`/store/brands/${slug}`, {
      cache: 'no-store',
      useRequestContext: false,
    });

    if (brandResponse.ok) {
      const data = await brandResponse.json();
      brand = data.brand as BrandData;
    }
  } catch (error) {
    console.error('Failed to fetch brand:', error);
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Not Found</h1>
          <p className="text-gray-600">The brand you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  let products: Product[] = [];
  let initialPagination: BrandPagination = {
    total: 0,
    limit: 20,
    offset: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  };

  try {
    const productsResponse = await proxyFetch(
      `/store/products?brand=${brand.id}&limit=20&offset=0&sortBy=popularity`,
      {
        cache: 'no-store',
        useRequestContext: false,
      },
    );

    if (productsResponse.ok) {
      const data = await productsResponse.json();
      products = normalizeProducts(data.products || []);
      initialPagination = data.pagination || initialPagination;
    }
  } catch (error) {
    console.error('Failed to fetch brand products:', error);
  }

  return (
    <div className="bg-white min-h-screen">
      <BrandProducts
        brand={brand}
        products={products}
        initialPagination={initialPagination}
      />
    </div>
  );
}
