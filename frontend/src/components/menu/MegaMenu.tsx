'use client';

import React, { useEffect, useState, useRef } from 'react';
import he from 'he';
import Link from 'next/link';
import { ChevronRight, Menu, X } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';
import type { CollectionDisplay } from '@/types/collections';

let cachedCollections: CollectionDisplay[] | null = null;

export default function MegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>(cachedCollections || []);
  const [loading, setLoading] = useState(!cachedCollections);
  const [isOpen, setIsOpen] = useState(false);
  const [activeL1, setActiveL1] = useState<CollectionDisplay | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 200); // 200ms grace period
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

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
    // We want activeL1 to be null initially so L2/L3 content area is empty until hover
  }, [collections]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      setActiveL1(null); // Reset when closed
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Ensure we only show level 1 collections (no parentId) in the header
  const l1Collections = collections.filter(c => !c.parentId);
  const standaloneL1s = l1Collections.filter(c => !c.children || c.children.length === 0);
  const dropdownCollections = l1Collections.filter(c => c.children && c.children.length > 0);

  if (loading) {
    return (
      <div className="h-10 w-full flex items-center gap-4">
        <div className="h-8 w-40 bg-secondary-100 animate-pulse rounded" />
        <div className="h-4 w-24 bg-secondary-50 animate-pulse rounded" />
        <div className="h-4 w-24 bg-secondary-50 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="font-sans flex items-center gap-8" ref={menuRef}>
      {/* Megamenu Hover Zone */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-2 text-secondary-900 hover:text-primary-900 transition-colors shrink-0"
        >
          <Menu size={24} />
          <span className="font-semibold text-lg">Shop by Category</span>
        </button>

        {/* Sidebar Panel */}
        <div
          className={`fixed left-0 right-0 z-50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
            }`}
          style={{ top: 'var(--header-height)' }}
        >
          {/* Important: Invisible bridge to maintain hover between button and panel if there's a gap */}
          <div className="h-2 w-full" />

          <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8">
            <div
              className={`bg-white flex flex-col md:flex-row shadow-2xl border border-secondary-100 rounded-b-lg overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              style={{ maxHeight: '640px' }}
            >
              {/* L1 Vertical Sidebar (Left) */}
              <div className="w-full md:w-80 bg-secondary-50 border-r border-secondary-100 overflow-y-auto overflow-x-hidden">
                <ul className="py-2">
                  {dropdownCollections.map((l1) => (
                    <li
                      key={l1.id}
                      onMouseEnter={() => setActiveL1(l1)}
                      className={`group flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 ${activeL1?.id === l1.id
                        ? 'bg-white text-primary-900 border-l-4 border-primary-900'
                        : 'text-secondary-700 hover:bg-secondary-50 border-l-4 border-transparent'
                        }`}
                    >
                      <span className="font-medium text-base truncate pr-2">{he.decode(l1.name)}</span>
                      <ChevronRight
                        size={18}
                        className={`transition-all duration-300 ${activeL1?.id === l1.id ? 'translate-x-1 opacity-100 text-primary-900' : 'opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5'
                          }`}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* L2 & L3 Content Area (Right) */}
              {activeL1 && (
                <div className="flex-1 bg-white overflow-y-auto p-10 min-h-[400px]">
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    {/* Header with "Shop all" */}
                    <div className="mb-8 flex items-center justify-between pb-5">
                      <Link
                        href={`/collections/${activeL1.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-secondary-900 font-bold text-lg hover:text-primary-900 transition-colors inline-flex items-center gap-3"
                      >
                        Shop all {he.decode(activeL1.name)} <ChevronRight size={24} />
                      </Link>
                    </div>

                    {/* Columns of L2 (Groups) - Masonry Style */}
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                      {activeL1.children?.map((l2) => (
                        <div key={l2.id} className="break-inside-avoid mb-4 flex flex-col">
                          <h4 className="font-semibold text-secondary-900 text-lg mb-4 tracking-wider border-b border-secondary-200 pb-2">
                            {he.decode(l2.name)}
                          </h4>
                          <ul className="space-y-3">
                            {l2.children?.map((l3) => (
                              <li key={l3.id}>
                                <Link
                                  href={`/collections/${l3.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-secondary-900 hover:text-primary-900 transition-colors inline-block text-base font-medium hover:translate-x-1"
                                >
                                  {he.decode(l3.name)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone L1s - Outside Hover Zone */}
      <div className="hidden md:flex items-center gap-6 border-l border-secondary-100 pl-8">
        {standaloneL1s.map((l1) => (
          <Link
            key={l1.id}
            href={`/collections/${l1.slug}`}
            className="text-base font-semibold text-secondary-900 hover:text-primary-900 transition-colors tracking-wide whitespace-nowrap"
          >
            {he.decode(l1.name)}
          </Link>
        ))}
      </div>

      {/* Backdrop - Outside the hover zone */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
        style={{ top: 'var(--header-height)' }}
      />
    </div>
  );
}
