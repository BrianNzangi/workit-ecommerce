import type { Metadata } from 'next';
import HomepageCollection from '@/components/home/HomepageCollection';
import MostShopped from '@/components/categories-grid/MostShopped';
import HeroSection from '@/components/banners/HeroSection';
import AboutWorkit from '@/components/home/AboutWorkit';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';
import Deals from '@/components/home/Deals';
import HorizontalBanner from '@/components/banners/HorizontalBanner';
import AuthModalWrapper from '@/components/auth/AuthModalWrapper';
import { getSignInUrl, getSignUpUrl } from '@workos-inc/authkit-nextjs';

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
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();

  return (
    <div className="space-y-12 bg-[#F8F9FC]">
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
      <AuthModalWrapper signInUrl={signInUrl} signUpUrl={signUpUrl} />
    </div>
  );
}

