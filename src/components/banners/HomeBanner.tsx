// src/components/banners/HomeBanner.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  bg: string;
  fg?: string;
}

const banners: Banner[] = [
  {
    id: 1,
    headline: 'Big Savings on Electronics',
    subtext: 'Grab the best deals today!',
    ctaText: 'Shop Now',
    ctaLink: '#',
    bg: '/banners/banner1.webp',
  },
  {
    id: 2,
    headline: 'Appliances Sale',
    subtext: 'Upgrade your home at low prices.',
    ctaText: 'Shop Appliances',
    ctaLink: '#',
    bg: '/banners/banner2.webp',
  },
  {
    id: 3,
    headline: 'Top Gadgets for You',
    subtext: 'Latest devices at amazing discounts.',
    ctaText: 'Explore Gadgets',
    ctaLink: '#',
    bg: '/banners/banner3.webp',
  },
];

export default function HomeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // ---------------- Auto slide ----------------
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // ---------------- Navigation functions ----------------
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // ---------------- Touch handlers ----------------
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // ---------------- Keyboard navigation ----------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slide = banners[currentSlide];

  return (
    <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 pt-4 mb-6">
      <div 
        className="relative w-full rounded-sm overflow-hidden group aspect-[16/9] sm:aspect-[20/9] md:aspect-[3/1] lg:aspect-[4/1] xl:aspect-[5/1] bg-gray-200"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        role="banner"
        aria-label="Homepage banner carousel"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
          >
            <Image
              src={slide.bg}
              alt={slide.headline}
              fill
              className="object-cover"
              priority={currentSlide === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - Hidden on small screens, shown on hover for larger screens */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Dots indicator - Responsive sizing */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-[#1F2323] scale-125' 
                  : 'bg-[#1F2323]/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
