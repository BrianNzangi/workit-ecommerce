'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import type { FeaturedDeal } from '@/lib/homepage/homepage-data';

interface FeaturedDealsSectionProps {
    deals: FeaturedDeal[];
}

export default function FeaturedDealsSection({ deals }: FeaturedDealsSectionProps) {
    const [scrollIndex, setScrollIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [visibleCards, setVisibleCards] = useState(4);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const GAP = 16;

    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.offsetWidth;
            setContainerWidth(width);
            if (width < 640) setVisibleCards(1);
            else if (width < 1024) setVisibleCards(2);
            else if (width < 1280) setVisibleCards(3);
            else setVisibleCards(4);
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const cardWidth = containerWidth <= 0
        ? 280
        : (containerWidth - GAP * (visibleCards - 1)) / visibleCards;

    const maxScrollIndex = Math.max(0, deals.length - visibleCards);

    const scrollToIndex = useCallback(async (index: number) => {
        const bounded = Math.min(Math.max(index, 0), maxScrollIndex);
        setScrollIndex(bounded);
        await controls.start({
            x: -(bounded * (cardWidth + GAP)),
            transition: { duration: 0.5, ease: 'easeInOut' },
        });
    }, [cardWidth, controls, maxScrollIndex]);

    const scroll = useCallback(async (dir: 'left' | 'right') => {
        const next = dir === 'left'
            ? Math.max(0, scrollIndex - 1)
            : Math.min(maxScrollIndex, scrollIndex + 1);
        await scrollToIndex(next);
    }, [maxScrollIndex, scrollIndex, scrollToIndex]);

    useEffect(() => {
        controls.set({ x: -(scrollIndex * (cardWidth + GAP)) });
    }, [controls, scrollIndex, cardWidth]);

    if (deals.length === 0) return null;

    const formatDealType = (type: string) => {
        switch (type) {
            case 'PERCENTAGE': return 'OFF';
            case 'FIXED_AMOUNT': return 'OFF';
            case 'BOGO': return 'BOGO';
            case 'FREE_SHIPPING': return 'Free Shipping';
            default: return type;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const canScrollLeft = scrollIndex > 0;
    const canScrollRight = scrollIndex < maxScrollIndex;

    return (
        <section className="py-6 md:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Zap size={20} className="text-primary-900" />
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                            Featured Deals
                        </h2>
                    </div>
                    <span className="text-sm text-gray-500 hidden sm:block">
                        {deals.length} deal{deals.length !== 1 ? 's' : ''} available
                    </span>
                </div>

                <div className="relative">
                    {deals.length > visibleCards && (
                        <>
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all duration-200 ${
                                    canScrollLeft
                                        ? 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer'
                                        : 'bg-white text-gray-300 cursor-not-allowed'
                                }`}
                                aria-label="Previous deals"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all duration-200 ${
                                    canScrollRight
                                        ? 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer'
                                        : 'bg-white text-gray-300 cursor-not-allowed'
                                }`}
                                aria-label="Next deals"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    <div ref={containerRef} className="overflow-hidden">
                        <motion.div animate={controls} className="flex gap-4" initial={{ x: 0 }}>
                            {deals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="shrink-0"
                                    style={{ width: `${cardWidth}px` }}
                                >
                                    <div className="h-full border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white">
                                        <div className="space-y-3">
                                            <div className="inline-flex items-center gap-1.5 bg-primary-50 rounded-full px-3 py-1">
                                                <span className="text-xs font-bold text-primary-900">
                                                    {deal.discount}% {formatDealType(deal.dealType)}
                                                </span>
                                            </div>

                                            <h3 className="font-sans text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                                                {deal.title}
                                            </h3>

                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>
                                                    {formatDate(deal.startDate)}
                                                </span>
                                                <span className="text-gray-300">→</span>
                                                <span>
                                                    {formatDate(deal.endDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-xs text-primary-700 font-medium hover:text-primary-900 transition-colors">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
