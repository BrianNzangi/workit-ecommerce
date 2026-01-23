'use client'

import { ChevronDown } from 'lucide-react'

interface ProductSorterProps {
  sortBy: string
  onSortChange: (sortBy: string) => void
}

export default function ProductSorter({ sortBy, onSortChange }: ProductSorterProps) {
  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-gray-200 rounded px-3 py-1 pr-8 text-sm font-sans appearance-none bg-white"
      >
        <option value="popularity">Sort by Popularity</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  )
}
