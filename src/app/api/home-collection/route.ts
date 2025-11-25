// src/app/api/home-collection/route.ts
import { NextResponse } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import { gql } from '@apollo/client';
import { Product, HomepageCollection } from '@/types/product';

// GraphQL query to fetch a collection with its products
const GET_COLLECTION_WITH_PRODUCTS = gql`
  query GetCollectionWithProducts($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      productVariants(options: { take: 20 }) {
        items {
          id
          name
          sku
          price
          priceWithTax
          currencyCode
          product {
            id
            name
            slug
            description
            featuredAsset {
              id
              preview
              source
            }
          }
        }
      }
    }
  }
`;

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

async function fetchCollectionFromVendure(slug: string): Promise<HomepageCollection> {
  try {
    const { data } = await vendureClient.query({
      query: GET_COLLECTION_WITH_PRODUCTS,
      variables: { slug },
      fetchPolicy: 'network-only', // Always fetch fresh data
    }) as { data: any };

    if (!data.collection) {
      console.warn(`Collection ${slug} not found in Vendure`);
      return {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug,
        products: [],
      };
    }

    const collection = data.collection;

    // Transform Vendure product variants to our Product type
    const products: Product[] = collection.productVariants.items.map((variant: any) => ({
      id: parseInt(variant.product.id),
      name: variant.product.name,
      slug: variant.product.slug,
      type: 'simple',
      link: `/product/${variant.product.slug}`,
      price: (variant.priceWithTax / 100).toString(), // Convert from cents
      regular_price: (variant.price / 100).toString(),
      image: variant.product.featuredAsset?.preview || '',
      images: variant.product.featuredAsset ? [{ src: variant.product.featuredAsset.preview }] : [],
      stock_status: 'instock',
      on_sale: variant.priceWithTax < variant.price,
      variants: [{ id: variant.id }], // Store variant ID for cart
    }));

    return {
      title: collection.name,
      slug: collection.slug,
      products,
    };
  } catch (error) {
    console.error(`Error fetching collection ${slug} from Vendure:`, error);
    return {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug,
      products: [],
    };
  }
}

export async function GET(req: Request) {
  const now = Date.now();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Check if cache is expired
  const isCacheExpired = now - cacheTimestamp >= CACHE_TTL;

  try {
    if (slug) {
      // Single collection fetch
      // Only use cached version if cache is still valid
      if (!isCacheExpired && cachedCollections[slug]) {
        return NextResponse.json(cachedCollections[slug]);
      }

      // Fetch fresh data from Vendure
      const collection = await fetchCollectionFromVendure(slug);
      cachedCollections[slug] = collection;
      cacheTimestamp = now;

      return NextResponse.json(collection);
    }

    // Fetch all homepage collections
    if (isCacheExpired || Object.keys(cachedCollections).length === 0) {
      // Clear cache and refetch all
      cachedCollections = {};

      // Fetch all collections in parallel
      const collectionPromises = COLLECTION_SLUGS.map(s => fetchCollectionFromVendure(s));
      const collections = await Promise.all(collectionPromises);

      collections.forEach((collection, index) => {
        cachedCollections[COLLECTION_SLUGS[index]] = collection;
      });

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
