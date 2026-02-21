import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';

const AboutWorkit = dynamic(() => import('@/components/home/AboutWorkit'), { ssr: true });
const FeaturedBlogs = dynamic(() => import('@/components/blog/FeaturedBlogs'), { ssr: true });
const Deals = dynamic(() => import('@/components/home/Deals'), { ssr: true });
const HorizontalBanner = dynamic(() => import('@/components/banners/HorizontalBanner'), { ssr: true });

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
  return (
    <div className="bg-white">
      {/* Home Banner */}
      <HeroSection />

      {/* Most Shopped Collections */}
      <MostShopped />

      {/* Promotional Deals */}
      <Deals />

      {/* Horizontal Banner Deal */}
      <HorizontalBanner />

      {/* Homepage Collections - Component fetches its own data */}
      <HomepageCollection />

      <FeaturedBlogs />
      <AboutWorkit />
    </div>
  );
}
