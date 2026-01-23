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

interface CollectionItem {
    id: string;
    name: string;
    slug: string;
    image?: string;
}

export default function MostShopped() {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await fetchCollectionsClient({
                    take: 50,
                    skip: 0,
                });

                const allFeaturedCollections: CollectionItem[] = [];

                data.forEach((collection: Collection) => {
                    if (collection.showInMostShopped === true) {
                        allFeaturedCollections.push({
                            id: collection.id,
                            name: collection.name,
                            slug: collection.slug,
                            image: collection.asset?.preview || collection.asset?.source,
                        });
                    }

                    if (collection.children && collection.children.length > 0) {
                        collection.children.forEach((child: any) => {
                            if (child.showInMostShopped === true) {
                                allFeaturedCollections.push({
                                    id: child.id,
                                    name: child.name,
                                    slug: child.slug,
                                    image: child.asset?.preview || child.asset?.source,
                                });
                            }
                        });
                    }
                });

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
        <div className="flex flex-col items-center justify-center animate-pulse">
            <div className="w-[90px] h-[90px] rounded-lg bg-gray-200 mb-2" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
    );

    const renderCollection = (collection: CollectionItem) => (
        <SwiperSlide key={collection.id}>
            <Link
                href={`/collections/${collection.slug}`}
                className="flex flex-col items-center justify-center group transition-transform duration-300"
            >
                {/* Image Container - 90x90 Square */}
                <div className="relative w-[90px] h-[90px] overflow-hidden mb-1 rounded-lg">
                    {collection.image ? (
                        <Image
                            src={getImageUrl(collection.image)}
                            alt={collection.name}
                            fill
                            className="object-cover"
                            sizes="90px"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                            <span className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-tighter">
                                {collection.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Collection Name */}
                <div className="min-h-[2.4rem] md:min-h-[2.8rem] flex items-start justify-center px-1">
                    <h3 className="font-sans text-[11px] md:text-[16px] font-normal text-gray-800 text-center leading-tight group-hover:text-primary group-hover:underline transition-all">
                        {collection.name}
                    </h3>
                </div>
            </Link>
        </SwiperSlide>
    );

    return (
        <section className="py-6 sm:py-8 lg:pt-4">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900">
                        Most Shopped
                    </h2>
                </div>

                {/* Collections Carousel */}
                <div className="relative -mx-2 px-2">
                    {loading ? (
                        <div className="flex gap-3 overflow-hidden">
                            {Array.from({ length: 8 }, (_, i) => (
                                <div key={i} className="flex-none">
                                    {renderSkeleton()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={12}
                            slidesPerView={3.5}
                            navigation
                            pagination={{ clickable: true, dynamicBullets: true }}
                            breakpoints={{
                                480: {
                                    slidesPerView: 4.5,
                                    spaceBetween: 14,
                                },
                                640: {
                                    slidesPerView: 5.5,
                                    spaceBetween: 16,
                                },
                                768: {
                                    slidesPerView: 6.5,
                                    spaceBetween: 16,
                                },
                                1024: {
                                    slidesPerView: 8.5,
                                    spaceBetween: 20,
                                },
                                1280: {
                                    slidesPerView: 10.5,
                                    spaceBetween: 24,
                                },
                            }}
                            className="most-shopped-swiper pb-10!"
                        >
                            {collections.map(renderCollection)}
                        </Swiper>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .most-shopped-swiper .swiper-button-next,
                .most-shopped-swiper .swiper-button-prev {
                    color: var(--primary);
                    background: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    border: 1px solid #f3f4f6;
                }
                .most-shopped-swiper .swiper-button-next:after,
                .most-shopped-swiper .swiper-button-prev:after {
                    font-size: 14px;
                    font-weight: bold;
                }
                .most-shopped-swiper .swiper-pagination-bullet-active {
                    background: var(--primary);
                }
                .most-shopped-swiper .swiper-button-disabled {
                    opacity: 0;
                    pointer-events: none;
                }
            `}</style>
        </section>
    );
}
