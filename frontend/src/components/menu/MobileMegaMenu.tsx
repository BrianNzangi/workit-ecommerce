'use client';

import React, { useEffect, useState, useCallback } from 'react';
import he from 'he';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { fetchNavigationCollectionsDisplayClient } from '@/lib/collections/collections-client';
import type { CollectionDisplay } from '@/types/collections';
import { cn } from '@/lib/utils/utils';

function Chevron({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <ChevronRight
      size={16}
      className={cn(
        'text-muted-foreground transition-transform duration-200 shrink-0',
        isOpen && 'rotate-90',
        className
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
  onNavigate: () => void;
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

  return (
    <div className={cn(depth > 0 && 'ml-4 border-l border-gray-100 pl-3')}>
      {items.map((cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expanded.has(cat.id);

        return (
          <div key={cat.id}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-sm transition-colors',
                depth === 0 ? 'text-foreground font-medium' : 'text-muted-foreground text-sm',
                hasChildren ? 'cursor-pointer hover:bg-accent' : 'hover:bg-accent/50'
              )}
              onClick={() => {
                if (hasChildren) toggle(cat.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (hasChildren) toggle(cat.id);
                }
              }}
            >
              <span className="flex-1 min-w-0">
                {hasChildren ? (
                  <span className="line-clamp-1">{he.decode(cat.name)}</span>
                ) : (
                  <Link
                    href={`/shop/collections/${cat.slug}`}
                    onClick={onNavigate}
                    className="block line-clamp-1 hover:text-primary transition-colors"
                  >
                    {he.decode(cat.name)}
                  </Link>
                )}
              </span>

              {hasChildren && (
                <Chevron isOpen={isExpanded} />
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="overflow-hidden transition-all duration-200">
                <CollectionChildren
                  items={cat.children!}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
                <Link
                  href={`/shop/collections/${cat.slug}`}
                  onClick={onNavigate}
                  className={cn(
                    'block px-3 py-2 text-xs font-medium transition-colors',
                    depth === 0
                      ? 'ml-4 border-l border-gray-100 pl-3 text-primary hover:text-primary/80'
                      : 'ml-8 text-muted-foreground hover:text-primary'
                  )}
                >
                  Shop all {he.decode(cat.name)} →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MobileMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [collections, setCollections] = useState<CollectionDisplay[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchNavigationCollectionsDisplayClient()
      .then(setCollections)
      .catch((err) => console.error('Failed to fetch collections:', err))
      .finally(() => setHasLoaded(true));
  }, []);

  const handleNavigate = useCallback(() => {
    onNavigate?.();
  }, [onNavigate]);

  if (!hasLoaded) {
    return (
      <div className="px-3 py-4 text-sm text-muted-foreground">
        Loading categories...
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="px-3 py-4 text-sm text-muted-foreground">
        No categories found
      </div>
    );
  }

  return (
    <div>
      <div className="text-base font-semibold text-foreground tracking-tight mb-1 px-3">
        Shop by Category
      </div>
      <CollectionChildren
        items={collections}
        depth={0}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
