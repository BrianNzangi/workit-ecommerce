'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  featuredImage?: string;
  images?: Array<{
    src?: string;
    url?: string;
    source?: string;
    preview?: string;
  }>;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (searchTerm: string, track = false) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}${track ? "&track=1" : ""}`,
      );
      if (!res.ok) throw new Error('Failed search request');
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSearch(query, true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    void handleSearch(value);
  };

  const handleResultClick = (product: Product) => {
    window.location.href = `/deal-details/${product.slug}`;
  };

  const getProductImageSrc = (product: Product): string | null => {
    const firstImage = product.images?.[0];
    return product.image
      || product.featuredImage
      || firstImage?.url
      || firstImage?.source
      || firstImage?.preview
      || firstImage?.src
      || null;
  };

  return (
    <div ref={searchRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by model, color, brand..."
            className="
              w-full
              pl-4 pr-4 py-3
              rounded-full
              border-2 border-secondary-900
              bg-gray-100
              focus:outline-none focus:border-primary-800
              font-sans text-black
              text-sm md:text-base
            "
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-900 pointer-events-none"
          />
        </div>
      </form>

      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleResultClick(product)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {getProductImageSrc(product) && (
                  <Image
                    src={getImageUrl(getProductImageSrc(product))}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-cover rounded mr-3"
                    unoptimized
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">KES {Number(product.price || 0).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">No products found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
