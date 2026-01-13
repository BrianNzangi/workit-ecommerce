'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { fetchCollectionsClient } from '@/lib/collections-client';
import type { Collection } from '@/types/collections';

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
                // Fetch all collections
                const data = await fetchCollectionsClient({
                    take: 50, // Fetch more to ensure we get enough children
                    skip: 0,
                });

                // Filter to only include collections marked for "Most Shopped" section
                const childCollections = data.filter((collection: Collection) =>
                    collection.showInMostShopped === true
                );

                // Transform collections to the format we need
                const items: CollectionItem[] = childCollections
                    .slice(0, 12) // Limit to 12 items for display
                    .map((collection: Collection) => ({
                        id: collection.id,
                        name: collection.name,
                        slug: collection.slug,
                        image: collection.asset?.preview || collection.asset?.source,
                    }));

                setCollections(items);
            } catch (err) {
                console.error('Error fetching collections:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    const renderSkeleton = () => (
        <div className="group animate-pulse">
            <div className="w-full aspect-[4/3] sm:aspect-[3/2] bg-gray-200 mb-2 sm:mb-3 rounded-xl" />
            <div className="space-y-1 sm:space-y-2">
                <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded" />
            </div>
        </div>
    );

    const renderCollection = (collection: CollectionItem) => (
        <div key={collection.id} className="group">
            <a
                href={`/collections/${collection.slug}`}
                className="block"
            >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-2 sm:mb-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    {collection.image ? (
                        <Image
                            src={getImageUrl(collection.image)}
                            alt={collection.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <span className="text-gray-600 text-sm sm:text-base font-semibold text-center">
                                {collection.name}
                            </span>
                        </div>
                    )}

                    {/* Collection badge for mobile */}
                    <div className="absolute bottom-2 left-2 sm:hidden">
                        <span className="bg-white bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium text-gray-800 shadow-sm">
                            {collection.name}
                        </span>
                    </div>
                </div>

                {/* Collection Name - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:block">
                    <h3 className="font-[DM_Sans] text-sm md:text-base lg:text-md font-semibold text-gray-800 line-clamp-2 leading-tight">
                        {collection.name}
                    </h3>
                </div>
            </a>
        </div>
    );

    return (
        <section className="py-4 sm:py-6 lg:py-8">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-2 sm:mb-4">
                    <h2 className="font-[DM_Sans] text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900">
                        Most Shopped
                    </h2>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-4">
                    {loading
                        ? Array.from({ length: 12 }, (_, i) => (
                            <div key={i}>
                                {renderSkeleton()}
                            </div>
                        ))
                        : collections.map(renderCollection)
                    }
                </div>
            </div>
        </section>
    );
}
