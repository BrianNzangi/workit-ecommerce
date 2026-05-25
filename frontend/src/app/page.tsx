import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import Deals from '@/components/home/Deals';
import HorizontalBanner from '@/components/banners/HorizontalBanner';
import AboutWorkit from '@/components/home/AboutWorkit';
import {
    getFeaturedBlogs,
    getHomepageBanners,
    getHomepageCollections,
    getMostShoppedCollections,
    getFeaturedDeals,
    getFlashSales,
    getClearanceDeals,
} from '@/lib/homepage/homepage-data';
import { recordSsrRenderTime } from '@/lib/utils/metrics';
import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from '@/lib/meta/meta';

const FeaturedDealsSection = dynamic(
    () => import('@/components/home/FeaturedDealsSection'),
);
const FlashSalesSection = dynamic(
    () => import('@/components/home/FlashSalesSection'),
);
const ClearanceDealsSection = dynamic(
    () => import('@/components/home/ClearanceDealsSection'),
);

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

export const revalidate = 300;

const unwrapSettled = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

export default async function Home() {
    const startedAt = Date.now();
    const results = await Promise.allSettled([
        getHomepageBanners(),
        getMostShoppedCollections(),
        getHomepageCollections({ status: 'active' }),
        getFeaturedBlogs(),
        getFeaturedDeals(),
        getFlashSales(),
        getClearanceDeals(),
    ]);

    const homepageBanners = unwrapSettled(results[0], {
        HERO: [],
        DEALS: [],
        DEALS_HORIZONTAL: [],
        MIDDLE: [],
        BOTTOM: [],
    });
    const heroBanners = homepageBanners.HERO;
    const dealsBanners = homepageBanners.DEALS;
    const topHorizontalBanner = homepageBanners.DEALS_HORIZONTAL[0] || null;
    const middleBanner = homepageBanners.MIDDLE[0] || null;
    const bottomBanner = homepageBanners.BOTTOM[0] || null;
    const mostShoppedCollections = unwrapSettled(results[1], []);
    const homepageCollections = unwrapSettled(results[2], []);
    const featuredBlogs = unwrapSettled(results[3], []);
    const featuredDeals = unwrapSettled(results[4], []);
    const flashSales = unwrapSettled(results[5], []);
    const clearanceDeals = unwrapSettled(results[6], []);
    recordSsrRenderTime('/', Date.now() - startedAt);

    return (
        <div className="bg-white">
            <HeroSection banners={heroBanners} />
            <MostShopped collections={mostShoppedCollections} />
            <Deals deals={dealsBanners} />
            <FeaturedDealsSection deals={featuredDeals} />
            <HorizontalBanner banner={topHorizontalBanner} position="DEALS_HORIZONTAL" />
            <FlashSalesSection sales={flashSales} />
            <HomepageCollection
                collections={homepageCollections}
                middleBanner={middleBanner}
                bottomBanner={bottomBanner}
            />
            <ClearanceDealsSection deals={clearanceDeals} />
            <FeaturedBlogs blogs={featuredBlogs} />
            <AboutWorkit />
        </div>
    );
}
