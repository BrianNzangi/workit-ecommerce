"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Breadcrumb, Category } from "@/utils/breadcrumbs"
import he from "he"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ProductInfo from "@/components/product/ProductInfo"
import ColProductCard from "@/components/product/ColProductCard"
import { Product } from "@/types/product"
import { getImageUrl } from "@/lib/image-utils"
import { trackMetaEvent } from "@/lib/meta-browser"

export default function ProductPage({
  product,
  allCategories,
  similarItems,
  alsoViewed,
}: {
  product: Product
  allCategories: Category[]
  similarItems: Product[]
  alsoViewed: Product[]
}) {
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

  const flattenedCategories = flattenCategories(allCategories);

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

  const breadcrumbs: Breadcrumb[] = [];
  if (product.categories && product.categories.length > 0 && flattenedCategories.length > 0) {
    const primaryCat =
      flattenedCategories.find((c) => String(c.id) === String(product.categories![0].id)) ||
      product.categories[0];
    const chain = buildChain(primaryCat, flattenedCategories);
    chain.forEach((c) => {
      breadcrumbs.push({
        name: c.name,
        slug: c.slug,
        id: c.id,
        url: `/collections/${c.slug}`,
      });
    });
  }

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ name: "Home", slug: "", url: "/" });
  } else if (breadcrumbs[0].name !== "Home") {
    breadcrumbs.unshift({ name: "Home", slug: "", url: "/" });
  }

  const [selectedIdx, setSelectedIdx] = useState(0)
  const images = product.images || []
  const trackedProductIdRef = useRef<string | null>(null)

  const effectivePrice =
    (product as any).selectedVariationPrice ??
    (typeof product.price === "string" ? parseFloat(product.price) : product.price)

  const effectiveOriginalPrice =
    (product as any).selectedVariationOriginalPrice ??
    (typeof product.compareAtPrice === "string"
      ? parseFloat(product.compareAtPrice)
      : product.compareAtPrice) ??
    0

  useEffect(() => {
    if (trackedProductIdRef.current === product.id) return

    trackedProductIdRef.current = product.id
    void trackMetaEvent({
      eventName: "ViewContent",
      eventId: `view-content:${product.id}:${Date.now()}`,
      customData: {
        currency: "KES",
        value: Number(effectivePrice || 0),
        content_type: "product",
        content_ids: [String(product.id)],
        content_name: product.name,
      },
    })
  }, [effectivePrice, product.id, product.name])

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <main className="font-sans mt-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4 mb-8">
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          {breadcrumbs.map((crumb, idx) => {
            const crumbName = he.decode(crumb.name)
            return (
              <React.Fragment key={crumb.url}>
                {idx > 0 && <span className="px-1">/</span>}
                {idx < breadcrumbs.length - 1 ? (
                  <Link href={crumb.url} className="hover:underline">
                    {crumbName}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-medium">{crumbName}</span>
                )}
              </React.Fragment>
            )
          })}
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-sm">
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-152">
                {images.slice(0, 6).map((img, idx) => (
                  <div
                    key={img.id || `${img.url}-${idx}`}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-gray-100 cursor-pointer ${
                      selectedIdx === idx ? "border-2 border-black" : "opacity-80 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedIdx(idx)}
                  >
                    <Image
                      src={getImageUrl(img.url || "")}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              <div className="flex-1 flex items-center bg-gray-100 justify-center relative">
                <button
                  onClick={prevImage}
                  className="absolute left-2 bg-white shadow rounded-full p-2 z-10"
                >
                  <FaChevronLeft />
                </button>
                <Image
                  src={getImageUrl(images[selectedIdx]?.url || "")}
                  alt={product.name}
                  width={800}
                  height={608}
                  className="h-100 md:h-152 w-auto object-contain"
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

          <ProductInfo
            product={product}
            effectivePrice={effectivePrice}
            effectiveOriginalPrice={effectiveOriginalPrice}
          />
        </div>
      </div>

      <section className="bg-accent-800 py-12 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-4 gap-4">
          <div className="pb-12">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">Similar Items You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {similarItems.length > 0 ? (
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

          <div>
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">People Who Viewed This Item Also Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {alsoViewed.length > 0 ? (
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
