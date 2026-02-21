'use client';

import { useEffect, useState } from 'react';
import { fetchCollectionsClient } from '@/lib/collections-client';

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import MostShoppedCard from '../collections/MostShoppedCard';

interface CollectionItem {
    id: string;
    name: string;
    slug: string;
    mostShoppedSortOrder: number;
    image?: string;
}

export default function MostShopped() {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await fetchCollectionsClient({
                    parentId: 'null', // Start with root collections
                    includeChildren: true,
                    take: 100,
                    skip: 0,
                });

                const allFeaturedCollections: CollectionItem[] = [];
                const addedIds = new Set<string>();

                const findFeaturedRecursively = (items: any[]) => {
                    items.forEach((item: any) => {
                        if (item.showInMostShopped === true && !addedIds.has(item.id)) {
                            allFeaturedCollections.push({
                                id: item.id,
                                name: item.name,
                                slug: item.slug,
                                mostShoppedSortOrder: item.mostShoppedSortOrder || 0,
                                image: item.asset?.preview || item.asset?.source,
                            });
                            addedIds.add(item.id);
                        }

                        if (item.children && item.children.length > 0) {
                            findFeaturedRecursively(item.children);
                        }
                    });
                };

                findFeaturedRecursively(data);

                // Sort by mostShoppedSortOrder
                allFeaturedCollections.sort((a, b) => a.mostShoppedSortOrder - b.mostShoppedSortOrder);

                setCollections(allFeaturedCollections);
            } catch (err) {
                console.error('Error fetching collections:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateMobileState = () => setIsMobile(mediaQuery.matches);

        updateMobileState();
        mediaQuery.addEventListener('change', updateMobileState);
        return () => mediaQuery.removeEventListener('change', updateMobileState);
    }, []);

    const renderSkeleton = () => (
        <div className="w-30 flex flex-col items-center space-y-2">
            <div className="relative w-30 h-30 bg-gray-100 animate-pulse rounded-lg" />
            <div className="w-16 h-3 bg-gray-100 animate-pulse rounded mx-auto" />
        </div>
    );

    const renderCollection = (collection: CollectionItem) => (
        <SwiperSlide key={collection.id} className="h-auto!">
            <MostShoppedCard
                name={collection.name}
                slug={collection.slug}
                image={collection.image}
            />
        </SwiperSlide>
    );

    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-5 md:mb-6">
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-bold text-secondary-900 tracking-tight">
                            Most Shopped
                        </h2>
                    </div>
                </div>

                {/* Collections Carousel */}
                <div className="relative">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {Array.from({ length: 11 }, (_, i) => (
                                <div key={i}>
                                    {renderSkeleton()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Swiper
                            modules={[Autoplay, Navigation, Pagination]}
                            spaceBetween={24}
                            slidesPerView="auto"
                            navigation={!isMobile}
                            pagination={{ clickable: true, dynamicBullets: true }}
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
                            {collections.map(renderCollection)}
                        </Swiper>
                    )}
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
