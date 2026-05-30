'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, shouldBypassImageOptimization } from '@/lib/image/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/banner/banner-target';
import SectionContainer from '@/components/layout/SectionContainer';

interface HorizontalBannerProps {
    banner?: StoreBanner | null;
    position?: 'DEALS_HORIZONTAL' | 'MIDDLE' | 'BOTTOM';
}

export default function HorizontalBanner({
    banner,
    position = 'DEALS_HORIZONTAL',
}: HorizontalBannerProps) {
    if (!banner) return null;

    const imageUrl = getImageUrl(banner.desktopImage?.preview || banner.desktopImage?.source);
    const mobileImageUrl = getImageUrl(
        banner.mobileImage?.preview ||
        banner.mobileImage?.source ||
        banner.desktopImage?.preview ||
        banner.desktopImage?.source
    );
    const bannerHref = getBannerHref(banner);
    const shouldBypassDesktopOptimization = shouldBypassImageOptimization(imageUrl);
    const shouldBypassMobileOptimization = shouldBypassImageOptimization(mobileImageUrl);

    if (!imageUrl) return null;

    const content = (
        <>
            <Image
                src={imageUrl}
                alt={banner.title}
                fill
                priority={position === 'DEALS_HORIZONTAL'}
                className="object-cover hidden sm:block"
                unoptimized={shouldBypassDesktopOptimization}
            />
            <Image
                src={mobileImageUrl}
                alt={banner.title}
                fill
                className="object-cover sm:hidden"
                unoptimized={shouldBypassMobileOptimization}
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12" />
        </>
    );

    return (
        <section className="py-2 md:py-4">
            <SectionContainer className="px-6 sm:px-8 lg:px-16">
                {bannerHref ? (
                    <Link
                        href={bannerHref}
                        className="block relative w-full h-52 rounded-md overflow-hidden"
                    >
                        {content}
                    </Link>
                ) : (
                    <div className="block relative w-full h-52 rounded-md overflow-hidden">
                        {content}
                    </div>
                )}
            </SectionContainer>
        </section>
    );
}
