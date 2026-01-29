'use client';

import React, { useEffect, useState } from 'react';
import he from 'he';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Category } from '@/components/menu/MegaMenuData';
import MegaMenuItem from '@/components/menu/MegaMenuItem';

// Sorting helper
function sortBySortOrder(a: Category, b: Category) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
}

let cachedCategories: Category[] | null = null;

export default function MobileMegaMenu() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [path, setPath] = useState<Category[]>([]); // breadcrumb path

  useEffect(() => {
    if (cachedCategories) return;

    async function fetchCategories() {
      try {
        const res = await fetch('/api/collections?includeChildren=true');
        const data: any[] = await res.json();

        // Transform and filter only root collections
        const formatted: Category[] = data
          .filter(c => !c.parentId && c.enabled)
          .map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            sortOrder: c.sortOrder,
            image: c.asset?.preview || c.asset?.source,
            children: c.children?.filter((child: any) => child.enabled).map((child: any) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
              sortOrder: child.sortOrder,
              image: child.asset?.preview || child.asset?.source,
            }))
          }));

        cachedCategories = formatted;
        setCategories(formatted);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) return <div className="p-4">Loading menu...</div>;

  const current = path[path.length - 1] || null;
  const items = current
    ? current.children || []
    : categories.filter((c) => c.children && c.children.length > 0);

  return (
    <div className="p-2 font-sans">
      {/* Breadcrumb header */}
      <div className="flex items-center justify-between mb-4">
        {path.length > 0 && (
          <button
            className="inline-flex items-center gap-1 text-sm text-gray-600"
            onClick={() => setPath(path.slice(0, -1))}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="font-semibold text-gray-900 text-base">
          {current ? he.decode(current.name) : 'Categories'}
        </div>
      </div>

      {/* Grid of items */}
      <ul className="grid grid-cols-2 gap-2">
        {items
          .sort(sortBySortOrder)
          .map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;

            return (
              <li key={cat.id}>
                {hasChildren ? (
                  <button
                    onClick={() => setPath([...path, cat])}
                    className="w-full flex items-center justify-between bg-gray-100 rounded-sm px-3 py-4 text-left hover:bg-gray-200 transition"
                  >
                    <span className="font-medium">{he.decode(cat.name)}</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <MegaMenuItem
                    title={cat.name}
                    image={typeof cat.image === 'string' ? cat.image : cat.image?.src}
                    href={`/collections/${cat.slug}`}
                  />
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}