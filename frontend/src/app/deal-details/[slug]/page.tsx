import ProductPage from '@/components/product/ProductPage';
import { Category } from '@/types/collection';
import type { Product } from '@/types/product';
import { getProductImageUrl } from '@/lib/image-utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    // Fetch the specific product by slug from our API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${slug}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return (
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/"
              className="inline-block bg-primary-900 text-white px-6 py-2 rounded-md hover:bg-[#e04500] transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    const data = await response.json();
    const productData = data.product;

    if (!productData) {
      return (
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/"
              className="inline-block bg-primary-900 text-white px-6 py-2 rounded-md hover:bg-[#e04500] transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    // Transform the backend product data to match the Product type
    const product: Product = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      link: `/deal-details/${productData.slug}`,
      description: productData.description,
      short_description: productData.short_description,
      price: productData.price,
      regular_price: productData.regular_price,
      stock_status: productData.stock_status,
      type: productData.variants?.length > 0 ? 'variable' : 'simple',
      images: productData.images || [],
      image: productData.image,
      variations: productData.variants?.map((variant: any) => ({
        id: variant.id,
        price: String(variant.price || productData.price),
        regular_price: variant.regular_price ? String(variant.regular_price) : undefined,
        sale_price: variant.sale_price ? String(variant.sale_price) : undefined,
        stock_status: variant.stockQuantity > 0 ? 'instock' : 'outofstock',
        image: variant.image ? {
          src: variant.image.url,
        } : undefined,
        attributes: variant.options?.map((opt: any) => ({
          id: opt.id || 0,
          name: opt.name,
          option: opt.value,
        })) || [],
      })) || [],
      variants: productData.variants || [],
      categories: productData.categories?.map((col: any) => ({
        id: parseInt(col.id) || 0,
        name: col.name,
        slug: col.slug,
      })) || [],
      brand: productData.brand,
      condition: productData.condition,
      shippingMethod: productData.shippingMethod,
    };

    // Fetch categories (optional)
    const allCategories: Category[] = [];

    return (
      <div className="min-h-screen">
        <ProductPage
          product={product}
          allCategories={allCategories}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error loading product</h1>
          <p className="text-gray-600 mb-4">
            Something went wrong while loading this product. Please try again later.
          </p>
          <a
            href="/"
            className="inline-block bg-primary-900 text-white px-6 py-2 rounded-md hover:bg-[#e04500] transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
}
