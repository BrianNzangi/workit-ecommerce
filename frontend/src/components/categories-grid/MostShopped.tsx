'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import MostShoppedCard from '../collections/MostShoppedCard';
import type { MostShoppedCollection } from '@/lib/homepage-data';

interface MostShoppedProps {
    collections: MostShoppedCollection[];
}

export default function MostShopped({ collections }: MostShoppedProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateMobileState = () => setIsMobile(mediaQuery.matches);

        updateMobileState();
        mediaQuery.addEventListener('change', updateMobileState);
        return () => mediaQuery.removeEventListener('change', updateMobileState);
    }, []);

    if (collections.length === 0) {
        return null;
    }

    return (
        <section className="bg-white">
            <div className="container mx-auto pt-2 px-4 md:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-5 md:mb-6">
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-bold text-secondary-900 tracking-tight">
                            Most Shopped
                        </h2>
                    </div>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView="auto"
                        navigation={!isMobile}
                        pagination={isMobile ? { clickable: true, dynamicBullets: true } : false}
                        autoplay={
                            isMobile && collections.length > 1
                                ? {
                                    delay: 2400,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: false,
                                }
                                : false
                        }
                        loop={isMobile && collections.length > 2}
                        speed={650}
                        allowTouchMove={isMobile}
                        className="most-shopped-swiper pb-8! md:pb-10!"
                    >
                        {collections.map((collection) => (
                            <SwiperSlide key={collection.id} className="h-auto!">
                                <MostShoppedCard
                                    name={collection.name}
                                    slug={collection.slug}
                                    image={collection.image}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <style jsx global>{`
                .most-shopped-swiper {
                    overflow: hidden !important;
                }
                .most-shopped-swiper .swiper-slide {
                    width: auto !important;
                }
                .most-shopped-swiper .swiper-button-next,
                .most-shopped-swiper .swiper-button-prev {
                    color: white;
                    background: #111;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    top: 35%;
                    z-index: 20;
                }
                .most-shopped-swiper .swiper-button-next:after,
                .most-shopped-swiper .swiper-button-prev:after {
                    font-size: 12px;
                    font-weight: bold;
                }
                .most-shopped-swiper .swiper-button-next {
                    right: 4px;
                }
                .most-shopped-swiper .swiper-button-prev {
                    left: 4px;
                }
                .most-shopped-swiper .swiper-pagination-bullet-active {
                    background: #111;
                }
                .most-shopped-swiper .swiper-button-disabled {
                    opacity: 0;
                    pointer-events: none;
                }
                @media (max-width: 768px) {
                    .most-shopped-swiper .swiper-button-next,
                    .most-shopped-swiper .swiper-button-prev {
                        display: none;
                    }
                }
            `}</style>
        </section>
    );
}
