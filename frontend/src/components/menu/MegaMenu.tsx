'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import he from 'he';
import Link from 'next/link';
import { ChevronRight, Menu, X } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections/collections-client';
import type { CollectionDisplay } from '@/types/collections';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDocumentNavigation } from '@/lib/utils/document-navigation';
import { cn } from '@/lib/utils/utils';

function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <ChevronRight
      size={16}
      className={cn(
        'text-secondary-400 transition-transform duration-200 shrink-0',
        isOpen && 'rotate-90'
      )}
    />
  );
}

function CollectionChildren({
  items,
  depth,
  onNavigate,
}: {
  items: CollectionDisplay[];
  depth: number;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (items.length === 0) return null;

  const isGroup = depth === 1;

  return (
    <div className={cn(depth > 0 && !isGroup && 'ml-5 border-l border-gray-100 pl-3')}>
      {items.map((cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expanded.has(cat.id);

        return (
          <div key={cat.id}>
            {depth === 0 ? (
              // ─── L1: Department header ────────────────────────────
              <>
                <div
                  className={cn(
                    'flex items-center gap-2 px-6 py-3.5 transition-colors cursor-pointer border-b border-gray-100',
                    'text-secondary-800 font-bold text-base',
                    'hover:bg-secondary-50'
                  )}
                  onClick={() => { if (hasChildren) toggle(cat.id); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (hasChildren) toggle(cat.id);
                    }
                  }}
                >
                  <span className="flex-1 min-w-0 line-clamp-1">
                    {hasChildren ? (
                      he.decode(cat.name)
                    ) : (
                      <Link
                        href={`/collections/${cat.slug}`}
                        onClick={(event) => onNavigate(event, `/collections/${cat.slug}`)}
                        className="block hover:text-primary-900 transition-colors"
                      >
                        {he.decode(cat.name)}
                      </Link>
                    )}
                  </span>
                  {hasChildren && <Chevron isOpen={isExpanded} />}
                </div>

                {hasChildren && isExpanded && (
                  <div className="overflow-hidden bg-secondary-50/30">
                    <CollectionChildren
                      items={cat.children!}
                      depth={depth + 1}
                      onNavigate={onNavigate}
                    />
                  </div>
                )}
              </>
            ) : (
              // ─── Group or L2 ──────────────────────────────────────
              <>
                <div
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    isGroup
                      ? 'px-6 py-3 font-semibold text-sm text-secondary-700 cursor-pointer hover:bg-secondary-50/50'
                      : 'px-6 py-2.5 text-sm text-secondary-600'
                  )}
                  onClick={() => { if (hasChildren) toggle(cat.id); }}
                  role={hasChildren ? 'button' : undefined}
                  tabIndex={hasChildren ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (hasChildren && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      toggle(cat.id);
                    }
                  }}
                >
                  {isGroup && hasChildren && (
                    <span className="shrink-0 w-4 flex justify-center">
                      <Chevron isOpen={isExpanded} />
                    </span>
                  )}

                  {isGroup && !hasChildren && (
                    <span className="shrink-0 w-4" />
                  )}

                  <span className="flex-1 min-w-0">
                    {hasChildren ? (
                      <span className="line-clamp-1">{he.decode(cat.name)}</span>
                    ) : (
                      <Link
                        href={`/collections/${cat.slug}`}
                        onClick={(event) => onNavigate(event, `/collections/${cat.slug}`)}
                        className={cn(
                          'block line-clamp-1 transition-colors',
                          isGroup
                            ? 'hover:text-primary-900'
                            : 'hover:text-primary-900 font-medium'
                        )}
                      >
                        {he.decode(cat.name)}
                      </Link>
                    )}
                  </span>
                </div>

                {hasChildren && isExpanded && (
                  <div className="overflow-hidden">
                    <CollectionChildren
                      items={cat.children!}
                      depth={depth + 1}
                      onNavigate={onNavigate}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MegaMenu() {
  const [collections, setCollections] = useState<CollectionDisplay[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (!isOpen && !openTimeoutRef.current) {
      openTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
        openTimeoutRef.current = null;
      }, 300);
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
    fetchNavigationCollectionsDisplayClient()
      .then(setCollections)
      .catch((err) => console.error('Failed to fetch collections:', err))
      .finally(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const l1Items = collections.filter(c => !c.parentId);
  const dropdownItems = l1Items.filter(c => c.children && c.children.length > 0);
  const menuHeaderItems = collections.filter(c => c.showInMenuHeader);

  const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    handleDocumentNavigation(event, href, closeMenu);
  };

  return (
    <div className="font-sans flex items-center gap-8">
      <div
        className="h-full flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeaveTrigger}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 py-2 text-white hover:text-white/80 transition-colors shrink-0 group"
        >
          <Menu size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-lg tracking-tight">Shop by Category</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-90"
            />

            <motion.div
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-100 bg-white z-100 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 bg-primary-900 border-b border-gray-100">
                <span className="text-lg font-bold tracking-tight text-white">
                  Browse by Department
                </span>
                <button
                  onClick={closeMenu}
                  className="size-8 inline-flex items-center justify-center rounded-sm text-white hover:text-white/80 hover:bg-accent transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {!hasLoaded ? (
                  <div className="px-6 py-4 text-sm text-secondary-500">
                    Loading categories...
                  </div>
                ) : (
                  <CollectionChildren
                    items={dropdownItems}
                    depth={0}
                    onNavigate={handleNavigate}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {menuHeaderItems.length > 0 && (
        <div className="hidden md:flex items-center gap-8 border-l border-gray-100 pl-8">
          {menuHeaderItems.map((l1) => (
            <Link
              key={l1.id}
              href={`/collections/${l1.slug}`}
              onClick={(event) => handleNavigate(event, `/collections/${l1.slug}`)}
              className="text-base font-bold text-white hover:text-white/80 transition-colors tracking-tight whitespace-nowrap"
            >
              {he.decode(l1.name)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
