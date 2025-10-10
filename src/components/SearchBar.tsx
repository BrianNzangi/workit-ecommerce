'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: Array<{ src: string }>;
  permalink: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
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
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (product: Product) => {
    window.location.href = `/collection/${product.slug}`;
  };

  return (
    <div className="w-full relative">
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
              border border-gray-300
              bg-gray-100
              focus:outline-none focus:border-secondary
              font-['DM_Sans'] text-black
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
                {product.images && product.images[0] && (
                  <Image
                    src={product.images[0].src}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-cover rounded mr-3"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">KES {product.price}</p>
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
