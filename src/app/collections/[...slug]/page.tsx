import type { Metadata } from 'next';
import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/collection'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lastSlug = resolvedParams.slug.at(-1) || '';

  // Fetch categories to get actual category data
  let categories: Category[] = [];
  try {
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'force-cache'
    });

    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }
  } catch (error) {
    console.error('Failed to fetch categories for metadata:', error);
  }

  // Flatten categories to search nested ones
  const flattenCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...(c.children ? flattenCategories(c.children) : [])]);

  const category = flattenCategories(categories).find((c) => c.slug === lastSlug);

  if (category) {
    // Generate SEO based on actual category data
    const categoryName = category.name;
    const title = `${categoryName} - Workit`;

    // Use category description if available, otherwise generate a generic one
    const description = category.description
      ? category.description.replace(/<[^>]*>/g, '').trim() // Strip HTML tags
      : `Find the best ${categoryName.toLowerCase()} at Workit. Browse our collection of ${categoryName.toLowerCase()} with fast delivery and great prices.`;

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

  // Default metadata for categories not found
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

  // Fetch all categories using API route
  let categories: Category[] = []
  try {
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'force-cache'
    })
    
    if (categoriesRes.ok) {
      categories = await categoriesRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }

  // Flatten categories to search nested ones
  const flattenCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...(c.children ? flattenCategories(c.children) : [])])

  const lastSlug = resolvedParams.slug.at(-1) || ''
  const category = flattenCategories(categories).find((c) => c.slug === lastSlug) || null

  // Fetch products for this category using API route
  let products: Product[] = []
  if (category) {
    try {
      const productsRes = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000'}/api/products?category=${category.id}&per_page=20`,
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
        category={category || undefined}
        categories={categories}
        products={products}
        brands={brands}
      />
    </div>
  )
}
