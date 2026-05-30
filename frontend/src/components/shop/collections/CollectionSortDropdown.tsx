'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS = [
  { val: 'popularity', label: 'Relevance' },
  { val: 'price_asc', label: 'Price: Low to High' },
  { val: 'price_desc', label: 'Price: High to Low' },
];

interface CollectionSortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function CollectionSortDropdown({ sortBy, onSortChange }: CollectionSortDropdownProps) {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className="h-10 w-48">
        <span className="text-gray-500 font-normal">Sort by: </span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(opt => (
          <SelectItem key={opt.val} value={opt.val}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
