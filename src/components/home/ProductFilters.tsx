'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface ProductFiltersProps {
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export default function ProductFilters({ selectedCategory, onSelectCategory }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();

        // Filter out "uncategorized" and sort categories with selected one at top
        const filteredCategories = data.filter((cat: Category) =>
          cat.name.toLowerCase() !== 'uncategorized' && cat.slug !== 'uncategorized'
        );

        // Sort categories: selected category first, then by count descending
        const sortedCategories = filteredCategories.sort((a: Category, b: Category) => {
          if (selectedCategory) {
            if (a.id === selectedCategory) return -1;
            if (b.id === selectedCategory) return 1;
          }
          return b.count - a.count;
        });

        setCategories(sortedCategories);
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Categories</h3>
      <button
        className={`text-sm ${selectedCategory === null ? 'text-primary font-semibold' : 'text-gray-600'}`}
        onClick={() => onSelectCategory(null)}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`block text-sm ${
            selectedCategory === cat.id ? 'text-primary font-semibold' : 'text-gray-600'
          }`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
