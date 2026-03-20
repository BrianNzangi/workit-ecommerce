'use client';

import React, { useEffect, useState } from 'react';
import he from 'he';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';
import type { CollectionDisplay } from '@/types/collections';
import MegaMenuItem from '@/components/menu/MegaMenuItem';

export default function MobileMegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<CollectionDisplay[]>([]); // active drill-down path

  useEffect(() => {
    async function fetchCollections() {
      try {
        const data = await fetchNavigationCollectionsDisplayClient();
        setCollections(data);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  if (loading) return <div className="p-4 animate-pulse">Loading menu...</div>;

  const current = path[path.length - 1] || null;

  // If no path, show L1. If at L1, show L2. If at L2, show L3.
  const items = current
    ? current.children || []
    : collections;

  const handleBack = () => {
    setPath(path.slice(0, -1));
  };

  const handleSelect = (col: CollectionDisplay) => {
    if (col.children && col.children.length > 0) {
      setPath([...path, col]);
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-white">
      {/* Navigator Header */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-gray-100">
        {path.length > 0 ? (
          <button
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            onClick={handleBack}
          >
            <ChevronLeft size={24} />
          </button>
        ) : null}
        <div className="font-bold text-gray-900 text-lg">
          {current ? he.decode(current.name) : 'Shop by Category'}
        </div>
      </div>

      {/* List Area */}
      <ul className="flex-1 overflow-y-auto pt-2 pb-10">
        {items.length === 0 ? (
          <li className="p-4 text-gray-500 italic text-sm text-center">No categories found in this section</li>
        ) : (
          items.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isL2Group = path.length === 1; // current is L1, so items are L2

            return (
              <li key={cat.id} className="border-b border-gray-50 last:border-0">
                {hasChildren ? (
                  <button
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium text-gray-800 ${isL2Group ? 'uppercase text-xs tracking-wider text-gray-500' : 'text-base'}`}>
                        {he.decode(cat.name)}
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                ) : (
                  <div className="px-2">
                    <MegaMenuItem
                      title={cat.name}
                      image={cat.image}
                      href={`/collections/${cat.slug}`}
                    />
                  </div>
                )}
              </li>
            );
          })
        )}

        {/* At depth 1 or 2, show "Shop all" link */}
        {current && (
          <li className="mt-4 px-4">
            <Link
              href={`/collections/${current.slug}`}
              className="block w-full text-center py-3 bg-primary-900 text-white font-bold rounded-xs hover:bg-black transition-colors"
            >
              Shop all {he.decode(current.name)}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
