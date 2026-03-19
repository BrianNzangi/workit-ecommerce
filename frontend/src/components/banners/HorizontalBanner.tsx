'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/homepage-data';

interface HorizontalBannerProps {
    banner?: StoreBanner | null;
    position?: 'DEALS_HORIZONTAL' | 'MIDDLE' | 'BOTTOM';
}

export default function HorizontalBanner({
    banner,
    position = 'DEALS_HORIZONTAL',
}: HorizontalBannerProps) {
    if (!banner) {
        return null;
    }

    const imageUrl = getImageUrl(banner.desktopImage?.preview || banner.desktopImage?.source);
    const mobileImageUrl = getImageUrl(
        banner.mobileImage?.preview ||
        banner.mobileImage?.source ||
        banner.desktopImage?.preview ||
        banner.desktopImage?.source
    );
    const isHeroType = position === 'DEALS_HORIZONTAL';
    const bannerHref = getBannerHref(banner);

    if (!bannerHref) {
        return null;
    }

    return (
        <section className="container mx-auto px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8 mb-6 md:mb-8">
            <Link
                href={bannerHref}
                className={`block relative w-full h-52.5 rounded-lg overflow-hidden group transition-shadow ${isHeroType ? 'hover:shadow-md' : ''}`}
            >
                <Image
                    src={imageUrl}
                    alt={banner.title}
                    fill
                    className={`object-cover hidden sm:block transition-transform duration-700 ${isHeroType ? 'group-hover:scale-105' : ''}`}
                />
                <Image
                    src={mobileImageUrl}
                    alt={banner.title}
                    fill
                    className={`object-cover sm:hidden transition-transform duration-700 ${isHeroType ? 'group-hover:scale-105' : ''}`}
                />

                <div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent flex flex-col justify-center p-8 sm:p-12" />
            </Link>
        </section>
    );
}
