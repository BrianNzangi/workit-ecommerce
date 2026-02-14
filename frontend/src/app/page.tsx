import type { Metadata } from 'next';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';
import AboutWorkit from '@/components/home/AboutWorkit';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import Deals from '@/components/home/Deals';
import HorizontalBanner from '@/components/banners/HorizontalBanner';
import AuthModalWrapper from '@/components/auth/AuthModalWrapper';

export const metadata: Metadata = {
  title: "Workit - Best Deals on Phones, Laptops, TVs & Accessories",
  description: "Find the best deals on phones, laptops, TVs, and accessories at Workit. Trusted electronics store with fast delivery and reliable customer support.",
  openGraph: {
    title: "Workit - Best Deals on Phones, Laptops, TVs & Accessories",
    description: "Find the best deals on phones, laptops, TVs, and accessories at Workit. Trusted electronics store with fast delivery and reliable customer support.",
    url: "https://www.workit.co.ke/",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Workit - Best Deals on Phones, Laptops, TVs & Accessories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workit - Best Deals on Phones, Laptops, TVs & Accessories",
    description: "Find the best deals on phones, laptops, TVs, and accessories at Workit. Trusted electronics store with fast delivery and reliable customer support.",
  },
};

import { getMostShoppedCollections, getHomepageCollections, getBanners } from '@/lib/home-server';

export const revalidate = 10; // Revalidate every 10 seconds for "instant" update feel

export default async function Home() {
  const [
    heroBanners,
    dealsBanners,
    mostShoppedData,
    homepageCollectionsData
  ] = await Promise.all([
    getBanners('HERO'),
    getBanners('DEALS'),
    getMostShoppedCollections(),
    getHomepageCollections(),
  ]);

  return (
    <div className="space-y-12 bg-white">
      {/* Home Banner */}
      <HeroSection initialBanners={heroBanners} />

      {/* Most Shopped Collections */}
      <MostShopped initialCollections={mostShoppedData} />

      {/* Promotional Deals */}
      <Deals initialDeals={dealsBanners} />

      {/* Horizontal Banner Deal */}
      <HorizontalBanner />

      {/* Homepage Collections - Now pre-fetched on server */}
      <HomepageCollection initialCollections={homepageCollectionsData} />

      <FeaturedBlogs />
      <AboutWorkit />

      {/* Auth Modal */}
      <AuthModalWrapper />
    </div>
  );
}

