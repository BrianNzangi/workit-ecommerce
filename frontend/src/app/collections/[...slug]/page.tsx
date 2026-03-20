import type { Metadata } from 'next';
import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/collection'
import type { Collection as ApiCollection } from '@/types/collections';
import { SITE_CONFIG } from '@/lib/meta';
import { fetchCollections } from '@/lib/collections-server';
import { proxyFetch } from '@/lib/proxy-utils';
import { getFirstBanner } from '@/lib/homepage-data';
import { recordSsrRenderTime } from '@/lib/metrics';
import { normalizeProducts } from '@/lib/product-normalization';

interface Props {
  params: Promise<{ slug: string[] }>
}

interface CollectionPagination {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface PublicCampaign {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: string;
  featuredProducts?: any[];
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

    const campaignResponse = await proxyFetch(`/marketing/campaigns/${lastSlug}`, {
      next: { revalidate },
    });

    if (campaignResponse.ok) {
      const campaign = (await campaignResponse.json()) as PublicCampaign;
      const title = `${campaign.name} | ${SITE_CONFIG.name}`;
      const description = campaign.description
        ? campaign.description.replace(/<[^>]*>/g, '').trim()
        : `Explore products in the ${campaign.name} campaign at Workit.`;

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
  const startedAt = Date.now();
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
  let campaign: PublicCampaign | null = null;
  const legacyCollections = collections as unknown as Category[];
  let legacyCollection = collection as unknown as Category | null;
  let collectionBanner = null;

  if (!collection) {
    try {
      const campaignResponse = await proxyFetch(`/marketing/campaigns/${lastSlug}`, {
        next: { revalidate },
      });

      if (campaignResponse.ok) {
        const resolvedCampaign = await campaignResponse.json() as PublicCampaign;
        campaign = resolvedCampaign;
        legacyCollection = {
          id: resolvedCampaign.id as any,
          name: resolvedCampaign.name,
          slug: resolvedCampaign.slug,
          parent: 0,
          count: 0,
          description: resolvedCampaign.description || undefined,
          children: [],
        };
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
    }
  }

  let products: Product[] = []
  let initialPagination: CollectionPagination = {
    total: 0,
    limit: 20,
    offset: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  }
  if (collection || campaign) {
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: '0',
      });
      if (collection) {
        params.set('collection', collection.slug);
      }
      if (campaign) {
        params.set('campaign', campaign.slug);
      }
      const [productsRes, banner] = await Promise.all([
        proxyFetch(`/store/products?${params.toString()}`, {
          next: { revalidate },
        }),
        getFirstBanner('COLLECTION_TOP', collection
          ? { collectionSlug: collection.slug }
          : { campaignSlug: campaign?.slug }),
      ]);
      collectionBanner = banner;

      if (productsRes.ok) {
        const data = await productsRes.json()
        products = normalizeProducts(data.products || [])
        initialPagination = data.pagination || initialPagination
      } else {
        console.error('Failed to fetch products, status:', productsRes.status);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  // For now, we'll use empty brands array since there's no brands API route
  const brands: Brand[] = []
  recordSsrRenderTime('/collections/[...slug]', Date.now() - startedAt);

  return (
    <div className="bg-white min-h-screen">
      <CollectionClient
        fullSlug={fullSlug}
        category={legacyCollection}
        categories={legacyCollections}
        products={products}
        initialPagination={initialPagination}
        brands={brands}
      collectionBanner={collectionBanner}
      campaignSlug={campaign?.slug}
      />
    </div>
  )
}

