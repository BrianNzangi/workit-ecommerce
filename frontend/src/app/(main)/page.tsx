import { Suspense } from 'react';
import type { Metadata } from 'next';
import CollectionSection from '@/components/home/CollectionSection';
import TopBrandsSection from '@/components/home/TopBrandsSection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import Deals from '@/components/home/Deals';
import HorizontalBanner from '@/components/banners/HorizontalBanner';
import AboutWorkit from '@/components/home/AboutWorkit';
import {
    getFeaturedBlogs,
    getHomepageBanners,
    getMostShoppedCollections,
} from '@/lib/homepage/homepage-data';
import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from '@/lib/meta/meta';
import {
    HeroSectionSkeleton,
    CategoriesSkeleton,
    DealsSkeleton,
    BannerSkeleton,
    BlogGridSkeleton,
} from '@/components/home/PageSkeletons';

export const metadata: Metadata = {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    openGraph: {
        ...DEFAULT_OG,
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        url: SITE_CONFIG.url,
    },
    twitter: DEFAULT_TWITTER,
};

export const revalidate = 0;

async function HeroSectionWrapper() {
    try {
        const banners = await getHomepageBanners();
        return <HeroSection banners={banners.HERO} />;
    } catch { return null; }
}

async function MostShoppedWrapper() {
    try {
        const collections = await getMostShoppedCollections();
        return <MostShopped collections={collections} />;
    } catch { return null; }
}

async function DealsWrapper() {
    try {
        const banners = await getHomepageBanners();
        return <Deals deals={banners.DEALS} />;
    } catch { return null; }
}

async function HorizontalBannerWrapper() {
    try {
        const banners = await getHomepageBanners();
        const banner = banners.DEALS_HORIZONTAL[0] || null;
        return <HorizontalBanner banner={banner} position="DEALS_HORIZONTAL" />;
    } catch { return null; }
}

async function MiddleBannerWrapper() {
    try {
        const banners = await getHomepageBanners();
        const banner = banners.MIDDLE[0] || null;
        if (!banner) return null;
        return <HorizontalBanner banner={banner} position="MIDDLE" />;
    } catch { return null; }
}

async function BottomBannerWrapper() {
    try {
        const banners = await getHomepageBanners();
        const banner = banners.BOTTOM[0] || null;
        if (!banner) return null;
        return <HorizontalBanner banner={banner} position="BOTTOM" />;
    } catch { return null; }
}

async function FeaturedBlogsWrapper() {
    try {
        const blogs = await getFeaturedBlogs();
        return <FeaturedBlogs blogs={blogs} />;
    } catch { return null; }
}

export default async function Home() {
    return (
        <div className="bg-white">
            <Suspense fallback={<HeroSectionSkeleton />}>
                <HeroSectionWrapper />
            </Suspense>

            <Suspense fallback={<CategoriesSkeleton />}>
                <MostShoppedWrapper />
            </Suspense>

            <Suspense fallback={<DealsSkeleton />}>
                <DealsWrapper />
            </Suspense>

            <Suspense fallback={<BannerSkeleton />}>
                <HorizontalBannerWrapper />
            </Suspense>

            <CollectionSection slug="daily-offers" title="Daily Offers" index={0} />
            <CollectionSection slug="best-selling-laptops" title="Best Selling Laptops" index={1} />
            <CollectionSection slug="bluetooth-speakers" title="Bluetooth Speakers" index={2} />

            <Suspense fallback={<BannerSkeleton />}>
                <MiddleBannerWrapper />
            </Suspense>

            <CollectionSection slug="top-monitors" title="Top Monitors" index={3} />
            <CollectionSection slug="featured-televisions" title="Featured Televisions" index={4} />
            <CollectionSection slug="home-audio" title="Home Audio" index={5} />

            <Suspense fallback={<BannerSkeleton />}>
                <BottomBannerWrapper />
            </Suspense>

            <CollectionSection slug="featured-home-kitchen" title="Featured Home & Kitchen" index={6} />
            <CollectionSection slug="popular-networking-devices" title="Popular Networking Devices" index={7} />
            <CollectionSection slug="featured-smartphones" title="Featured Smartphones" index={8} />

            <Suspense fallback={null}>
                <TopBrandsSection />
            </Suspense>

            <Suspense fallback={<BlogGridSkeleton />}>
                <FeaturedBlogsWrapper />
            </Suspense>

            <AboutWorkit />
        </div>
    );
}
