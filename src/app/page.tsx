import type { Metadata } from 'next';
import HomepageCollection from '@/components/home/HomepageCollection';
import TopCategoriesGrid from '@/components/categories-grid/TopCategoriesGrid';
import HomeBanner from '@/components/banners/HomeBanner';
import { HomepageCollection as CollectionType } from '@/types/product';
import AboutWorkit from '@/components/home/AboutWorkit';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';

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
  // Use correct port for development
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'  // Storefront runs on 3001
    : 'https://workit.co.ke';

  // Fetch all homepage collections dynamically
  let collections: CollectionType[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/home-collection`, {
      next: { revalidate: 60 },
      cache: 'no-store'
    });

    if (res.ok) {
      collections = await res.json();
    }
  } catch (err) {
    console.error('Error fetching homepage collections:', err);
  }

  return (
    <div className="space-y-12 bg-[#F8F9FC]">
      {/* Home Banner */}
      <HomeBanner />

      {/* Top Categories */}
      <TopCategoriesGrid />

      {/* Homepage collections - dynamically rendered */}
      {collections.map((collection) => (
        collection.products.length > 0 && (
          <HomepageCollection key={collection.slug} {...collection} />
        )
      ))}

      <FeaturedBlogs />
      <AboutWorkit />

    </div>
  );
}
