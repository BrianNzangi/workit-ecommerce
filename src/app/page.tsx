// src/app/page.tsx
import HomepageCollection from '@/components/home/HomepageCollection';
import TopCategoriesGrid from '@/components/categories-grid/TopCategoriesGrid';
import HomeBanner from '@/components/banners/HomeBanner';
import { HomepageCollection as CollectionType } from '@/types/product';
import AboutWorkit from '@/components/home/AboutWorkit';
import FeaturedBlogs from '@/components/blog/FeaturedBlogs';

export default async function Home() {
  const fetchCollection = async (slug: string): Promise<CollectionType> => {
    try {
      const res = await fetch(`/api/home-collection?slug=${slug}`, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Failed to fetch collection ${slug}`);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error(`Failed to parse JSON for slug: ${slug}`, jsonErr);
        console.log('Raw response:', text.substring(0, 500));
        throw new Error(`Invalid JSON response for ${slug}`);
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

      {/* Homepage collections */}
      <HomepageCollection {...featuredDeals} />
      <HomepageCollection {...popularDevices} />
      <HomepageCollection {...recommended} />
      <HomepageCollection {...popularElectronics} />
      <HomepageCollection {...latestAppliances} />
      <FeaturedBlogs />
      <AboutWorkit />

    </div>
  );
}
