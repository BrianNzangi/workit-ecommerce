// hooks/useProductFilter.ts
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, ProductFilter, Category } from '@/types/product';

export const useProductFilter = (initialCategoryId?: number) => {
  const [filters, setFilters] = useState<ProductFilter>({});
  const [currentCategoryId, setCurrentCategoryId] = useState<number | undefined>(initialCategoryId);

  // 1. Fetch Categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/collections?includeChildren=true');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return flattenCategories(data);
    },
    staleTime: 1000 * 60 * 30, // Categories don't change often
  });

  // 2. Fetch Products based on current category and filters
  const { data: products = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['products', currentCategoryId, filters],
    queryFn: async () => {
      if (!currentCategoryId) return [];

      const params = new URLSearchParams({
        category: currentCategoryId.toString(),
        per_page: '50'
      });

      if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
      if (filters.onSale) params.append('on_sale', 'true');

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products || [];
    },
    enabled: !!currentCategoryId,
  });

  const categories = categoriesData;
  const currentCategory = useMemo(() =>
    categories.find(cat => parseInt(cat.id) === currentCategoryId) || null,
    [categories, currentCategoryId]
  );
  const error = queryError ? (queryError as Error).message : null;

  // Helper function to flatten nested categories
  const flattenCategories = (categories: any[]): Category[] => {
    const flattened: Category[] = [];

    const flatten = (cats: any[]) => {
      cats.forEach((cat) => {
        flattened.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat._count?.products || 0 // Use _count from database relation
        });
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };

    flatten(categories);
    return flattened;
  };


  const updateFilters = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const changeCategory = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    clearFilters(); // Clear filters when changing category
  };

  return {
    products,
    categories,
    currentCategory,
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
    changeCategory,
  };
};
