'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { val: 'popularity', label: 'Relevance' },
  { val: 'price_asc', label: 'Price: Low to High' },
  { val: 'price_desc', label: 'Price: High to Low' },
];

interface CollectionSortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

function getSortLabel(val: string) {
  return SORT_OPTIONS.find(o => o.val === val)?.label || 'Relevance';
}

export default function CollectionSortDropdown({ sortBy, onSortChange }: CollectionSortDropdownProps) {
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setSortOpen(!sortOpen)}
        onBlur={() => setTimeout(() => setSortOpen(false), 150)}
        className="h-10 px-4 flex items-center gap-2 border border-gray-200 bg-white text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
      >
        Sort by: <span className="font-bold">{getSortLabel(sortBy)}</span>
        <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
      </button>

      {sortOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded shadow-xl z-40 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="py-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.val}
                onClick={() => {
                  onSortChange(opt.val);
                  setSortOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                  sortBy === opt.val ? 'font-bold bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
