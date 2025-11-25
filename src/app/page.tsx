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

  const fetchCollection = async (slug: string): Promise<CollectionType> => {
    try {
      const res = await fetch(`${baseUrl}/api/home-collection?slug=${slug}`, {
        next: { revalidate: 60 },
        cache: 'no-store' // Don't cache during development
      });

      if (!res.ok) {
        console.warn(`Collection ${slug} not found, will be hidden`);
        return { title: slug.replace(/-/g, ' '), slug, products: [] };
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error(`Failed to parse JSON for slug: ${slug}`, jsonErr);
        return { title: slug.replace(/-/g, ' '), slug, products: [] };
      }

      // Ensure the returned structure matches our type
      return {
        title: data.title || slug.replace(/-/g, ' '),
        slug: data.slug || slug,
        products: Array.isArray(data.products) ? data.products : [],
      };
    } catch (err) {
      console.error(`Error fetching collection ${slug}:`, err);
      return { title: slug.replace(/-/g, ' '), slug, products: [] };
    }
  };

  // Fetch all homepage collections in parallel
  const [
    featuredDeals,
    popularDevices,
    recommended,
    popularElectronics,
    latestAppliances,
  ] = await Promise.all([
    fetchCollection('featured-deals'),
    fetchCollection('popular-devices'),
    fetchCollection('recommended-for-you'),
    fetchCollection('popular-electronics'),
    fetchCollection('latest-appliances'),
  ]);

  return (
    <div className="space-y-12 bg-[#F8F9FC]">
      {/* Home Banner */}
      <HomeBanner />

      {/* Top Categories */}
      <TopCategoriesGrid />

      {/* Homepage collections - only show if they have products */}
      {featuredDeals.products.length > 0 && <HomepageCollection {...featuredDeals} />}
      {popularDevices.products.length > 0 && <HomepageCollection {...popularDevices} />}
      {recommended.products.length > 0 && <HomepageCollection {...recommended} />}
      {popularElectronics.products.length > 0 && <HomepageCollection {...popularElectronics} />}
      {latestAppliances.products.length > 0 && <HomepageCollection {...latestAppliances} />}

      <FeaturedBlogs />
      <AboutWorkit />

    </div>
  );
}
