'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image/image-utils';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface TopBrandsCarouselProps {
  title: string;
  brands: BrandItem[];
}

export default function TopBrandsCarousel({
  title,
  brands,
}: TopBrandsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!brands.length) return null;

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
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 custom-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="snap-start shrink-0 w-[120px] sm:w-[140px] group/card"
            >
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white h-full flex items-center justify-center p-3"
                style={{ aspectRatio: '4 / 3' }}
              >
                {brand.logoUrl ? (
                    <img
                      src={getImageUrl(brand.logoUrl)}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                  <span className="text-xl font-bold text-gray-300 uppercase">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors z-10"
            aria-label="Previous brands"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors z-10"
            aria-label="Next brands"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
