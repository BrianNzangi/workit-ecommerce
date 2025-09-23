'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '../product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { Product } from '@/types/product';

interface HomepageCollectionProps {
  title: string;
  slug: string;
  products: Product[];
}

export default function HomepageCollection({ title, products }: HomepageCollectionProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const GAP = 16; // gap-4

  useEffect(() => {
    if (products.length > 0) setLoading(false);
  }, [products]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        
        // Responsive visible cards based on screen width
        if (width < 640) {
          setVisibleCards(2); // Mobile: 2 cards
        } else if (width < 1024) {
          setVisibleCards(3); // Tablet: 3 cards
        } else if (width < 1280) {
          setVisibleCards(4); // Desktop: 4 cards
        } else {
          setVisibleCards(5); // Large desktop: 5 cards
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate card width based on container and visible cards
  // On mobile, give cards slightly more width to prevent cut-off appearance
  const getCardWidth = () => {
    if (containerWidth <= 0) return 250;
    
    if (containerWidth < 640) {
      // Mobile: Make cards slightly wider, accounting for container padding
      return (containerWidth - GAP) / 2;
    }
    
    return (containerWidth - (GAP * (visibleCards - 1))) / visibleCards;
  };
  
  const cardWidth = getCardWidth();
  const maxScrollIndex = Math.max(0, products.length - visibleCards);

  const scroll = async (direction: 'left' | 'right') => {
    const newIndex =
      direction === 'left'
        ? Math.max(scrollIndex - 1, 0)
        : Math.min(scrollIndex + 1, maxScrollIndex);

    setScrollIndex(newIndex);
    
    // Calculate the exact scroll position
    const scrollAmount = newIndex * (cardWidth + GAP);
    
    await controls.start({
      x: -scrollAmount,
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  };

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < maxScrollIndex;

  const renderSkeleton = () =>
    Array.from({ length: visibleCards }).map((_, index) => (
      <div 
        key={index} 
        className="flex-shrink-0 flex flex-col gap-2"
        style={{ width: `${cardWidth}px` }}
      >
        <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-md" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2" />
        <div className="h-6 bg-gray-300 animate-pulse rounded w-2/3" />
      </div>
    ));

  return (
    <section className="container mx-auto font-[DM_SANS] space-y-2">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl capitalize font-semibold text-gray-900">
          {title || 'Collection'}
        </h2>
      </div>

      <div className="relative">
        {/* Carousel arrows - hidden on mobile, show on tablet and up when needed */}
        {!loading && products.length > visibleCards && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`hidden sm:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${
                canScrollLeft
                  ? 'bg-gray-100 hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft size={20} className="md:w-4 md:h-4 " />
            </button>
            
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${
                canScrollRight
                  ? 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Next products"
            >
              <ChevronRight size={20} className="md:w-4 md:h-4" />
            </button>
          </>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={containerRef}
            className="overflow-hidden"
          >
            <motion.div 
              animate={controls} 
              className="flex gap-4"
              initial={{ x: 0 }}
            >
              {loading || !products.length
                ? renderSkeleton()
                : products.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex-shrink-0"
                      style={{ width: `${cardWidth}px` }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        link={product.link}
                        price={product.price}
                        regular_price={product.regular_price}
                        image={product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4='}
                        images={product.images}
                        variations={product.variations}
                        type={product.type}
                      />
                    </div>
                  ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
