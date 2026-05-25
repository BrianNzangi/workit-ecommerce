import type { Metadata } from 'next';
import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/collection'
import type { Collection as ApiCollection } from '@/types/collections';
import { SITE_CONFIG } from '@/lib/meta/meta';
import { fetchCollectionBySlug, fetchNavigationCollections } from '@/lib/collections/collections-server';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { recordSsrRenderTime } from '@/lib/utils/metrics';
import { normalizeProducts } from '@/lib/product/product-normalization';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lastSlug = resolvedParams.slug.at(-1) || '';

  try {
    const collection = await fetchCollectionBySlug(lastSlug).catch(() => null);

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
      cache: 'force-cache',
      next: { revalidate },
      useRequestContext: false,
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
    collections = await fetchNavigationCollections();
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }

  let collection: ApiCollection | null = null;
  try {
    collection = await fetchCollectionBySlug(lastSlug);
  } catch (error) {
    collection = null;
  }
  let campaign: PublicCampaign | null = null;
  const legacyCollections = collections as unknown as Category[];
  let legacyCollection = collection as unknown as Category | null;

  if (!collection) {
    try {
      const campaignResponse = await proxyFetch(`/marketing/campaigns/${lastSlug}`, {
        cache: 'force-cache',
        next: { revalidate },
        useRequestContext: false,
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
        campaignSlug={campaign?.slug}
      />
    </div>
  )
}

