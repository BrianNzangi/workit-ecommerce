// src/app/api/home-collection/route.ts
import { NextResponse } from 'next/server';
import woo from '@/lib/woocommerce';
import { Product, HomepageCollection } from '@/types/product';

// Simple in-memory cache
let cachedCollections: Record<string, HomepageCollection> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Homepage collection slugs
const COLLECTION_SLUGS = [
  'featured-deals',
  'popular-devices',
  'recommended-for-you',
  'popular-electronics',
  'latest-appliances',
];

// Map slug -> category ID
const categoryMap: Record<string, number> = {};

async function fetchCategoryMap() {
  if (Object.keys(categoryMap).length) return categoryMap;
  
  const res = await woo.get('products/categories', { params: { per_page: 100 } });
  res.data.forEach((cat: any) => {
    // Only parent categories that match COLLECTION_SLUGS
    if (cat.parent === 0 && COLLECTION_SLUGS.includes(cat.slug)) {
      categoryMap[cat.slug] = cat.id;
    }
  });
  
  return categoryMap;
}

async function fetchProductsByCategoryId(categoryId: number): Promise<Product[]> {
  const res = await woo.get('products', { params: { category: categoryId, per_page: 20 } });
  return res.data.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    link: p.permalink,
    price: p.price,
    regular_price: p.regular_price,
    image: p.images?.[0]?.src || '',
    attributes: p.attributes?.map((a: any) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      options: a.options || [],
    })),
    tags: p.tags?.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
    stock_status: p.stock_status,
    on_sale: p.on_sale,
  }));
}

export async function GET(req: Request) {
  const now = Date.now();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  
  // Check if cache is expired
  const isCacheExpired = now - cacheTimestamp >= CACHE_TTL;
  
  try {
    const map = await fetchCategoryMap();
    
    if (slug) {
      // Single collection fetch
      if (!map[slug]) {
        return NextResponse.json({ title: slug, slug, products: [] });
      }
      
      // Only use cached version if cache is still valid
      if (!isCacheExpired && cachedCollections[slug]) {
        return NextResponse.json(cachedCollections[slug]);
      }
      
      // Fetch fresh data
      const products = await fetchProductsByCategoryId(map[slug]);
      cachedCollections[slug] = { title: slug.replace(/-/g, ' '), slug, products };
      cacheTimestamp = now; // Update timestamp for single collection too
      
      return NextResponse.json(cachedCollections[slug]);
    }
    
    // Fetch all homepage collections
    if (isCacheExpired || Object.keys(cachedCollections).length === 0) {
      // Clear cache and refetch all
      cachedCollections = {};
      
      for (const s of COLLECTION_SLUGS) {
        if (!map[s]) continue; // skip if category not found in WP
        const products = await fetchProductsByCategoryId(map[s]);
        cachedCollections[s] = { title: s.replace(/-/g, ' '), slug: s, products };
      }
      
      cacheTimestamp = now;
    }
    
    const collections: HomepageCollection[] = COLLECTION_SLUGS
      .filter(s => cachedCollections[s])
      .map(s => cachedCollections[s]);
    
    return NextResponse.json(collections);
  } catch (err) {
    console.error('Error fetching homepage collections:', err);
    return NextResponse.json({ error: 'Failed to fetch homepage collections' }, { status: 500 });
  }
}
