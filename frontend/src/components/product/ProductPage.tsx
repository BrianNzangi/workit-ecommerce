"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { buildBreadcrumbs, findL2Category, Breadcrumb, Category } from "@/utils/breadcrumbs"
import he from "he"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ProductInfo from "@/components/product/ProductInfo"
import ColProductCard from "@/components/product/ColProductCard"
import { Product } from "@/types/product"
import { getImageUrl } from "@/lib/image-utils"


export default function ProductPage({
  product,
  allCategories,
}: {
  product: Product
  allCategories: Category[]
}) {
  // Helper function to build a chain from category to root
  const buildChain = (cat: any, all: any[]): any[] => {
    const chain = [];
    let current = cat;
    while (current) {
      chain.unshift(current);
      const parentId = current.parentId || current.parent;
      if (!parentId || String(parentId) === "0") break;
      current = all.find(c => c.id === parentId);
    }
    return chain;
  };

  // Build breadcrumbs manually to support UUIDs and parentId
  const breadcrumbs: Breadcrumb[] = [];
  if (product.categories && product.categories.length > 0 && allCategories.length > 0) {
    const primaryCat = allCategories.find(c => String(c.id) === String(product.categories![0].id)) || product.categories[0];
    const chain = buildChain(primaryCat, allCategories);
    chain.forEach(c => {
      breadcrumbs.push({
        name: c.name,
        slug: c.slug,
        id: c.id,
        url: `/category/${c.slug}`
      });
    });
  }
  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ name: 'Home', slug: '', url: '/' });
  } else if (breadcrumbs[0].name !== 'Home') {
    breadcrumbs.unshift({ name: 'Home', slug: '', url: '/' });
  }

  const [selectedIdx, setSelectedIdx] = useState(0)
  const images = product.images || []

  const [similarItems, setSimilarItems] = useState<Product[]>([])
  const [similarItemsLoading, setSimilarItemsLoading] = useState(true)
  const [similarItemsError, setSimilarItemsError] = useState<string | null>(null)

  const [alsoViewed, setAlsoViewed] = useState<Product[]>([])
  const [alsoViewedLoading, setAlsoViewedLoading] = useState(true)
  const [alsoViewedError, setAlsoViewedError] = useState<string | null>(null)

  // Helper function to check if product belongs to android-smartphones collection
  // Helper function to find the L1 category (root ancestor)
  const findL1Category = (productCategories: any[], all: any[]): any | null => {
    if (!productCategories || productCategories.length === 0 || !all || all.length === 0) return null;

    // Pick the first category of the product
    const firstCat = all.find(c => c.id === productCategories[0].id) || productCategories[0];
    const chain = buildChain(firstCat, all);
    return chain.length > 0 ? chain[0] : null;
  }

  // Variation-aware price (falls back to base price)
  const effectivePrice =
    (product as any).selectedVariationPrice ??
    (typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price)

  const effectiveOriginalPrice =
    (product as any).selectedVariationOriginalPrice ??
    (typeof product.compareAtPrice === "string"
      ? parseFloat(product.compareAtPrice)
      : product.compareAtPrice) ??
    0

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Fetch similar items from all categories the product belongs to
  useEffect(() => {
    const fetchSimilarItems = async () => {
      try {
        setSimilarItemsLoading(true)
        setSimilarItemsError(null)

        const productCategories = product.categories || []
        const allSimilarProducts: Product[] = []
        const seenIds = new Set<string>()

        // Fetch similar items from the L1 category
        const l1Category = findL1Category(product.categories || [], allCategories);

        if (l1Category) {
          console.log('📦 Fetching similar items from L1 category:', l1Category.name, '(Slug:', l1Category.slug, ')');
          try {
            const response = await fetch(`/api/products/similar?collectionSlug=${l1Category.slug}&excludeProductId=${product.id}&limit=10`)
            if (response.ok) {
              const data = await response.json()
              const collectionProducts = data.products || []
              collectionProducts.forEach((prod: Product) => {
                if (!seenIds.has(prod.id)) {
                  seenIds.add(prod.id)
                  allSimilarProducts.push(prod)
                }
              })
            }
          } catch (error) {
            console.error('Error fetching L1 similar items:', error)
          }
        }

        // Fallback: If no L1 items or no L1 found, try direct categories
        if (allSimilarProducts.length < 5) {
          for (const category of product.categories || []) {
            if (l1Category && category.slug === l1Category.slug) continue; // Skip L1 as we already fetched

            try {
              const response = await fetch(`/api/products/similar?collectionSlug=${category.slug}&excludeProductId=${product.id}&limit=5`)
              if (response.ok) {
                const data = await response.json()
                const categoryProducts = data.products || []
                categoryProducts.forEach((prod: Product) => {
                  if (!seenIds.has(prod.id)) {
                    seenIds.add(prod.id)
                    allSimilarProducts.push(prod)
                  }
                })
              }
            } catch (error) {
              console.error(`Error fetching products for category ${category.name}:`, error)
            }
            if (allSimilarProducts.length >= 8) break
          }
        }

        // Limit to 5 products
        setSimilarItems(allSimilarProducts.slice(0, 5))
      } catch (error) {
        console.error('Error fetching similar items:', error)
        setSimilarItemsError('Failed to load similar items')
        setSimilarItems([])
      } finally {
        setSimilarItemsLoading(false)
      }
    }

    fetchSimilarItems()
  }, [product, allCategories])

  // Fetch random "People Also Viewed" items
  useEffect(() => {
    const fetchAlsoViewed = async () => {
      try {
        setAlsoViewedLoading(true)
        setAlsoViewedError(null)

        // Fetch random products from the general products endpoint
        const response = await fetch('/api/products?per_page=20')
        const data = await response.json()
        const allProducts = data.products || []

        // Filter out the current product and shuffle the array
        const filteredProducts = allProducts.filter((prod: Product) => prod.id !== product.id)

        // Shuffle the array to get random products
        const shuffledProducts = filteredProducts.sort(() => 0.5 - Math.random())

        // Take the first 5 random products
        setAlsoViewed(shuffledProducts.slice(0, 5))
      } catch (error) {
        console.error('Error fetching also viewed items:', error)
        setAlsoViewedError('Failed to load also viewed items')
        setAlsoViewed([])
      } finally {
        setAlsoViewedLoading(false)
      }
    }

    fetchAlsoViewed()
  }, [product.id])

  return (
    <main className="font-sans mt-8">
      {/* Product Content Container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4 mb-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          {breadcrumbs.map((crumb, idx) => {
            const crumbName = he.decode(crumb.name)
            return (
              <React.Fragment key={crumb.url}>
                {idx > 0 && <span className="px-1">/</span>}
                {idx < breadcrumbs.length - 1 ? (
                  <a href={crumb.url} className="hover:underline">
                    {crumbName}
                  </a>
                ) : (
                  <span className="text-gray-700 font-medium">{crumbName}</span>
                )}
              </React.Fragment>
            )
          })}
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Column A (Gallery + Description) */}
          <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col gap-4">
            {/* Image gallery */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-sm">
              {/* Thumbnails */}
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[608px]">
                {images.slice(0, 6).map((img, idx) => (
                  <div
                    key={img.id || `${img.url}-${idx}`}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-gray-100 cursor-pointer ${selectedIdx === idx
                      ? "border-2 border-black"
                      : "opacity-80 hover:opacity-100"
                      }`}
                    onClick={() => setSelectedIdx(idx)}
                  >
                    <Image
                      src={getImageUrl(img.url || '')}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 flex items-center bg-gray-100 justify-center relative">
                <button
                  onClick={prevImage}
                  className="absolute left-2 bg-white shadow rounded-full p-2 z-10"
                >
                  <FaChevronLeft />
                </button>
                <Image
                  src={getImageUrl(images[selectedIdx]?.url || '')}
                  alt={product.name}
                  width={800}
                  height={608}
                  className="h-[400px] md:h-[608px] w-auto object-contain"
                  unoptimized
                />
                <button
                  onClick={nextImage}
                  className="absolute right-2 bg-white shadow rounded-full p-2 z-10"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>


            {/* More about this item */}
            {product.description && (
              <section className="mt-2">
                <h2 className="text-xl font-semibold mb-2">
                  More about this item
                </h2>
                <div
                  className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:mb-3 [&>h2]:mb-3 [&>h3]:mb-3 [&>li]:mb-1 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500]"
                  dangerouslySetInnerHTML={{
                    __html: he.decode(product.description.trim()),
                  }}
                />
              </section>
            )}
          </div>

          {/* Column B (Sticky Info) */}
          <ProductInfo
            product={product}
            effectivePrice={effectivePrice}
            effectiveOriginalPrice={effectiveOriginalPrice}
          />
        </div>
      </div>

      {/* Similar Items and People Also Viewed Section - Full Width Background */}
      <section className="bg-accent-800 py-12 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-4 gap-4">
          {/* Similar Items Section */}
          <div className="pb-12">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">Similar Items You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {similarItemsLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-300 animate-pulse rounded-xs h-90"></div>
                ))
              ) : similarItemsError ? (
                <p className="text-red-300 col-span-full text-center">
                  {similarItemsError}
                </p>
              ) : similarItems.length > 0 ? (
                similarItems.map((item) => (
                  <ColProductCard key={item.id} {...item} />
                ))
              ) : (
                <p className="text-gray-300 col-span-full text-center">
                  No similar items available.
                </p>
              )}
            </div>
          </div>

          {/* People Also Viewed Section */}
          <div>
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">People Who Viewed This Item Also Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {alsoViewedLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-300 animate-pulse rounded-xs h-90"></div>
                ))
              ) : alsoViewedError ? (
                <p className="text-red-300 col-span-full text-center">
                  {alsoViewedError}
                </p>
              ) : alsoViewed.length > 0 ? (
                alsoViewed.map((item) => (
                  <ColProductCard key={item.id} {...item} />
                ))
              ) : (
                <p className="text-gray-300 col-span-full text-center">
                  No related items available.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
