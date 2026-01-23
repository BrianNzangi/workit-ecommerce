// src/components/banners/HorizontalBanner.tsx
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

interface HorizontalBannerProps {
    position?: 'DEALS_HORIZONTAL' | 'MIDDLE' | 'BOTTOM';
}

export default function HorizontalBanner({ position = 'DEALS_HORIZONTAL' }: HorizontalBannerProps) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBanners() {
            try {
                const response = await fetch(`/api/store/banners?position=${position}&enabled=true`);

                if (!response.ok) {
                    console.error(`Failed to fetch ${position} banners:`, response.statusText);
                    return;
                }

                const data = await response.json();

                if (data && Array.isArray(data)) {
                    // Filter for the requested position and enabled status, then sort
                    const enabledBanners = data
                        .filter((banner: Banner) => banner.position === position && banner.enabled)
                        .sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder);
                    setBanners(enabledBanners);
                }
            } catch (error) {
                console.error(`Error fetching ${position} banners:`, error);
            } finally {
                setLoading(false);
            }
        }

        fetchBanners();
    }, [position]);

    if (loading) {
        return (
            <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 mb-12">
                <div className="w-full h-[210px] bg-gray-200 animate-pulse rounded-xl" />
            </section>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    // Showing the first active banner for the requested position
    const banner = banners[0];
    const imageUrl = getImageUrl(banner.desktopImage?.preview || banner.desktopImage?.source);
    const mobileImageUrl = getImageUrl(banner.mobileImage?.preview || banner.mobileImage?.source || banner.desktopImage?.preview || banner.desktopImage?.source);

    const isHeroType = position === 'DEALS_HORIZONTAL';

    return (
        <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 mb-12">
            <Link
                href={`/collections/${banner.collection?.slug || ''}`}
                className={`block relative w-full h-[210px] rounded-xl overflow-hidden group shadow-sm transition-shadow ${isHeroType ? 'hover:shadow-md' : ''}`}
            >
                {/* Desktop Image */}
                <Image
                    src={imageUrl}
                    alt={banner.title}
                    fill
                    className={`object-cover hidden sm:block transition-transform duration-700 ${isHeroType ? 'group-hover:scale-105' : ''}`}
                    unoptimized
                />
                {/* Mobile Image */}
                <Image
                    src={mobileImageUrl}
                    alt={banner.title}
                    fill
                    className={`object-cover sm:hidden transition-transform duration-700 ${isHeroType ? 'group-hover:scale-105' : ''}`}
                    unoptimized
                />

                {/* Overlay with Content (if needed, but usually banners are self-contained images) */}
                <div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent flex flex-col justify-center p-8 sm:p-12">
                    {/* Optional: You can add title/description here if the image doesn't have it baked in */}
                </div>
            </Link>
        </section>
    );
}
