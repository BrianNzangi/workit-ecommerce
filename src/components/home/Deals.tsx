'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

export default function Deals() {
    const [deals, setDeals] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDeals() {
            try {
                const response = await fetch('/api/store/banners?position=DEALS');

                if (!response.ok) {
                    console.error('Failed to fetch deals banners:', response.statusText);
                    return;
                }

                const data = await response.json();

                if (data && Array.isArray(data) && data.length > 0) {
                    // Filter enabled banners and sort by sortOrder
                    const enabledDeals = data
                        .filter((banner: Banner) => banner.enabled)
                        .sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder);
                    setDeals(enabledDeals);
                }
            } catch (error) {
                console.error('Error fetching deals banners:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDeals();
    }, []);

    if (loading) {
        return (
            <section className="py-4 sm:py-6 lg:py-8">
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 rounded-xs animate-pulse h-80" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (deals.length === 0) {
        return null;
    }

    return (
        <section className="py-4 sm:py-6 lg:py-8">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Deals Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {deals.map((deal) => {
                        // Skip banners without a collection
                        if (!deal.collection) {
                            return null;
                        }

                        const imageUrl = getImageUrl(deal.desktopImage.source);
                        const ctaText = `Shop ${deal.collection.name} Deals`;

                        return (
                            <Link
                                key={deal.id}
                                href={`/collections/${deal.collection.slug}`}
                                className="block bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Card Container */}
                                <div className="p-4 sm:p-5">
                                    {/* Title */}
                                    <h3 className="font-[DM_Sans] text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
                                        {deal.title}
                                    </h3>

                                    {/* Image Container */}
                                    <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden rounded-lg mb-3 sm:mb-4">
                                        <Image
                                            src={imageUrl}
                                            alt={deal.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            unoptimized
                                        />
                                    </div>

                                    {/* CTA Link */}
                                    <div className="flex items-center gap-1">
                                        <span className="font-[DM_Sans] text-sm sm:text-base font-medium text-blue-600">
                                            {ctaText}
                                        </span>
                                        <svg
                                            className="w-4 h-4 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
