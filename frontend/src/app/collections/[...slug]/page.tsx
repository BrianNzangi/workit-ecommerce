import type { Metadata } from 'next';
import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Collection, Brand } from '@/types/collection'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lastSlug = resolvedParams.slug.at(-1) || '';

  // Fetch collections to get actual collection data
  let collections: Collection[] = [];
  try {
    const collectionsRes = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/collections?includeChildren=true`, {
      cache: 'force-cache'
    });

    if (collectionsRes.ok) {
      collections = await collectionsRes.json();
    }
  } catch (error) {
    console.error('Failed to fetch collections for metadata:', error);
  }

  // Flatten collections to search nested ones
  const flattenCollections = (colls: Collection[]): Collection[] =>
    colls.flatMap((c) => [c, ...(c.children ? flattenCollections(c.children) : [])]);

  const collection = flattenCollections(collections).find((c) => c.slug === lastSlug);

  if (collection) {
    // Generate SEO based on actual collection data
    const collectionName = collection.name;
    const title = `${collectionName} - Workit`;

    // Use collection description if available, otherwise generate a generic one
    const description = collection.description
      ? collection.description.replace(/<[^>]*>/g, '').trim() // Strip HTML tags
      : `Find the best ${collectionName.toLowerCase()} at Workit. Browse our collection of ${collectionName.toLowerCase()} with fast delivery and great prices.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.workit.co.ke/collections/${lastSlug}`,
        siteName: "Workit",
        type: "website",
        images: [
          {
            url: "/workit-logo.png",
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

  // Default metadata for collections not found
  return {
    title: "Electronics Collection - Workit",
    description: "Browse our electronics collection at Workit. Find the best deals on phones, laptops, TVs, and accessories.",
    robots: "noindex, nofollow",
  };
}

export default async function CollectionPage({ params }: Props) {
  // Await the params before using them
  const resolvedParams = await params
  const fullSlug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug.join('/') : ''

  // Fetch all collections using API route - MUST include children
  let collections: Collection[] = []
  try {
    const collectionsRes = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/collections?includeChildren=true`, {
      cache: 'force-cache'
    })

    if (collectionsRes.ok) {
      collections = await collectionsRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }

  // Flatten collections to search nested ones - improved logic
  const flattenCollections = (colls: Collection[]): Collection[] => {
    const result: Collection[] = [];
    for (const c of colls) {
      result.push(c);
      if (c.children && c.children.length > 0) {
        result.push(...flattenCollections(c.children));
      }
    }
    return result;
  };

  const lastSlug = resolvedParams.slug.at(-1) || '';
  const allCollections = flattenCollections(collections);

  console.log('🔍 Looking for collection with slug:', lastSlug);
  console.log('📦 Total collections (including nested):', allCollections.length);
  console.log('📋 All collection slugs:', allCollections.map(c => c.slug));

  const collection = allCollections.find((c) => c.slug === lastSlug) || null;

  console.log('✅ Found collection:', collection ? collection.name : 'NOT FOUND');

  // Fetch products for this collection using API route
  let products: Product[] = []
  if (collection) {
    try {
      const productsRes = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/products?slug=${collection.slug}&per_page=20`,
        { cache: 'force-cache' }
      )

      if (productsRes.ok) {
        const data = await productsRes.json()
        products = data.products || []
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  // For now, we'll use empty brands array since there's no brands API route
  const brands: Brand[] = []

  return (
    <div className="bg-[#F8F9FC] min-h-screen">
      <CollectionClient
        fullSlug={fullSlug}
        category={collection || undefined}
        categories={collections}
        products={products}
        brands={brands}
      />
    </div>
  )
}
