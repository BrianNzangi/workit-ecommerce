import type { Metadata } from 'next';
import ProductPage from '@/components/product/ProductPage';
import { Category } from '@/types/collection';
import type { Product } from '@/types/product';
import { SITE_CONFIG } from '@/lib/meta';
import { proxyFetch } from '@/lib/proxy-utils';
import { getImageUrl } from '@/lib/image-utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await proxyFetch(`/store/products/${slug}`, {
      cache: 'force-cache',
    });

    if (!response.ok) return { title: 'Product Not Found' };

    const product = await response.json();
    const title = `${product.name} | ${SITE_CONFIG.name}`;
    const description = product.shortDescription || product.description?.substring(0, 160);
    const imageUrl = product.assets?.[0]?.asset?.source || product.featuredImage || SITE_CONFIG.logo;
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.url}${getImageUrl(imageUrl)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_CONFIG.url}/deal-details/${slug}`,
        type: 'website',
        images: [
          {
            url: absoluteImageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteImageUrl],
      },
    };
  } catch (error) {
    return { title: SITE_CONFIG.name };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  try {
    // 1. Fetch from backend via direct proxyFetch (Bypasses loopback networking issues)
    const response = await proxyFetch(`/store/products/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[ProductDetailPage] Backend error ${response.status} for slug: ${slug}`);
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

    const productObj = await response.json();

    // 2. Map backend data to frontend Product interface (Logic mirrored from API route)
    const mappedImages = productObj.assets?.map((a: any) => ({
      id: a.asset.id,
      src: a.asset.source || a.asset.preview || '',
      url: a.asset.source || a.asset.preview || '',
      altText: a.asset.name || productObj.name,
      position: a.sortOrder ?? 0,
      featured: a.featured,
    })) || [];

    const featuredAsset = mappedImages.find((img: any) => img.featured) || mappedImages[0];
    const mainImage = featuredAsset?.url || productObj.featuredImage || '';

    const fallbackVariant = {
      id: productObj.id,
      name: productObj.name,
      sku: productObj.sku || '',
      price: Number(productObj.salePrice ?? 0),
      compareAtPrice: productObj.originalPrice ? Number(productObj.originalPrice) : undefined,
      status: 'active' as const,
      inventory: {
        track: true,
        stockOnHand: productObj.stockOnHand ?? 0,
      }
    };

    const product: Product = {
      id: productObj.id,
      name: productObj.name,
      slug: productObj.slug,
      description: productObj.description,
      short_description: productObj.shortDescription || productObj.description?.substring(0, 160),
      images: mappedImages,
      image: mainImage,
      price: Number(productObj.salePrice ?? 0),
      compareAtPrice: productObj.originalPrice ? Number(productObj.originalPrice) : undefined,
      variantId: productObj.id,
      stockOnHand: productObj.stockOnHand ?? 0,
      canBuy: (productObj.stockOnHand ?? 0) > 0,
      variants: [fallbackVariant],
      categories: productObj.collections?.map((c: any) => ({
        id: c.collection.id,
        name: c.collection.name,
        slug: c.collection.slug,
      })) || [],
      brand: productObj.brand,
      inStock: (productObj.stockOnHand ?? 0) > 0,
      condition: productObj.condition,
      shippingMethod: productObj.shippingMethod ? {
        id: productObj.shippingMethod.id,
        code: productObj.shippingMethod.code,
        name: productObj.shippingMethod.name,
        description: productObj.shippingMethod.description,
        isExpress: productObj.shippingMethod.isExpress || false,
      } : undefined,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt,
    };

    // 3. Fetch categories (optional) via internal collections API
    // Note: This could also be direct, but keeping it simple for now
    let allCategories: Category[] = [];
    try {
      const categoriesRes = await proxyFetch(`/store/collections?includeChildren=true&take=1000`, {
        cache: 'no-store'
      });
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        allCategories = Array.isArray(data) ? data : (data.collections || []);
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
