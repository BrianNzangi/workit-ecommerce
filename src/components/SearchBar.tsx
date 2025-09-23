'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', query);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
  );
}