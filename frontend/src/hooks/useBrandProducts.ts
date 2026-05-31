'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { Product } from '@/types/product';

interface BrandPagination {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface FetchBrandProductsParams {
  brandId: string;
  limit: number;
  offset: number;
  sortBy: string;
  onSale?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface BrandProductsResponse {
  products: Product[];
  pagination: BrandPagination;
}

async function fetchBrandProducts(params: FetchBrandProductsParams): Promise<BrandProductsResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
    sortBy: params.sortBy,
    brand: params.brandId,
  });

  if (params.onSale) searchParams.set('onSale', 'true');
  if (params.inStock) searchParams.set('inStock', 'true');
  if (params.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));

  const response = await fetch(`/api/store/products?${searchParams.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Failed to fetch brand products: ${response.status}`);
  return response.json();
}

export function useBrandProducts(
  params: FetchBrandProductsParams,
  initialData?: BrandProductsResponse,
) {
  return useQuery({
    queryKey: ['brand-products', params],
    queryFn: () => fetchBrandProducts(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...(initialData ? { initialData } : {}),
  });
}
