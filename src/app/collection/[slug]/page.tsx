import woo from '@/lib/woocommerce'
import ProductPage from '@/components/product/ProductPage'
import { Category } from '@/types/collection'
import type { Product } from '@/types/product'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Product({ params }: Props) {
  const { slug } = await params

  // 🔹 Fetch product by slug
  const res = await woo
    .get('products', { params: { slug, per_page: 1 } })
    .catch(() => ({ data: [] }))

  const product = res.data?.[0]
  if (!product) {
    return <div className="p-10">Product not found</div>
  }

  // 🔹 Fetch variations (important for variable products)
  let variations: any[] = []
  if (product.type === 'variable') {
    const variationsRes = await woo
      .get(`products/${product.id}/variations`, { params: { per_page: 100 } })
      .catch(() => ({ data: [] }))
    variations = variationsRes.data || []
  }

  // 🔹 Map WooCommerce response into your Product type
  const mappedProduct: Product = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type, // "simple" | "variable"
    link: product.permalink || '#',
    brand: product.brands?.[0]?.name || null,
    price: product.price?.toString() || '0',
    regular_price:
      product.regular_price?.toString() || product.price?.toString() || '0',
    short_description: product.short_description,
    description: product.description,
    images: product.images?.map((img: any) => ({ src: img.src })) || [],
    categories: product.categories,
    // 🔹 Proper variations mapping
    variations: variations.map((v) => ({
      id: v.id,
      price: v.price?.toString() || '0',
      regular_price: v.regular_price?.toString() || v.price?.toString() || '0',
      sale_price: v.sale_price?.toString() || null,
      stock_status: v.stock_status || 'instock',
      attributes: v.attributes?.map((a: any) => ({
        id: a.id,
        name: a.name,
        option: a.option,
      })),
    })),
  }

  // 🔹 Fetch categories for breadcrumbs
  const categoriesRes = await woo
    .get('products/categories', { params: { per_page: 100 } })
    .catch(() => ({ data: [] }))
  const allCategories: Category[] = categoriesRes.data || []

  return (
    <div className="min-h-screen">
      <ProductPage
        product={mappedProduct}
        allCategories={allCategories}
      />
    </div>
  )
}
