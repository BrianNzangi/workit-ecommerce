"use client"

import React, { useState } from "react"
import Image from "next/image"
import { buildBreadcrumbs, Breadcrumb, Category } from "@/utils/breadcrumbs"
import he from "he"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ProductInfo from "@/components/product/ProductInfo"
import { Product } from "@/types/product"

export default function ProductPage({
  product,
  allCategories,
}: {
  product: Product
  allCategories: Category[]
}) {
  const breadcrumbs: Breadcrumb[] = buildBreadcrumbs(
    product.categories || [],
    allCategories || []
  )

  const [selectedIdx, setSelectedIdx] = useState(0)
  const images = product.images || []

  // Variation-aware price (falls back to base price)
  const effectivePrice =
    (product as any).selectedVariationPrice ??
    (typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price)

  const effectiveOriginalPrice =
    (product as any).selectedVariationOriginalPrice ??
    (typeof product.regular_price === "string"
      ? parseFloat(product.regular_price)
      : product.regular_price) ??
    0

  const nextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4 mb-8 font-['DM_Sans'] mt-8">
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
        <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col gap-6">
          {/* Image gallery */}
          <div className="flex gap-4 bg-white p-4 rounded-sm">
            {/* Thumbnails - vertical */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[608px]">
              {images.slice(0, 6).map((img, idx) => (
                <div
                  key={img.id || `${img.src}-${idx}`}
                  className={`w-20 h-20 bg-gray-100 cursor-pointer ${
                    selectedIdx === idx
                      ? "border-2 border-black"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <Image
                    src={img.src}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
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
                src={images[selectedIdx]?.src || "/public/file.svg"}
                alt={product.name}
                width={800}
                height={608}
                className="h-[608px] w-auto object-contain"
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
            <section className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                More about this item
              </h2>
              <div
                className="prose max-w-none text-gray-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.description
                    .replace(/&/g, "&")
                    .replace(/</g, "<")
                    .replace(/>/g, ">")
                    .replace(/<img/g, '<img style="width: 70%; height: auto;" ')
                    .trim(),
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
    </main>
  )
}
