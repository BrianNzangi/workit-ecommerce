import type { Metadata } from 'next';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import Deals from '@/components/home/Deals';
import HorizontalBanner from '@/components/banners/HorizontalBanner';
import AboutWorkit from '@/components/home/AboutWorkit';
import {
    getFeaturedBlogs,
    getFirstBanner,
    getHomepageCollections,
    getMostShoppedCollections,
    getStoreBanners,
} from '@/lib/homepage-data';
import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from '@/lib/meta';

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

export const dynamic = 'force-dynamic';

const unwrapSettled = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

export default async function Home() {
    const results = await Promise.allSettled([
        getStoreBanners('HERO'),
        getStoreBanners('DEALS'),
        getFirstBanner('DEALS_HORIZONTAL'),
        getFirstBanner('MIDDLE'),
        getFirstBanner('BOTTOM'),
        getMostShoppedCollections(),
        getHomepageCollections({ status: 'active' }),
        getFeaturedBlogs(),
    ]);

    const heroBanners = unwrapSettled(results[0], []);
    const dealsBanners = unwrapSettled(results[1], []);
    const topHorizontalBanner = unwrapSettled(results[2], null);
    const middleBanner = unwrapSettled(results[3], null);
    const bottomBanner = unwrapSettled(results[4], null);
    const mostShoppedCollections = unwrapSettled(results[5], []);
    const homepageCollections = unwrapSettled(results[6], []);
    const featuredBlogs = unwrapSettled(results[7], []);

    return (
        <div className="bg-white">
            <HeroSection banners={heroBanners} />
            <MostShopped collections={mostShoppedCollections} />
            <Deals deals={dealsBanners} />
            <HorizontalBanner banner={topHorizontalBanner} position="DEALS_HORIZONTAL" />
            <HomepageCollection
                collections={homepageCollections}
                middleBanner={middleBanner}
                bottomBanner={bottomBanner}
            />
            <FeaturedBlogs blogs={featuredBlogs} />
            <AboutWorkit />
        </div>
    );
}
