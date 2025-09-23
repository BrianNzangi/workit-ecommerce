'use client';

import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import he from 'he';

interface ProductFiltersProps {
  selectedCategory: number | null;
  currentCategoryName?: string; // Display current category name
  onFilterChange: (filters: {
    category?: number | null;
    tag?: number[];
    brand?: number[];
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
  }) => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface Tag {
  id: number;
  name: string;
  count: number;
}

interface Brand {
  id: number;
  name: string;
  count: number;
  slug: string;
}

export default function ProductFilters({ selectedCategory, currentCategoryName, onFilterChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [onSale, setOnSale] = useState(false);
  
  // UI states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: false,
    brands: true,
    tags: false,
    price: false,
    sale: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch categories, tags, and brands
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch categories from API route
        const categoriesRes = await fetch('/api/categories');
        let categoriesData: Category[] = [];
        if (categoriesRes.ok) {
          const rawCategories = await categoriesRes.json();
          // Flatten nested categories
          const flattenCategories = (cats: any[]): Category[] => {
            const flattened: Category[] = [];
            cats.forEach((cat) => {
              flattened.push({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                count: cat.count
              });
              if (cat.children && cat.children.length > 0) {
                flattened.push(...flattenCategories(cat.children));
              }
            });
            return flattened;
          };
          const flattenedCategories = flattenCategories(rawCategories);

          // Filter out "uncategorized" and sort categories with selected one at top
          const filteredCategories = flattenedCategories.filter((cat: Category) =>
            cat.name.toLowerCase() !== 'uncategorized' && cat.slug !== 'uncategorized'
          );

          // Sort categories: selected category first, then by count descending
          categoriesData = filteredCategories.sort((a: Category, b: Category) => {
            if (selectedCategory) {
              if (a.id === selectedCategory) return -1;
              if (b.id === selectedCategory) return 1;
            }
            return b.count - a.count;
          });
        }

        setCategories(categoriesData);

        // For now, we'll set empty arrays for tags and brands since we don't have API routes for them
        // You can add API routes for tags and brands later if needed
        setTags([]);
        setBrands([]);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [selectedCategory]);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      tag: selectedTags.length > 0 ? selectedTags : undefined,
      brand: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      onSale: onSale || undefined,
    });
  }, [selectedCategory, selectedTags, selectedBrands, priceRange, onSale, onFilterChange]);

  const handleCategoryChange = (categoryId: number) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    onFilterChange({ category: newCategory });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleBrandToggle = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedBrands([]);
    setPriceRange({});
    setOnSale(false);
    onFilterChange({ category: null });
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || selectedBrands.length > 0 || priceRange.min || priceRange.max || onSale;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Category Display */}
      {currentCategoryName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-blue-900">Current Category</h3>
          <p className="text-blue-800 text-sm mt-1">{currentCategoryName}</p>
          <button
            onClick={() => onFilterChange({ category: null })}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
          >
            View All Categories
          </button>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Clear All Filters
        </button>
      )}

      {/* Brands */}
      <div className="border-b border-gray-200 pb-4">
        <button 
          onClick={() => toggleSection('brands')} 
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Brands
          </h3>
          {openSections.brands ? <Minus size={16} /> : <Plus size={16} />}
        </button>
        
        {openSections.brands && brands.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {he.decode(brand.name)} ({brand.count})
                </span>
              </label>
            ))}
          </div>
        )}
        {openSections.brands && brands.length === 0 && (
          <p className="text-sm text-gray-500 mt-3">No brands available</p>
        )}
      </div>

      {/* Categories - Only show if not on a specific category page */}
      {!currentCategoryName && (
        <div className="border-b border-gray-200 pb-4">
          <button 
            onClick={() => toggleSection('categories')} 
            className="flex justify-between items-center w-full py-2 text-left"
          >
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Categories
            </h3>
            {openSections.categories ? <Minus size={16} /> : <Plus size={16} />}
          </button>
          
          {openSections.categories && categories.length > 0 && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {categories.map(category => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {he.decode(category.name)} ({category.count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="border-b border-gray-200 pb-4">
        <button 
          onClick={() => toggleSection('tags')} 
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Tags
          </h3>
          {openSections.tags ? <Minus size={16} /> : <Plus size={16} />}
        </button>
        
        {openSections.tags && tags.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {tags.map(tag => (
              <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {he.decode(tag.name)} ({tag.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4">
        <button 
          onClick={() => toggleSection('price')} 
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Price Range
          </h3>
          {openSections.price ? <Minus size={16} /> : <Plus size={16} />}
        </button>
        
        {openSections.price && (
          <div className="mt-3 flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min || ''}
              onChange={(e) => setPriceRange(prev => ({ 
                ...prev, 
                min: e.target.value ? Number(e.target.value) : undefined 
              }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max || ''}
              onChange={(e) => setPriceRange(prev => ({ 
                ...prev, 
                max: e.target.value ? Number(e.target.value) : undefined 
              }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* On Sale */}
      <div>
        <button 
          onClick={() => toggleSection('sale')} 
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Special Offers
          </h3>
          {openSections.sale ? <Minus size={16} /> : <Plus size={16} />}
        </button>
        
        {openSections.sale && (
          <div className="mt-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">On Sale Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
