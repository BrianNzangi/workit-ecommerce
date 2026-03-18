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

export default async function Home() {
    const [
        heroBanners,
        dealsBanners,
        topHorizontalBanner,
        middleBanner,
        bottomBanner,
        mostShoppedCollections,
        homepageCollections,
        featuredBlogs,
    ] = await Promise.all([
        getStoreBanners('HERO'),
        getStoreBanners('DEALS'),
        getFirstBanner('DEALS_HORIZONTAL'),
        getFirstBanner('MIDDLE'),
        getFirstBanner('BOTTOM'),
        getMostShoppedCollections(),
        getHomepageCollections({ status: 'active' }),
        getFeaturedBlogs(),
    ]);

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
