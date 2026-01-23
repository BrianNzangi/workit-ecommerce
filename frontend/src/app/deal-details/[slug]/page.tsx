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
    const product: Product = data.product;

    if (!product) {
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

    // Fetch categories (optional)
    let allCategories: Category[] = [];
    try {
      const categoriesRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/collections?includeChildren=true`,
        { cache: 'no-store' }
      );
      if (categoriesRes.ok) {
        allCategories = await categoriesRes.json();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

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
