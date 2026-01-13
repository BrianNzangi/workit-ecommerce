// src/components/banners/HeroSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';

interface Banner {
    id: string;
    title: string;
    slug: string;
    position: string;
    enabled: boolean;
    sortOrder: number;
    desktopImage: {
        id: string;
        source: string;
        preview: string;
    };
    mobileImage: {
        id: string;
        source: string;
        preview: string;
    };
    collection: {
        id: string;
        name: string;
        slug: string;
    };
}

export default function HeroSection() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Minimum swipe distance
    const minSwipeDistance = 50;

    // ---------------- Fetch banners from API ----------------
    useEffect(() => {
        async function fetchBanners() {
            try {
                const response = await fetch('/api/store/banners?position=HERO');

                if (!response.ok) {
                    console.error('Failed to fetch hero banners:', response.statusText);
                    return;
                }

                const data = await response.json();

                if (data && Array.isArray(data) && data.length > 0) {
                    // Filter enabled banners and sort by sortOrder
                    const enabledBanners = data
                        .filter((banner: Banner) => banner.enabled)
                        .sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder);
                    setBanners(enabledBanners);
                }
            } catch (error) {
                console.error('Error fetching hero banners:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBanners();
    }, []);

    // ---------------- Auto slide ----------------
    useEffect(() => {
        if (isPlaying && banners.length > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % banners.length);
            }, 8000);
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
    }, [isPlaying, banners.length]);

    // ---------------- Navigation functions ----------------
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
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
    }, [banners.length]);

    // Don't render if loading or no banners
    if (loading) {
        return (
            <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 pt-4 mb-6">
                <div className="relative w-full overflow-hidden aspect-[16/11] sm:aspect-[20/11] md:aspect-[3/1.2] lg:aspect-[4/1.2] xl:aspect-[5/1.2] bg-gray-200 animate-pulse" />
            </section>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentSlide];
    const desktopImage = getImageUrl(currentBanner.desktopImage.source);
    const mobileImage = getImageUrl(currentBanner.mobileImage?.source || currentBanner.desktopImage.source);
    const bannerLink = `/collections/${currentBanner.collection.slug}`;

    return (
        <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 pt-4 mb-6">
            <div
                className="relative w-full rounded-xl overflow-hidden group aspect-[16/11] sm:aspect-[20/11] md:aspect-[3/1.2] lg:aspect-[4/1.2] xl:aspect-[5/1.2] bg-black"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
                role="banner"
                aria-label="Homepage banner carousel"
            >
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentSlide}
                        className="absolute inset-0"
                        initial={{ x: '5%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-5%', opacity: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        {/* Desktop Image */}
                        <Image
                            src={desktopImage}
                            alt={currentBanner.title}
                            fill
                            className="object-cover scale-105 hidden sm:block"
                            priority={currentSlide === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                            unoptimized
                        />
                        {/* Mobile Image */}
                        <Image
                            src={mobileImage}
                            alt={currentBanner.title}
                            fill
                            className="object-cover scale-105 sm:hidden"
                            priority={currentSlide === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                            unoptimized
                        />
                        <Link
                            href={bannerLink}
                            className="absolute inset-0 z-10"
                            aria-label={`View ${currentBanner.title}`}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Preload next images to prevent flashing */}
                {banners.length > 1 && (
                    <>
                        <link
                            rel="preload"
                            as="image"
                            href={getImageUrl(banners[(currentSlide + 1) % banners.length].desktopImage.source)}
                        />
                        {banners[(currentSlide + 1) % banners.length].mobileImage && (
                            <link
                                rel="preload"
                                as="image"
                                href={getImageUrl(banners[(currentSlide + 1) % banners.length].mobileImage!.source)}
                            />
                        )}
                    </>
                )}

                {/* Navigation arrows - Bottom right, always visible */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                        <button
                            onClick={prevSlide}
                            className="bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={20} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={20} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                )}

                {/* Indicator dots */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-xs">
                            <div className="flex gap-2">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`transition-all ${index === currentSlide
                                            ? 'bg-gray-800 w-8 h-3'
                                            : 'bg-gray-400 hover:bg-gray-600 w-3 h-3'
                                            } rounded-full`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
