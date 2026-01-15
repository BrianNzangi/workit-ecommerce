'use client';

import React, { useEffect, useState } from 'react';
import he from 'he';
import { ChevronDown } from 'lucide-react';
import { ORDER } from '@/components/menu/MegaMenuData';
import MegaMenuItem from '@/components/menu/MegaMenuItem';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';
import type { CollectionDisplay } from '@/types/collections';

let cachedCollections: CollectionDisplay[] | null = null;

// Sorting helper
function sortByOrder(a: string, b: string) {
  const ia = ORDER.indexOf(a);
  const ib = ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b); // both missing → alpha
  if (ia === -1) return 1; // a missing → goes last
  if (ib === -1) return -1; // b missing → goes last
  return ia - ib; // both in ORDER → respect position
}

export default function MegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>(cachedCollections || []);
  const [loading, setLoading] = useState(!cachedCollections);
  const [activeParent, setActiveParent] = useState<CollectionDisplay | null>(null);
  const [dropdownTop, setDropdownTop] = useState<number>(64);

  useEffect(() => {
    if (cachedCollections) return;

    async function fetchCollections() {
      try {
        const data = await fetchNavigationCollectionsDisplayClient();
        cachedCollections = data;
        setCollections(data);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  useEffect(() => {
    const header = document.getElementById('site-header');
    if (header) {
      setDropdownTop(header.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setActiveParent(null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-30 bg-gray-200 animate-pulse rounded"
          />
        ))}
      </div>
    );
  }

  const collectionsWithChildren = collections
    .filter((parent) => parent.children && parent.children.length > 0)
    .sort((a, b) => sortByOrder(a.name, b.name));

  return (
    <div className="relative">
      {/* Top nav */}
      <nav className="flex space-x-6 font-['DM_Sans'] text-base">
        {collectionsWithChildren.map((parent) => (
          <div
            key={parent.id}
            onMouseEnter={() => setActiveParent(parent)}
            className="relative"
          >
            <div className="inline-flex items-center gap-1 cursor-pointer text-secondary-900 font-medium hover:text-primary-900 transition whitespace-nowrap">
              {he.decode(parent.name)}
              <ChevronDown
                size={16}
                className={`transition-transform ${activeParent?.id === parent.id
                  ? 'rotate-180 text-primary-900'
                  : 'text-secondary-900'
                  }`}
              />
            </div>
          </div>
        ))}
      </nav>

      {/* Full-width dropdown */}
      {activeParent && (
        <div
          className="fixed left-0 right-0 bg-white shadow-lg z-50 -mt-2"
          style={{ top: dropdownTop }}
          onMouseLeave={() => setActiveParent(null)}
        >
          <div className="mx-auto container px-8 py-4">
            {/* Heading */}
            <h3 className="text-medium font-semibold text-[#1F2323] font-[DM_SANS] mb-4">
              Categories
            </h3>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...(activeParent.children || [])]
                .sort((a, b) => sortByOrder(a.name, b.name))
                .map((child) => (
                  <li key={child.id}>
                    <MegaMenuItem
                      title={child.name}
                      image={child.image}
                      href={`/collections/${child.slug}`}
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
