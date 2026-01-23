'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';

interface Banner {
    id: string;
    title: string;
    description?: string;
    slug: string;
    position: string;
    enabled: boolean;
    sortOrder: number;
    desktopImage?: {
        id: string;
        source: string;
        preview: string;
    };
    mobileImage?: {
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
                const response = await fetch('/api/store/banners?position=DEALS&enabled=true');

                if (!response.ok) {
                    console.error('Failed to fetch deals banners:', response.statusText);
                    return;
                }

                const data = await response.json();

                if (data && Array.isArray(data)) {
                    // filter for position DEALS and enabled status, then sort
                    const enabledDeals = data
                        .filter((banner: Banner) => banner.position === 'DEALS' && banner.enabled)
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
                <div className="container mx-auto px-2 sm:px-2 md:px-2 lg:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 md:gap-2 lg:gap-2">
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
        <section className="sm:py-6 lg:py-0">
            <div className="container mx-auto px-2 sm:px-2 md:px-2 lg:px-6">
                {/* Deals Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 md:gap-2 lg:gap-2">
                    {deals.map((deal) => {
                        // Skip banners without a collection or image
                        if (!deal.collection || !deal.desktopImage) {
                            return null;
                        }

                        const imageUrl = getImageUrl(deal.desktopImage.preview || deal.desktopImage.source);
                        const ctaText = `Shop ${deal.collection.name} Deals`;

                        return (
                            <Link
                                key={deal.id}
                                href={`/collections/${deal.collection.slug}`}
                                className="block rounded-lg overflow-hidden transition-shadow"
                            >
                                {/* Card Container */}
                                <div className="p-2 sm:p-2 md:p-2 lg:p-2">
                                    {/* Image Container */}
                                    <div className="relative w-full aspect-[16/8.4] sm:aspect-16/11 overflow-hidden rounded-lg mb-3 sm:mb-4">
                                        <Image
                                            src={imageUrl}
                                            alt={deal.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-sans text-md sm:text-lg md:text-xl font-bold text-gray-900 leading-tight mb-1 sm:mb-1">
                                        {deal.title}
                                    </h3>

                                    {/* Description */}
                                    {deal.description && (
                                        <p className="font-sans text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-3 mb-3 sm:mb-4">
                                            {deal.description}
                                        </p>
                                    )}

                                    {/* CTA Link */}
                                    <div className="flex items-center gap-1">
                                        <span className="font-sans text-sm sm:text-base font-medium text-primary-800">
                                            {ctaText}
                                        </span>
                                        <svg
                                            className="w-4 h-4 text-primary-800"
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
