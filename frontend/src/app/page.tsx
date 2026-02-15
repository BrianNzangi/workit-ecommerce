import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';

const AboutWorkit = dynamic(() => import('@/components/home/AboutWorkit'), { ssr: true });
const FeaturedBlogs = dynamic(() => import('@/components/blog/FeaturedBlogs'), { ssr: true });
const Deals = dynamic(() => import('@/components/home/Deals'), { ssr: true });
const HorizontalBanner = dynamic(() => import('@/components/banners/HorizontalBanner'), { ssr: true });
const AuthModalWrapper = dynamic(() => import('@/components/auth/AuthModalWrapper'), { ssr: false });

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

export default async function Home() {
  return (
    <div className="space-y-12 bg-white">
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

      {/* Auth Modal */}
      <AuthModalWrapper />
    </div>
  );
}

