'use client';

import React, { useEffect, useState, useRef } from 'react';
import he from 'he';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Menu, X, ArrowLeft } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';
import type { CollectionDisplay } from '@/types/collections';
import { motion, AnimatePresence } from 'framer-motion';

export default function MegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeL1, setActiveL1] = useState<CollectionDisplay | null>(null);
  const [view, setView] = useState<'l1' | 'subcategory'>('l1');

  const menuRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    setIsOpen(false);
    // Reset view after animation
    setTimeout(() => {
      setView('l1');
      setActiveL1(null);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (!isOpen && !openTimeoutRef.current) {
      openTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
        openTimeoutRef.current = null;
      }, 300); // 300ms hover delay to open
    }
  };

  const handleMouseLeaveTrigger = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Option: keep click outside enabled or disable it too if "ONLY close button" is literal.
        // Usually click-outside is expected, but backdrop click is easier to control.
        // I'll leave it for now but remove backdrop click if requested.
        // Actually, the user was very specific: "only the close button should close the slider".
        // I will commented this out to be safe.
        // setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const l1Collections = collections.filter(c => !c.parentId);
  const standaloneL1s = l1Collections.filter(c => !c.children || c.children.length === 0);
  const dropdownCollections = l1Collections.filter(c => c.children && c.children.length > 0);

  const handleL1Click = (l1: CollectionDisplay) => {
    setActiveL1(l1);
    setView('subcategory');
  };

  const handleBack = () => {
    setView('l1');
    setActiveL1(null);
  };

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
    <div className="font-sans flex items-center gap-8">
      {/* Trigger Zone */}
      <div
        className="h-full flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeaveTrigger}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 py-3 text-secondary-900 hover:text-primary-900 transition-colors shrink-0 group"
        >
          <Menu size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-lg tracking-tight">Shop by Category</span>
        </button>
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - Non-clickable to strictly follow "only close button" */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-90"
            />

            {/* Drawer Content */}
            <motion.div
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-[400px] bg-white z-100 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-secondary-100 bg-gray-50/50">
                {view === 'l1' ? (
                  <Link href="/" onClick={closeMenu} className="inline-block relative w-[120px] h-auto">
                    <Image
                      src="/workit-logo.png"
                      alt="Workit Logo"
                      width={120}
                      height={40}
                      className="w-full h-auto object-contain"
                      priority
                      unoptimized
                    />
                  </Link>
                ) : (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-secondary-600 hover:text-primary-900 transition-colors group"
                  >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back</span>
                  </button>
                )}
                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-secondary-100 rounded-full text-secondary-500 transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto relative bg-white">
                <AnimatePresence mode="wait">
                  {view === 'l1' ? (
                    <motion.div
                      key="l1-view"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="py-2"
                    >
                      {dropdownCollections.map((l1) => (
                        <button
                          key={l1.id}
                          onClick={() => handleL1Click(l1)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary-50 text-secondary-700 transition-colors border-b border-secondary-50 last:border-0 group"
                        >
                          <span className="font-semibold text-base">{he.decode(l1.name)}</span>
                          <ChevronRight size={18} className="text-secondary-300 group-hover:text-primary-900 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="subcategory-view"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-6"
                    >
                      {activeL1 && (
                        <div className="space-y-8">
                          <div className="pb-4 border-b border-secondary-100">
                            <Link
                              href={`/collections/${activeL1.slug}`}
                              onClick={closeMenu}
                              className="text-primary-900 font-bold text-lg flex items-center gap-2 hover:underline"
                            >
                              Shop all {he.decode(activeL1.name)}
                              <ChevronRight size={18} />
                            </Link>
                          </div>

                          <div className="space-y-8">
                            {activeL1.children?.map((l2) => (
                              <div key={l2.id} className="space-y-4">
                                <h4 className="font-bold text-secondary-900 text-sm tracking-widest uppercase border-l-3 border-primary-900 pl-3">
                                  {he.decode(l2.name)}
                                </h4>
                                <ul className="grid grid-cols-1 gap-3 pl-4">
                                  {l2.children?.map((l3) => (
                                    <li key={l3.id}>
                                      <Link
                                        href={`/collections/${l3.slug}`}
                                        onClick={closeMenu}
                                        className="text-secondary-600 hover:text-primary-900 transition-colors text-sm font-medium"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </div>
  );
}
