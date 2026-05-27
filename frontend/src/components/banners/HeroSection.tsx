'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl, shouldBypassImageOptimization } from '@/lib/image/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/banner/banner-target';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import SectionContainer from '@/components/layout/SectionContainer';

interface HeroSectionProps {
    banners: StoreBanner[];
}

const AUTO_PLAY_INTERVAL = 8000;
const SWIPE_THRESHOLD = 50;

export default function HeroSection({ banners }: HeroSectionProps) {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const goToSlide = useCallback((index: number) => {
        if (banners.length === 0) return;
        const next = ((index % banners.length) + banners.length) % banners.length;
        setCurrentSlide(next);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [banners.length]);

    const nextSlide = useCallback(() => {
        goToSlide(currentSlide + 1);
    }, [goToSlide, currentSlide]);

    const prevSlide = useCallback(() => {
        goToSlide(currentSlide - 1);
    }, [goToSlide, currentSlide]);

    useEffect(() => {
        if (!isAutoPlaying || banners.length <= 1) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }
        intervalRef.current = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAutoPlaying, banners.length, nextSlide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (banners.length <= 1) return;
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [banners.length, prevSlide, nextSlide]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
        if (touchStartX.current !== null) {
            e.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > SWIPE_THRESHOLD) {
            if (distance > 0) nextSlide();
            else prevSlide();
        }
    };

    const pauseAutoPlay = () => setIsAutoPlaying(false);
    const resumeAutoPlay = () => setIsAutoPlaying(true);

    if (banners.length === 0) return null;

    const currentBanner = banners[currentSlide];
    const desktopImage = getImageUrl(
        currentBanner.desktopImage?.source || currentBanner.desktopImage?.preview || ''
    );
    const mobileImage = getImageUrl(
        currentBanner.mobileImage?.source ||
        currentBanner.mobileImage?.preview ||
        currentBanner.desktopImage?.source ||
        currentBanner.desktopImage?.preview ||
        ''
    );
    const shouldBypassDesktop = shouldBypassImageOptimization(desktopImage);
    const shouldBypassMobile = shouldBypassImageOptimization(mobileImage);
    const bannerHref = getBannerHref(currentBanner);

    const prefetchBanner = () => {
        if (bannerHref) router.prefetch(bannerHref);
    };

    return (
        <section
            role="region"
            aria-roledescription="carousel"
            aria-label="Homepage banner carousel"
        >
            <SectionContainer className="px-10 sm:px-12 lg:px-16 py-6">
                <div
                    className="relative w-full overflow-hidden rounded-sm bg-secondary-900"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseEnter={pauseAutoPlay}
                    onMouseLeave={resumeAutoPlay}
                    onFocusCapture={pauseAutoPlay}
                    onBlurCapture={resumeAutoPlay}
                >
                    <div className="h-45 md:h-75"
                        aria-live="polite"
                        aria-atomic="false"
                    >
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={currentSlide}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`Slide ${currentSlide + 1} of ${banners.length}`}
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
                                    className="object-cover hidden sm:block"
                                    priority={currentSlide === 0}
                                    fetchPriority={currentSlide === 0 ? 'high' : undefined}
                                    quality={95}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 96vw, 1400px"
                                    unoptimized={shouldBypassDesktop}
                                />
                                <Image
                                    src={mobileImage}
                                    alt={currentBanner.title}
                                    fill
                                    className="object-cover scale-105 sm:hidden"
                                    priority={currentSlide === 0}
                                    fetchPriority={currentSlide === 0 ? 'high' : undefined}
                                    quality={95}
                                    sizes="100vw"
                                    unoptimized={shouldBypassMobile}
                                />
                                {bannerHref && (
                                    <Link
                                        href={bannerHref}
                                        className="absolute inset-0 z-10"
                                        aria-label={`View ${currentBanner.title}`}
                                        onMouseEnter={prefetchBanner}
                                        onFocus={prefetchBanner}
                                        onTouchStart={prefetchBanner}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {banners.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevSlide}
                                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-secondary-800 shadow-xs rounded-full"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={cn(
                                            'rounded-full transition-all duration-300 pointer-events-auto',
                                            index === currentSlide
                                                ? 'bg-primary-900 w-6 h-2.5'
                                                : 'bg-white/70 hover:bg-white w-2.5 h-2.5'
                                        )}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextSlide}
                                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-secondary-800 shadow-xs rounded-full"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </>
                    )}
                </div>
            </SectionContainer>
        </section>
    );
}
