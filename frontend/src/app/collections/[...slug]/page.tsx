import type { Metadata } from 'next';
import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/collection'
import type { Collection as ApiCollection } from '@/types/collections';
import { SITE_CONFIG } from '@/lib/meta';
import { fetchCollections } from '@/lib/collections-server';
import { proxyFetch } from '@/lib/proxy-utils';
import { getFirstBanner } from '@/lib/homepage-data';

interface Props {
  params: Promise<{ slug: string[] }>
}

export const revalidate = 300;

const flattenCollections = (colls: ApiCollection[]): ApiCollection[] => {
  const result: ApiCollection[] = [];
  for (const c of colls) {
    result.push(c);
    if (c.children && c.children.length > 0) {
      result.push(...flattenCollections(c.children));
    }
  }
  return result;
};

const normalizeProducts = (data: any) =>
  (data.products || []).map((product: any) => {
    const featuredProductAsset = product.assets?.find((a: any) => a.featured) || product.assets?.[0];
    const mainImage = featuredProductAsset?.asset?.source || featuredProductAsset?.asset?.preview || '';

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.assets?.map((a: any) => ({
        id: a.asset.id,
        url: a.asset.source || a.asset.preview || '',
        source: a.asset.source,
        preview: a.asset.preview,
        featured: a.featured,
        altText: a.asset.name || product.name,
      })) || [],
      image: mainImage,
      price: Number(product.salePrice ?? 0),
      compareAtPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      variantId: product.id,
      stockOnHand: product.stockOnHand ?? 0,
      canBuy: (product.stockOnHand ?? 0) > 0,
      categories: product.collections?.map((c: any) => c.collection) || [],
      brand: product.brand,
      condition: product.condition,
    } as Product;
  });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lastSlug = resolvedParams.slug.at(-1) || '';

  try {
    const collections = await fetchCollections({
      includeChildren: true,
      includeAssets: true,
      take: 1000,
    });
    const collection = flattenCollections(collections).find((c) => c.slug === lastSlug);

    if (collection) {
      const collectionName = collection.name;
      const title = `${collectionName} | ${SITE_CONFIG.name}`;

      const description = collection.description
        ? collection.description.replace(/<[^>]*>/g, '').trim()
        : `Find the best ${collectionName.toLowerCase()} at Workit. Browse our collection of ${collectionName.toLowerCase()} with fast delivery and great prices.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${SITE_CONFIG.url}/collections/${lastSlug}`,
          siteName: SITE_CONFIG.name,
          type: "website",
          images: [
            {
              url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch collections for metadata:', error);
  }

  return {
    title: "Electronics Collection - Workit",
    description: "Browse our electronics collection at Workit. Find the best deals on phones, laptops, TVs, and accessories.",
    robots: "noindex, nofollow",
  };
}

export default async function CollectionPage({ params }: Props) {
  const resolvedParams = await params
  const fullSlug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug.join('/') : ''
  const lastSlug = resolvedParams.slug.at(-1) || '';

  let collections: ApiCollection[] = []
  try {
    collections = await fetchCollections({
      includeChildren: true,
      includeAssets: true,
      take: 1000,
    });
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }

  const allCollections = flattenCollections(collections);
  const collection = allCollections.find((c) => c.slug === lastSlug) || null;
  const legacyCollections = collections as unknown as Category[];
  const legacyCollection = collection as unknown as Category | null;
  let collectionBanner = null;

  let products: Product[] = []
  if (collection) {
    try {
      const params = new URLSearchParams({
        collection: collection.slug,
        limit: '20',
        offset: '0',
      });
      const [productsRes, banner] = await Promise.all([
        proxyFetch(`/store/products?${params.toString()}`, {
          next: { revalidate },
        }),
        getFirstBanner('COLLECTION_TOP', { collectionSlug: collection.slug }),
      ]);
      collectionBanner = banner;

      if (productsRes.ok) {
        const data = await productsRes.json()
        products = normalizeProducts(data)
      } else {
        console.error('Failed to fetch products, status:', productsRes.status);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  // For now, we'll use empty brands array since there's no brands API route
  const brands: Brand[] = []

  return (
    <div className="bg-white min-h-screen">
      <CollectionClient
        fullSlug={fullSlug}
        category={legacyCollection}
        categories={legacyCollections}
        products={products}
        brands={brands}
        collectionBanner={collectionBanner}
      />
    </div>
  )
}

