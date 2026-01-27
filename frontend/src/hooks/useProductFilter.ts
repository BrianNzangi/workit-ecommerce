// hooks/useProductFilter.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilter, Category } from '@/types/product';

export const useProductFilter = (initialCategoryId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      // Use the correct API endpoint for collections
      const response = await fetch('/api/collections?includeChildren=true');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await response.json();

      // Flatten nested categories for the filter
      const flatCategories = flattenCategories(categoriesData);
      setCategories(flatCategories);

      // Set initial category
      if (initialCategoryId) {
        const category = flatCategories.find((cat: Category) => parseInt(cat.id) === initialCategoryId);
        if (category) setCurrentCategory(category);
      } else if (flatCategories.length > 0) {
        setCurrentCategory(flatCategories[0]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  }, [initialCategoryId]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load products when category or filters change
  useEffect(() => {
    if (currentCategory?.id) {
      loadProducts(parseInt(currentCategory.id), filters);
    }
  }, [currentCategory, filters]);

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

  const loadProducts = async (categoryId: number, productFilters: ProductFilter) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        category: categoryId.toString(),
        per_page: '50'
      });

      // Add filter parameters if they exist
      if (productFilters.minPrice) {
        params.append('min_price', productFilters.minPrice.toString());
      }
      if (productFilters.maxPrice) {
        params.append('max_price', productFilters.maxPrice.toString());
      }
      if (productFilters.onSale) {
        params.append('on_sale', 'true');
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const changeCategory = (categoryId: number) => {
    const category = categories.find(cat => parseInt(cat.id) === categoryId);
    if (category) {
      setCurrentCategory(category);
      clearFilters(); // Clear filters when changing category
    }
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
