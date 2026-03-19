'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/homepage-data';

interface HeroSectionProps {
    banners: StoreBanner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const minSwipeDistance = 50;

    useEffect(() => {
        if (!isPlaying || banners.length <= 1) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 8000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, banners.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (banners.length <= 1) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
            } else if (e.key === 'ArrowRight') {
                setCurrentSlide((prev) => (prev + 1) % banners.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [banners.length]);

    if (banners.length === 0) {
        return null;
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

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

    const currentBanner = banners[currentSlide];
    const desktopImage = getImageUrl(
        currentBanner.desktopImage?.source || currentBanner.desktopImage?.preview
    );
    const mobileImage = getImageUrl(
        currentBanner.mobileImage?.source ||
        currentBanner.mobileImage?.preview ||
        currentBanner.desktopImage?.source ||
        currentBanner.desktopImage?.preview
    );
    const bannerHref = getBannerHref(currentBanner);

    const prefetchBanner = () => {
        if (bannerHref) {
            router.prefetch(bannerHref);
        }
    };

    return (
        <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 pt-4 mb-4 md:mb-5">
            <div
                className="relative w-full rounded-xl overflow-hidden group aspect-[16/13.2] sm:aspect-[20/13.2] md:aspect-[3/1.44] lg:aspect-[4/1.44] xl:aspect-[5/1.44] bg-black"
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
                            ease: [0.4, 0, 0.2, 1],
                        }}
                    >
                        <Image
                            src={desktopImage}
                            alt={currentBanner.title}
                            fill
                            className="object-cover scale-105 hidden sm:block"
                            priority={currentSlide === 0}
                            quality={95}
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 96vw, 1400px"
                        />
                        <Image
                            src={mobileImage}
                            alt={currentBanner.title}
                            fill
                            className="object-cover scale-105 sm:hidden"
                            priority={currentSlide === 0}
                            quality={95}
                            sizes="100vw"
                        />
                        {bannerHref ? (
                            <Link
                                href={bannerHref}
                                className="absolute inset-0 z-10"
                                aria-label={`View ${currentBanner.title}`}
                                onMouseEnter={prefetchBanner}
                                onFocus={prefetchBanner}
                                onTouchStart={prefetchBanner}
                            />
                        ) : null}
                    </motion.div>
                </AnimatePresence>

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
