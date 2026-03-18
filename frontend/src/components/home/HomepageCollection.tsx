'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import ProductCard from '../product/ProductCard';
import HorizontalBanner from '../banners/HorizontalBanner';
import type { HomepageCollectionData, StoreBanner } from '@/lib/homepage-data';

interface CollectionCarouselProps {
    collection: HomepageCollectionData;
}

interface HomepageCollectionProps {
    collections: HomepageCollectionData[];
    middleBanner?: StoreBanner | null;
    bottomBanner?: StoreBanner | null;
}

function CollectionCarousel({ collection }: CollectionCarouselProps) {
    const router = useRouter();
    const [scrollIndex, setScrollIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [visibleCards, setVisibleCards] = useState(2);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);

    const GAP = 16;
    const MIN_SWIPE_DISTANCE = 40;
    const products = collection.products || [];
    const displayedProducts = products.slice(0, 12);
    const viewAllHref = `/deal-details/${collection.slug}`;

    const prefetchCollection = () => {
        router.prefetch(viewAllHref);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateMobileState = () => setIsMobile(mediaQuery.matches);

        updateMobileState();
        mediaQuery.addEventListener('change', updateMobileState);
        return () => mediaQuery.removeEventListener('change', updateMobileState);
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);

            if (width < 640) setVisibleCards(2);
            else if (width < 1024) setVisibleCards(3);
            else if (width < 1280) setVisibleCards(4);
            else setVisibleCards(5);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const getCardWidth = () => {
        if (containerWidth <= 0) return 250;
        if (containerWidth < 640) return (containerWidth - GAP) / 2;
        return (containerWidth - (GAP * (visibleCards - 1))) / visibleCards;
    };

    const cardWidth = getCardWidth();
    const maxScrollIndex = Math.max(0, displayedProducts.length - visibleCards);

    const scrollToIndex = useCallback(async (index: number) => {
        const boundedIndex = Math.min(Math.max(index, 0), maxScrollIndex);
        setScrollIndex(boundedIndex);

        await controls.start({
            x: -(boundedIndex * (cardWidth + GAP)),
            transition: { duration: 0.5, ease: 'easeInOut' },
        });
    }, [cardWidth, controls, maxScrollIndex]);

    const scroll = useCallback(async (direction: 'left' | 'right', loop = false) => {
        const nextIndex = direction === 'left'
            ? (scrollIndex <= 0 ? (loop ? maxScrollIndex : 0) : scrollIndex - 1)
            : (scrollIndex >= maxScrollIndex ? (loop ? 0 : maxScrollIndex) : scrollIndex + 1);

        await scrollToIndex(nextIndex);
    }, [maxScrollIndex, scrollIndex, scrollToIndex]);

    useEffect(() => {
        if (!isMobile || displayedProducts.length <= visibleCards) return;

        const timer = setInterval(() => {
            void scroll('right', true);
        }, 2800);

        return () => clearInterval(timer);
    }, [displayedProducts.length, isMobile, visibleCards, scroll]);

    useEffect(() => {
        controls.set({ x: -(scrollIndex * (cardWidth + GAP)) });
    }, [controls, scrollIndex, cardWidth]);

    const onTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isMobile) return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!isMobile) return;
        if (touchStart === null || touchEnd === null) return;
        const distance = touchStart - touchEnd;

        if (distance > MIN_SWIPE_DISTANCE) {
            void scroll('right', true);
        } else if (distance < -MIN_SWIPE_DISTANCE) {
            void scroll('left', true);
        }
    };

    const canScrollLeft = scrollIndex > 0;
    const canScrollRight = scrollIndex < maxScrollIndex;

    if (displayedProducts.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto font-sans space-y-2 py-4 md:py-2">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="font-sans text-lg md:text-2xl capitalize font-bold text-gray-900">
                        {collection.title}
                    </h2>
                    <Link
                        href={viewAllHref}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:text-primary-800 transition-colors whitespace-nowrap"
                        onMouseEnter={prefetchCollection}
                        onFocus={prefetchCollection}
                        onTouchStart={prefetchCollection}
                    >
                        <span>View All</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
                {collection.subtitle && (
                    <h3 className="text-lg md:text-xl text-gray-600 mt-1">
                        {collection.subtitle}
                    </h3>
                )}
                {collection.description && (
                    <p className="text-base text-gray-700 mt-2">
                        {collection.description}
                    </p>
                )}
            </div>

            <div className="relative">
                {displayedProducts.length > visibleCards && (
                    <>
                        <button
                            onClick={() => void scroll('left', true)}
                            disabled={!canScrollLeft}
                            className={`hidden sm:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${canScrollLeft
                                ? 'bg-gray-100 hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            aria-label="Previous products"
                        >
                            <ChevronLeft size={20} className="md:w-4 md:h-4" />
                        </button>

                        <button
                            onClick={() => void scroll('right', true)}
                            disabled={!canScrollRight}
                            className={`hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${canScrollRight
                                ? 'bg-secondary-400/20 hover:bg-secondary-900 text-gray-50 hover:text-primary-900 cursor-pointer'
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
                        style={{ touchAction: 'pan-y' }}
                        onTouchStart={isMobile ? onTouchStart : undefined}
                        onTouchMove={isMobile ? onTouchMove : undefined}
                        onTouchEnd={isMobile ? onTouchEnd : undefined}
                    >
                        <motion.div
                            animate={controls}
                            className="flex gap-4"
                            initial={{ x: 0 }}
                        >
                            {displayedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="shrink-0"
                                    style={{ width: `${cardWidth}px` }}
                                >
                                    <ProductCard {...product} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function HomepageCollection({
    collections,
    middleBanner,
    bottomBanner,
}: HomepageCollectionProps) {
    if (collections.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 md:space-y-7">
            {collections.map((collection, index) => (
                <React.Fragment key={collection.id}>
                    <CollectionCarousel collection={collection} />
                    {index === 2 && <HorizontalBanner banner={middleBanner} position="MIDDLE" />}
                    {index === collections.length - 1 && (
                        <HorizontalBanner banner={bottomBanner} position="BOTTOM" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
