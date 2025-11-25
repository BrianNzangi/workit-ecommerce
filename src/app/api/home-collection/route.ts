// src/app/api/home-collection/route.ts
import { NextResponse } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import { gql } from '@apollo/client';
import { Product, HomepageCollection } from '@/types/product';

// GraphQL query to get homepage collections facet and its values
const GET_HOMEPAGE_COLLECTIONS_FACET = gql`
  query GetHomepageCollectionsFacet {
    facets(options: { filter: { code: { eq: "homepage-collections" } } }) {
      items {
        id
        code
        name
        values {
          id
          code
          name
        }
      }
    }
  }
`;

// GraphQL query to fetch products by facet value
const GET_PRODUCTS_BY_FACET = gql`
  query GetProductsByFacet($facetValueId: [String!]) {
    search(input: { facetValueIds: $facetValueId, take: 20, groupByProduct: true }) {
      items {
        productId
        productName
        slug
        description
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        price {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        productAsset {
          id
          preview
        }
        productVariantId
      }
    }
  }
`;

// Simple in-memory cache
let cachedCollections: HomepageCollection[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchHomepageCollections(): Promise<HomepageCollection[]> {
  try {
    // First, get the homepage-collections facet and its values
    const { data: facetData } = await vendureClient.query({
      query: GET_HOMEPAGE_COLLECTIONS_FACET,
      fetchPolicy: 'network-only',
    }) as { data: any };

    const homepageFacet = facetData.facets.items[0];

    if (!homepageFacet || !homepageFacet.values.length) {
      console.warn('No homepage collections facet found or no values');
      return [];
    }

    // Fetch products for each facet value in parallel
    const collectionPromises = homepageFacet.values.map(async (facetValue: any) => {
      try {
        const { data: productsData } = await vendureClient.query({
          query: GET_PRODUCTS_BY_FACET,
          variables: { facetValueId: [facetValue.id] },
          fetchPolicy: 'network-only',
        }) as { data: any };

        // Transform search results to Product type
        const products: Product[] = productsData.search.items.map((item: any) => {
          const price = item.priceWithTax.value || item.priceWithTax.min || 0;
          const regularPrice = item.price.value || item.price.min || 0;

          return {
            id: parseInt(item.productId),
            name: item.productName,
            slug: item.slug,
            type: 'simple',
            link: `/product/${item.slug}`,
            price: (price / 100).toString(), // Convert from cents
            regular_price: (regularPrice / 100).toString(),
            image: item.productAsset?.preview || '',
            images: item.productAsset ? [{ src: item.productAsset.preview }] : [],
            stock_status: 'instock',
            on_sale: price < regularPrice,
            variants: [{ id: item.productVariantId }],
          };
        });

        return {
          title: facetValue.name,
          slug: facetValue.code,
          products,
        };
      } catch (error) {
        console.error(`Error fetching products for facet ${facetValue.code}:`, error);
        return {
          title: facetValue.name,
          slug: facetValue.code,
          products: [],
        };
      }
    });

    const collections = await Promise.all(collectionPromises);
    return collections;
  } catch (error) {
    console.error('Error fetching homepage collections from facets:', error);
    return [];
  }
}

export async function GET(req: Request) {
  const now = Date.now();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Check if cache is expired
  const isCacheExpired = now - cacheTimestamp >= CACHE_TTL;

  try {
    // Fetch collections if cache is expired or empty
    if (isCacheExpired || cachedCollections.length === 0) {
      cachedCollections = await fetchHomepageCollections();
      cacheTimestamp = now;
    }

    if (slug) {
      // Single collection fetch by slug
      const collection = cachedCollections.find(c => c.slug === slug);

      if (!collection) {
        return NextResponse.json({
          title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug,
          products: [],
        });
      }

      return NextResponse.json(collection);
    }

    // Return all homepage collections
    return NextResponse.json(cachedCollections);
  } catch (err) {
    console.error('Error fetching homepage collections:', err);
    return NextResponse.json({ error: 'Failed to fetch homepage collections' }, { status: 500 });
  }
}
