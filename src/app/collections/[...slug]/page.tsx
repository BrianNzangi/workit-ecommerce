import CollectionClient from '@/components/collections/CollectionClient'
import { Product } from '@/types/product'
import { Category, Brand } from '@/types/collection'

interface Props {
  params: Promise<{ slug: string[] }>
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
