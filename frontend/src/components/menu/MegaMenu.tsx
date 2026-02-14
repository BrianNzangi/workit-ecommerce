'use client';

import React, { useEffect, useState, useRef } from 'react';
import he from 'he';
import Link from 'next/link';
import { ChevronRight, Menu, X } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';
import type { CollectionDisplay } from '@/types/collections';
import { motion, AnimatePresence } from 'framer-motion';

let cachedCollections: CollectionDisplay[] | null = null;

export default function MegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>(cachedCollections || []);
  const [loading, setLoading] = useState(!cachedCollections);
  const [isOpen, setIsOpen] = useState(false);
  const [activeL1, setActiveL1] = useState<CollectionDisplay | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeImmediately = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(false);
  };

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
      document.body.style.overflow = 'hidden';
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
      {/* Megamenu Trigger Zone */}
      <div
        className="h-full flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 py-3 text-secondary-900 hover:text-primary-900 transition-colors shrink-0 group"
        >
          <Menu size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-lg tracking-tight">Shop by Category</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 pointer-events-none"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex w-full h-[calc(100vh-var(--header-height))] pointer-events-auto">
                {/* Left Offset Spacer - Invisible */}
                <div className="flex-1 h-full bg-transparent" />

                <div className="container mx-auto pl-4 sm:pl-0 md:pl-8 lg:pl-8 xl:pl-10 2xl:pl-8 pr-0 flex shrink-0 h-full relative">
                  {/* L1 Vertical Sidebar (Left) */}
                  <div className="w-80 bg-white border-r border-secondary-100 overflow-y-auto overflow-x-hidden shrink-0">
                    <ul className="">
                      {dropdownCollections.map((l1) => (
                        <li
                          key={l1.id}
                          onMouseEnter={() => setActiveL1(l1)}
                          className={`group flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-200 border-b border-secondary-100 last:border-b-0 ${activeL1?.id === l1.id
                            ? 'bg-secondary-50 text-primary-900 border-l-4 border-primary-900'
                            : 'text-secondary-700 hover:bg-secondary-50/50 border-l-4 border-transparent'
                            }`}
                        >
                          <span className={`font-semibold text-base truncate pr-2 ${activeL1?.id === l1.id ? 'translate-x-1' : ''} transition-transform`}>
                            {he.decode(l1.name)}
                          </span>
                          <ChevronRight
                            size={18}
                            className={`transition-all duration-300 ${activeL1?.id === l1.id ? 'translate-x-1 opacity-100 text-primary-900' : 'opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0'
                              }`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* L2 & L3 Content Area (Right) */}
                  <div className={`flex-1 bg-white overflow-y-auto transition-all duration-300 ${activeL1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {activeL1 && (
                      <div className="p-10 min-w-[800px]">
                        {/* Header with "Shop all" */}
                        <div className="mb-8 flex items-center justify-between pb-5 border-b border-secondary-100">
                          <Link
                            href={`/collections/${activeL1.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-secondary-900 font-bold text-xl hover:text-primary-900 transition-colors inline-flex items-center gap-3 group"
                          >
                            Shop all {he.decode(activeL1.name)}
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>

                        {/* Columns of L2 (Groups) */}
                        <div className="grid grid-cols-3 gap-10">
                          {activeL1.children?.map((l2) => (
                            <div key={l2.id} className="flex flex-col">
                              <h4 className="font-bold text-secondary-900 text-base mb-4 tracking-wider uppercase border-l-2 border-primary-900 pl-3">
                                {he.decode(l2.name)}
                              </h4>
                              <ul className="space-y-2.5">
                                {l2.children?.map((l3) => (
                                  <li key={l3.id}>
                                    <Link
                                      href={`/collections/${l3.slug}`}
                                      onClick={() => setIsOpen(false)}
                                      className="text-secondary-600 hover:text-primary-900 transition-colors inline-block text-sm font-medium hover:translate-x-1"
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
                    )}
                  </div>
                </div>

                {/* Right Extension - Covers the area from container end to screen edge */}
                <div
                  className={`flex-1 transition-colors duration-200 ${activeL1 ? 'bg-white' : 'bg-transparent'}`}
                  style={{ marginLeft: '-1px' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Standalone L1s */}
      <div className="hidden md:flex items-center gap-8 border-l border-secondary-100 pl-8">
        {standaloneL1s.map((l1) => (
          <Link
            key={l1.id}
            href={`/collections/${l1.slug}`}
            className="text-base font-bold text-secondary-900 hover:text-primary-900 transition-colors tracking-tight whitespace-nowrap"
          >
            {he.decode(l1.name)}
          </Link>
        ))}
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 h-[200vh] bg-black/40 z-40 pointer-events-auto"
            onClick={closeImmediately}
            onMouseEnter={closeImmediately}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
