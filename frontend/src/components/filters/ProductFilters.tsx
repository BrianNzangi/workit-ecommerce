import { useEffect, useState, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal, Plus, Minus, X, Tag as TagIcon, LayoutGrid, DollarSign } from 'lucide-react';
import he from 'he';

interface ProductFiltersProps {
  selectedCategory: string | number | null;
  currentCategoryName?: string;
  collectionSlug?: string;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
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

interface Tag {
  id: string | number;
  name: string;
  count: number;
}

interface Brand {
  id: string | number;
  name: string;
  count: number;
  slug: string;
}

export default function ProductFilters({
  selectedCategory,
  currentCategoryName,
  collectionSlug,
  sortBy,
  onSortChange,
  onFilterChange
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedTags, setSelectedTags] = useState<Array<string | number>>([]);
  const [selectedBrands, setSelectedBrands] = useState<Array<string | number>>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [onSale, setOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [shippingMethodId, setShippingMethodId] = useState<string | undefined>(undefined);

  // UI states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDropdown = (key: string) => {
    setActiveDropdown(prev => (prev === key ? null : key));
  };

  // Fetch categories, tags, and brands
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const categoriesRes = await fetch('/api/collections?includeChildren=true');
        let categoriesData: Category[] = [];
        if (categoriesRes.ok) {
          const rawCategories = await categoriesRes.json();
          const flattenCategories = (cats: any[]): Category[] => {
            const flattened: Category[] = [];
            cats.forEach((cat) => {
              flattened.push({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                count: cat._count?.products || 0,
                parentId: cat.parentId,
                children: cat.children ? flattenCategories(cat.children) : []
              });
            });
            return flattened;
          };
          categoriesData = flattenCategories(rawCategories).filter(cat => !cat.parentId);
        }
        setCategories(categoriesData);

        const brandsUrl = collectionSlug
          ? `/api/brands?collection=${collectionSlug}`
          : '/api/brands';

        const brandsRes = await fetch(brandsUrl);
        let brandsData: Brand[] = [];
        if (brandsRes.ok) {
          const brands = await brandsRes.json();
          brandsData = brands
            .map((brand: any) => ({
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              count: brand.count || 0
            }))
            .filter((brand: Brand) => brand.count > 0);
        }
        setBrands(brandsData);
        setTags([]);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, [selectedCategory, collectionSlug]);

  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      tag: selectedTags.length > 0 ? selectedTags : undefined,
      brand: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      onSale: onSale || undefined,
      inStock: inStock || undefined,
      shippingMethodId: shippingMethodId,
    });
  }, [selectedCategory, selectedTags, selectedBrands, priceRange, onSale, inStock, shippingMethodId, onFilterChange]);

  const handleBrandToggle = (brandId: string | number) => {
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
    setInStock(false);
    setShippingMethodId(undefined);
    onFilterChange({});
  };

  const offersCollections = useMemo(() => {
    return categories.filter(cat => !cat.parentId && (!cat.children || cat.children.length === 0));
  }, [categories]);

  const isOffersActive = useMemo(() => {
    if (offersCollections.length === 0) return false;
    return offersCollections.some(oc => selectedCategory === oc.id);
  }, [offersCollections, selectedCategory]);

  const handleOffersToggle = () => {
    if (offersCollections.length > 0) {
      onFilterChange({
        category: offersCollections[0].id,
        tag: selectedTags.length > 0 ? selectedTags : undefined,
        brand: selectedBrands.length > 0 ? selectedBrands : undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        onSale: true,
      });
      setActiveDropdown(null);
    }
  };

  const getSortLabel = (val: string) => {
    switch (val) {
      case 'popularity': return 'Relevance';
      case 'price_asc': return 'Price: Low to High';
      case 'price_desc': return 'Price: High to Low';
      default: return 'Relevance';
    }
  };

  const renderCategoryItem = (cat: Category, level = 0) => {
    const isSelected = selectedCategory === cat.id;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <div key={cat.id} className="w-full">
        <button
          onClick={() => onFilterChange({ category: cat.id })}
          className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-primary-900/10 text-primary-900 font-bold border border-primary-900/20' : 'hover:bg-gray-50 text-gray-700'}`}
          style={{ paddingLeft: `${(level * 12) + 12}px` }}
        >
          <span className="flex items-center gap-2">
            {level > 0 && <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
            {he.decode(cat.name)}
          </span>
          <span className={`text-xs ${isSelected ? 'text-primary-900' : 'opacity-60'}`}>({cat.count})</span>
        </button>
        {hasChildren && (
          <div className="mt-1">
            {cat.children!.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Common button styles to match the image
  const buttonBaseClass = "h-14 px-5 flex items-center justify-center border border-gray-200 bg-white text-sm font-medium transition-all hover:bg-gray-50 active:bg-gray-100 min-w-[120px]";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 relative">

        {/* Sort Dropdown */}
        <div className="relative group/sort">
          <button
            onClick={() => toggleDropdown('sort')}
            className={`${buttonBaseClass} justify-between! min-w-[180px]`}
          >
            <span className="text-gray-900 group-hover/sort:text-black">
              Sort by: <span className="font-bold">{getSortLabel(sortBy)}</span>
            </span>
            <ChevronDown size={16} className={`ml-2 transition-transform ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'sort' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="py-1">
                {[
                  { val: 'popularity', label: 'Relevance' },
                  { val: 'price_asc', label: 'Price: Low to High' },
                  { val: 'price_desc', label: 'Price: High to Low' }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      onSortChange(opt.val);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${sortBy === opt.val ? 'font-bold bg-gray-50' : 'text-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Filter */}
        <button className={buttonBaseClass}>New</button>

        {/* Offers & Clearance Dropdown - Hidden if no suitable collections */}
        {offersCollections.length > 0 && (
          <div className="relative group/offers">
            <button
              onClick={() => toggleDropdown('offers')}
              className={`${buttonBaseClass} ${isOffersActive ? 'border-primary-900 bg-primary-50 text-primary-900 font-bold' : ''}`}
            >
              <span>Offers & Clearance</span>
              <ChevronDown size={16} className={`ml-2 transition-transform ${activeDropdown === 'offers' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'offers' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <button
                    onClick={handleOffersToggle}
                    className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors hover:bg-gray-50 ${isOffersActive ? 'bg-primary-50 text-primary-900 font-bold' : 'text-gray-700'}`}
                  >
                    Shop top 100 deals
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Dropdown */}
        <div className="relative group/pricing">
          <button
            onClick={() => toggleDropdown('pricing')}
            className={`${buttonBaseClass} justify-between! ${(priceRange.min !== undefined || priceRange.max !== undefined) ? 'border-primary-900 bg-primary-50 text-primary-900 font-bold' : ''}`}
          >
            <span>Pricing</span>
            <ChevronDown size={16} className={`ml-2 transition-transform ${activeDropdown === 'pricing' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'pricing' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1">
                {[
                  { label: "0 - 1,000", min: 0, max: 1000 },
                  { label: "1,000 - 5,000", min: 1000, max: 5000 },
                  { label: "5,000 - 10,000", min: 5000, max: 10000 },
                  { label: "10,000+", min: 10000, max: undefined }
                ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setPriceRange({ min: range.min, max: range.max });
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors hover:bg-gray-50 ${(priceRange.min === range.min && priceRange.max === range.max) ? 'bg-primary-50 text-primary-900 font-bold' : 'text-gray-700'}`}
                  >
                    KSh {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brands Dropdown */}
        <div className="relative group/brands">
          <button
            onClick={() => toggleDropdown('brands')}
            className={`${buttonBaseClass} justify-between! ${selectedBrands.length > 0 ? 'border-primary-900 bg-primary-50 text-primary-900 font-bold' : ''}`}
          >
            <span>Brands {selectedBrands.length > 0 && `(${selectedBrands.length})`}</span>
            <ChevronDown size={16} className={`ml-2 transition-transform ${activeDropdown === 'brands' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'brands' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {brands.map(brand => (
                  <label key={brand.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => handleBrandToggle(brand.id)}
                      className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-black">
                      {he.decode(brand.name)} <span className="text-gray-400 ml-1">({brand.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Filters Button - Right Aligned */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`${buttonBaseClass} ml-auto min-w-0!`}
        >
          <SlidersHorizontal size={18} className="mr-2" />
          All filters
        </button>
      </div>

      {/* Slide-from-right Filter Drawer */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-100 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-101 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary-900" />
                All Filters
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

              {/* Categories Section */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <LayoutGrid size={14} />
                  Categories
                </h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map(cat => renderCategoryItem(cat))}
                </div>
              </section>

              {/* Price Range Section */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <DollarSign size={14} />
                  Price Range
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">KSh</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-900 focus:border-primary-900"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">KSh</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-900 focus:border-primary-900"
                    />
                  </div>
                </div>
              </section>

              {/* Advanced Attributes */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TagIcon size={14} />
                  More Attributes
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-primary-900 border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600 truncate">In Stock</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={shippingMethodId === 'express'}
                      onChange={(e) => setShippingMethodId(e.target.checked ? 'express' : undefined)}
                      className="w-4 h-4 text-primary-900 border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600 truncate">Express Shipping</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={shippingMethodId === 'standard'}
                      onChange={(e) => setShippingMethodId(e.target.checked ? 'standard' : undefined)}
                      className="w-4 h-4 text-primary-900 border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600 truncate">Standard Shipping</span>
                  </label>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-2 py-4 bg-primary-900 text-white text-sm font-bold rounded-lg hover:bg-primary-800 transition-colors shadow-lg"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
