import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductPage from '@/components/product/ProductPage';
import ProductRecommendationsLoading from '@/components/product/ProductRecommendationsLoading';
import ProductRecommendationsServer from '@/components/product/ProductRecommendationsServer';
import { Category } from '@/types/collection';
import type { Product } from '@/types/product';
import { SITE_CONFIG } from '@/lib/meta';
import { recordSsrRenderTime } from '@/lib/metrics';
import { proxyFetch } from '@/lib/proxy-utils';
import { getImageUrl } from '@/lib/image-utils';
import { normalizeProduct, normalizeProducts } from '@/lib/product-normalization';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

const flattenCategories = (cats: any[]): any[] => {
  const flattened: any[] = [];
  cats.forEach((cat) => {
    flattened.push(cat);
    if (cat.children && cat.children.length > 0) {
      flattened.push(...flattenCategories(cat.children));
    }
  });
  return flattened;
};

const buildChain = (cat: any, all: any[]): any[] => {
  const chain = [];
  let current = cat;
  while (current) {
    chain.unshift(current);
    const parentId = current.parentId || current.parent;
    if (!parentId || String(parentId) === "0" || parentId === 0) break;
    current = all.find((c) => String(c.id) === String(parentId));
  }
  return chain;
};

const findL1Category = (productCategories: any[], all: any[]): any | null => {
  if (!productCategories || productCategories.length === 0 || !all || all.length === 0) {
    return null;
  }

  const firstCat =
    all.find((c) => String(c.id) === String(productCategories[0].id)) ||
    productCategories[0];
  const chain = buildChain(firstCat, all);
  return chain.length > 0 ? chain[0] : null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await proxyFetch(`/store/products/${slug}`, {
      cache: 'force-cache',
      next: { revalidate },
      useRequestContext: false,
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
  const startedAt = Date.now();
  const { slug } = await params;

  try {
    const [productResponse, categoriesRes] = await Promise.all([
      proxyFetch(`/store/products/${slug}`, {
        cache: 'force-cache',
        next: { revalidate },
        useRequestContext: false,
      }),
      proxyFetch(`/store/collections?includeChildren=true&take=1000`, {
        cache: 'force-cache',
        next: { revalidate },
        useRequestContext: false,
      }),
    ]);

    if (!productResponse.ok) {
      console.error(`[ProductDetailPage] Backend error ${productResponse.status} for slug: ${slug}`);
      recordSsrRenderTime('/deal-details/[slug]', Date.now() - startedAt);
      return (
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary-900 text-white px-6 py-2 rounded-md hover:bg-[#e04500] transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    const productObj = await productResponse.json();

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

    const product: Product = normalizeProduct({
      ...productObj,
      shortDescription: productObj.shortDescription || productObj.description?.substring(0, 160),
      featuredImage: mainImage,
      images: mappedImages,
      variants: productObj.variants?.length ? productObj.variants : [fallbackVariant],
      collections: productObj.collections?.map((c: any) => c.collection) || [],
      inStock: (productObj.stockOnHand ?? 0) > 0,
    });

    let allCategories: Category[] = [];
    if (categoriesRes.ok) {
      const data = await categoriesRes.json();
      allCategories = Array.isArray(data) ? data : (data.collections || []);
    } else {
      console.error('Error fetching categories:', categoriesRes.status);
    }

    const flattenedCategories = flattenCategories(allCategories);
    const l1Category = findL1Category(product.categories || [], flattenedCategories);
    const categorySlugs = [
      ...(l1Category?.slug ? [String(l1Category.slug)] : []),
      ...(product.categories || []).map((category) => String(category.slug)),
    ].filter((value, index, array) => array.indexOf(value) === index);

    recordSsrRenderTime('/deal-details/[slug]', Date.now() - startedAt);
    return (
      <div className="min-h-screen">
        <ProductPage
          product={product}
          allCategories={allCategories}
        />
        <Suspense fallback={<ProductRecommendationsLoading />}>
          <ProductRecommendationsServer
            productId={product.id}
            categorySlugs={categorySlugs}
            revalidateSeconds={revalidate}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    recordSsrRenderTime('/deal-details/[slug]', Date.now() - startedAt);
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error loading product</h1>
          <p className="text-gray-600 mb-4">
            Something went wrong while loading this product. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-900 text-white px-6 py-2 rounded-md hover:bg-[#e04500] transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
}
