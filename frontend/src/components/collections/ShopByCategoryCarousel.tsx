'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentSlug?: string;
  image?: string | null;
  children?: CategoryItem[];
}

interface ShopByCategoryCarouselProps {
  title: string;
  parentSlug: string;
  categories: CategoryItem[];
}

export default function ShopByCategoryCarousel({
  title,
  parentSlug,
  categories,
}: ShopByCategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!categories.length) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 custom-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collections/${parentSlug}/${cat.slug}`}
              className="snap-start shrink-0 flex flex-col items-center gap-3 group/card w-[100px] sm:w-[120px]"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 group-hover/card:border-primary-900/30 transition-colors flex items-center justify-center">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-800 text-center group-hover/card:text-primary-900 transition-colors line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-[44px] -translate-y-1/2 -translate-x-3 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors z-10"
            aria-label="Previous categories"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-[44px] -translate-y-1/2 translate-x-3 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors z-10"
            aria-label="Next categories"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
