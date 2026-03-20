"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Breadcrumb, Category } from "@/utils/breadcrumbs"
import he from "he"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ProductInfo from "@/components/product/ProductInfo"
import ProductRecommendations from "@/components/product/ProductRecommendations"
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

  const cartPrice =
    (product as any).selectedVariationPrice ??
    (typeof product.price === "string" ? parseFloat(product.price) : product.price)

  const cartOriginalPrice =
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
        value: Number(cartPrice || 0),
        content_type: "product",
        content_ids: [String(product.id)],
        content_name: product.name,
      },
    })
  }, [cartPrice, product.id, product.name])

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <main className="bg-[#FAFAFA] font-sans">
      <div className="mx-auto mb-8 max-w-300 px-4 py-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((crumb, idx) => {
            const crumbName = he.decode(crumb.name)
            return (
              <React.Fragment key={crumb.url}>
                {idx > 0 && <span className="px-1 text-gray-300">/</span>}
                {idx < breadcrumbs.length - 1 ? (
                  <Link href={crumb.url} className="transition hover:text-secondary-900 hover:underline">
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
            <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
              <div className="relative overflow-hidden rounded-lg bg-white">
                <div>
                  {images.length > 1 && (
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-3 text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-secondary-900"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft />
                    </button>
                  )}
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white">
                    <Image
                      src={getImageUrl(images[selectedIdx]?.url || "")}
                      alt={product.name}
                      width={900}
                      height={900}
                      className="max-h-80 w-auto object-contain lg:max-h-100"
                      unoptimized
                    />
                  </div>
                  {images.length > 1 && (
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-3 text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-secondary-900"
                      aria-label="Next image"
                    >
                      <FaChevronRight />
                    </button>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="border-t border-gray-100 px-2 py-2 md:px-2">
                    <div className="mb-3 text-center text-sm font-medium text-gray-500">
                      {selectedIdx + 1}/{images.length}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={img.id || `${img.url}-${idx}`}
                          type="button"
                          onClick={() => setSelectedIdx(idx)}
                          className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-white transition ${
                            selectedIdx === idx
                              ? "border-2 border-primary-900 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          aria-label={`View image ${idx + 1}`}
                        >
                          <Image
                            src={getImageUrl(img.url || "")}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            fill
                            className="object-contain p-2"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {product.description && (
              <section className="rounded-lg bg-white p-5 shadow-md md:p-5">
                <h2 className="text-2xl font-semibold text-secondary-900 border-b border-gray-200 mb-4 pb-2">
                  More about this item
                </h2>
                <div
                  className="-mt-12 prose prose-sm md:prose-base max-w-none text-secondary-700 [&>p]:mb-2 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:mb-3 [&>h2]:mb-3 [&>h3]:mb-3 [&>li]:mb-1 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500]"
                  dangerouslySetInnerHTML={{
                    __html: he.decode(product.description.trim()),
                  }}
                />
              </section>
            )}
          </div>

        <ProductInfo
          product={product}
          cartPrice={cartPrice}
          cartOriginalPrice={cartOriginalPrice}
        />
        </div>
      </div>
      <ProductRecommendations
        similarItems={similarItems}
        alsoViewed={alsoViewed}
      />
    </main>
  )
}
