'use client';

import React, { useEffect, useState } from 'react';
import he from 'he';
import { ChevronDown } from 'lucide-react';
import { Category, ORDER } from '@/components/menu/MegaMenuData';
import MegaMenuItem from '@/components/menu/MegaMenuItem';

let cachedCategories: Category[] | null = null;

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
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [activeParent, setActiveParent] = useState<Category | null>(null);
  const [dropdownTop, setDropdownTop] = useState<number>(64);

  useEffect(() => {
    if (cachedCategories) return;

    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data: Category[] = await res.json();
        cachedCategories = data;
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const header = document.getElementById('site-header');
    if (header) {
      setDropdownTop(header.offsetHeight);
    }
  }, []);

  if (loading) return <div>Loading menu...</div>;

  const categoriesWithChildren = categories
    .filter((parent) => parent.children && parent.children.length > 0)
    .sort((a, b) => sortByOrder(a.name, b.name));

  return (
    <div className="relative">
      {/* Top nav */}
      <nav className="flex space-x-6 font-['DM_Sans'] text-base">
        {categoriesWithChildren.map((parent) => (
          <div
            key={parent.id}
            onMouseEnter={() => setActiveParent(parent)}
            className="relative"
          >
            <div className="inline-flex items-center gap-1 cursor-pointer text-[#1F2323] font-medium hover:text-primary transition whitespace-nowrap">
              {he.decode(parent.name)}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  activeParent?.id === parent.id
                    ? 'rotate-180 text-primary'
                    : 'text-gray-600'
                }`}
              />
            </div>
          </div>
        ))}
      </nav>

      {/* Full-width dropdown */}
      {activeParent && (
        <div
          className="fixed left-0 right-0 bg-white shadow-lg z-50"
          style={{ top: dropdownTop }}
          onMouseLeave={() => setActiveParent(null)}
        >
          <div className="mx-auto container px-4 py-4">
            {/* Heading */}
            <h3 className="text-medium font-semibold text-[#1F2323] font-[DM_SANS] mb-4">
              Categories
            </h3>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {[...(activeParent.children || [])]
                .sort((a, b) => sortByOrder(a.name, b.name))
                .map((child) => {
                  const imageUrl =
                    typeof child.image === 'string'
                      ? child.image
                      : child.image?.src;

                  return (
                    <li key={child.id}>
                      <MegaMenuItem
                        title={child.name}
                        image={imageUrl}
                        href={`/collections/${child.slug}`}
                      />
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}