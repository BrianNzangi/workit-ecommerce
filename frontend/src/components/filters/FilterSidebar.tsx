'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X, SlidersHorizontal } from 'lucide-react';
import he from 'he';
import { useFilterData } from '@/hooks/useCollections';

interface FilterSidebarProps {
  selectedCategory: string | number | null;
  collectionSlug?: string;
  onFilterChange: (filters: {
    category?: string | number | null;
    tag?: Array<string | number>;
    brand?: Array<string | number>;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    inStock?: boolean;
    shippingMethodId?: string;
  }) => void;
}

interface Category {
  id: string | number;
  name: string;
  slug: string;
  count: number;
  parentId?: string | null;
  children?: Category[];
}

interface Brand {
  id: string | number;
  name: string;
  count: number;
  slug: string;
}

const PRICE_PRESETS = [
  { label: '0 - 1,000', min: 0, max: 1000 },
  { label: '1,000 - 5,000', min: 1000, max: 5000 },
  { label: '5,000 - 10,000', min: 5000, max: 10000 },
  { label: '10,000+', min: 10000, max: undefined },
];

export default function FilterSidebar({
  selectedCategory,
  collectionSlug,
  onFilterChange,
}: FilterSidebarProps) {
  const { data: filterData, isLoading: loading } = useFilterData(collectionSlug);
  const categories = filterData?.categories || [];
  const brands = filterData?.brands || [];

  const [selectedBrands, setSelectedBrands] = useState<Array<string | number>>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string | number>>(new Set());
  const prevCategoryRef = useRef(selectedCategory);

  // Auto-expand category tree to reveal the selected category
  useEffect(() => {
    if (!selectedCategory || selectedCategory === prevCategoryRef.current) return;
    prevCategoryRef.current = selectedCategory;

    const findPath = (tree: Category[], target: string | number): (string | number)[] => {
      for (const node of tree) {
        if (node.id === target) return [];
        if (node.children) {
          const found = findPath(node.children, target);
          if (found !== null) return [node.id, ...found];
        }
      }
      return null as unknown as (string | number)[];
    };

    const path = findPath(categories, selectedCategory);
    if (path) {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        path.forEach(id => next.add(id));
        return next;
      });
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      brand: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
  }, [selectedCategory, selectedBrands, priceRange, onFilterChange]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (id: string | number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBrandToggle = (brandId: string | number) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setPriceRange({});
    onFilterChange({ category: selectedCategory });
  };

  const hasActiveFilters = selectedBrands.length > 0 || priceRange.min !== undefined || priceRange.max !== undefined;

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const isPricePresetActive = (min?: number, max?: number) =>
    priceRange.min === min && priceRange.max === max;

  const renderCategoryNode = (cat: Category, level = 0) => {
    const isSelected = selectedCategory === cat.id;
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCategories.has(cat.id);

    return (
      <div key={cat.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleCategory(cat.id);
            }
            onFilterChange({ category: cat.id });
          }}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded transition-colors ${
            isSelected
              ? 'bg-primary-900/10 text-primary-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <span className="truncate">{he.decode(cat.name)}</span>
          {hasChildren && (
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {cat.children!.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary-900" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary-900 hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between mb-2"
        >
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Category</h4>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.category && (
          <div className="space-y-0.5">
            {categories.map(cat => renderCategoryNode(cat))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between mb-2"
        >
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}
          </h4>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.brand && (
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-900 focus:border-primary-900 outline-none"
              />
              {brandSearch && (
                <button
                  onClick={() => setBrandSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredBrands.map(brand => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                    className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                  />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {he.decode(brand.name)}
                  </span>
                  <span className="text-xs text-gray-400">{brand.count}</span>
                </label>
              ))}
              {filteredBrands.length === 0 && (
                <p className="text-sm text-gray-400 px-2 py-3">No brands found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-2"
        >
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Price Range</h4>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">KSh</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full pl-9 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-900 focus:border-primary-900 outline-none"
                />
              </div>
              <span className="text-gray-300">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">KSh</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ''}
                  onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full pl-9 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-900 focus:border-primary-900 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map(range => (
                <button
                  key={range.label}
                  onClick={() => {
                    if (isPricePresetActive(range.min, range.max)) {
                      setPriceRange({});
                    } else {
                      setPriceRange({ min: range.min, max: range.max });
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    isPricePresetActive(range.min, range.max)
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  KSh {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
