'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, shouldBypassImageOptimization } from '@/lib/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/banner-target';
import SectionContainer from '@/components/layout/SectionContainer';

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
    const shouldBypassDesktopOptimization = shouldBypassImageOptimization(imageUrl);
    const shouldBypassMobileOptimization = shouldBypassImageOptimization(mobileImageUrl);

    if (!bannerHref) {
        return null;
    }

    return (
        <section className="mb-6 md:mb-8 mt-6">
            <SectionContainer className='px-8'>
                <Link
                    href={bannerHref}
                    className="block relative w-full h-52.5 rounded-lg overflow-hidden"
                >
                    <Image
                        src={imageUrl}
                        alt={banner.title}
                        fill
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
                </Link>
            </SectionContainer>
        </section>
    );
}
