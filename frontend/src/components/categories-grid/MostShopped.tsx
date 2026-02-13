'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';
import { fetchCollectionsClient } from '@/lib/collections-client';
import type { Collection } from '@/types/collections';

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import MostShoppedCard from '../collections/MostShoppedCard';

interface CollectionItem {
    id: string;
    name: string;
    slug: string;
    mostShoppedSortOrder: number;
    count: number;
    image?: string;
}

export default function MostShopped() {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await fetchCollectionsClient({
                    includeChildren: true,
                    take: 100, // Increased to get more potential featured items
                    skip: 0,
                });

                const allFeaturedCollections: CollectionItem[] = [];
                const addedIds = new Set<string>();

                data.forEach((collection: any) => {
                    if (collection.showInMostShopped === true && !addedIds.has(collection.id)) {
                        allFeaturedCollections.push({
                            id: collection.id,
                            name: collection.name,
                            slug: collection.slug,
                            mostShoppedSortOrder: collection.mostShoppedSortOrder || 0,
                            count: collection._count?.products || 0,
                            image: collection.asset?.preview || collection.asset?.source,
                        });
                        addedIds.add(collection.id);
                    }

                    if (collection.children && collection.children.length > 0) {
                        collection.children.forEach((child: any) => {
                            if (child.showInMostShopped === true && !addedIds.has(child.id)) {
                                allFeaturedCollections.push({
                                    id: child.id,
                                    name: child.name,
                                    slug: child.slug,
                                    mostShoppedSortOrder: child.mostShoppedSortOrder || 0,
                                    count: child._count?.products || 0,
                                    image: child.asset?.preview || child.asset?.source,
                                });
                                addedIds.add(child.id);
                            }
                        });
                    }
                });

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

    const renderSkeleton = () => (
        <div className="w-full aspect-[4/5] bg-gray-100 animate-pulse rounded-3xl" />
    );

    const renderCollection = (collection: CollectionItem) => (
        <SwiperSlide key={collection.id} className="h-auto!">
            <MostShoppedCard
                name={collection.name}
                slug={collection.slug}
                count={collection.count}
                image={collection.image}
            />
        </SwiperSlide>
    );

    return (
        <section className="py-12 bg-[#fafafa]">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Most Shopped
                        </h2>
                        <div className="h-1 w-12 bg-primary-900 rounded-full" />
                    </div>
                </div>

                {/* Collections Carousel */}
                <div className="relative">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i}>
                                    {renderSkeleton()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={24}
                            slidesPerView={2.2}
                            navigation
                            pagination={{ clickable: true, dynamicBullets: true }}
                            breakpoints={{
                                480: {
                                    slidesPerView: 2.5,
                                    spaceBetween: 16,
                                },
                                640: {
                                    slidesPerView: 3.5,
                                    spaceBetween: 20,
                                },
                                768: {
                                    slidesPerView: 4.5,
                                    spaceBetween: 24,
                                },
                                1024: {
                                    slidesPerView: 5.5,
                                    spaceBetween: 24,
                                },
                                1280: {
                                    slidesPerView: 6.5,
                                    spaceBetween: 24,
                                },
                            }}
                            className="most-shopped-swiper pb-12!"
                        >
                            {collections.map(renderCollection)}
                        </Swiper>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .most-shopped-swiper {
                    overflow: visible !important;
                }
                .most-shopped-swiper .swiper-button-next,
                .most-shopped-swiper .swiper-button-prev {
                    color: white;
                    background: #111;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    top: 40%;
                }
                .most-shopped-swiper .swiper-button-next:after,
                .most-shopped-swiper .swiper-button-prev:after {
                    font-size: 16px;
                    font-weight: bold;
                }
                .most-shopped-swiper .swiper-button-next {
                    right: -22px;
                }
                .most-shopped-swiper .swiper-button-prev {
                    left: -22px;
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
