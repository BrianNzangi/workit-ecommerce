"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Share2, MessageCircle } from "lucide-react"
import he from "he"
import { sanitizeHtml } from "@/lib/utils/sanitize"
import toast from "react-hot-toast"
import type { Product } from "@/types/product"

interface ProductInfoColumnProps {
  product: Product
}

function extractFeatures(text?: string): string[] {
  if (!text) return []

  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean)

  const features = lines.map((line) =>
    line.replace(/^[•\-\*\d+\.\s]*\s*/, "").trim(),
  ).filter(Boolean)

  if (features.length > 0) return features

  const commaSplit = text.split(",").map((s) => s.trim()).filter(Boolean)
  if (commaSplit.length > 1) return commaSplit

  return [text.trim()]
}

export default function ProductInfoColumn({ product }: ProductInfoColumnProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const handleWishlist = () => {
    toast.success("Added to wishlist")
  }

  const rawDescription = (product as any).shortDescription || product.short_description || ""

  const allFeatures = extractFeatures(rawDescription)
  const visibleFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, 6)
  const hasMore = allFeatures.length > 6

  const sku =
    (product as any).sku ||
    product.variants?.[0]?.sku ||
    ""

  const handleCopySku = async () => {
    if (!sku) return
    try {
      await navigator.clipboard.writeText(sku)
      toast.success("SKU copied")
    } catch {
      toast.error("Could not copy SKU")
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied")
      } catch {
        toast.error("Could not copy link")
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <h1 className="text-xl lg:text-2xl font-bold leading-6 text-secondary-900">
        {product.name}
      </h1>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        {product.brand?.name && (
          <>
            <Link
              href={`/collections?brand=${product.brand.slug}`}
              className="font-semibold text-primary-900 hover:underline"
            >
              {product.brand.name}
            </Link>
            <span className="text-gray-300">|</span>
          </>
        )}

        {sku && (
          <>
            <button
              type="button"
              onClick={handleCopySku}
              className="font-medium text-gray-600 hover:text-secondary-900 transition cursor-pointer"
              title="Click to copy SKU"
            >
              SKU: {sku}
            </button>
            <span className="text-gray-300">|</span>
          </>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-secondary-900 transition cursor-pointer"
          aria-label="Share product"
        >
          <Share2 size={16} />
          Share
        </button>
      </div>

      {product.short_description && (
        <section className="border-t border-gray-200">
          <div
            className="prose prose-xs max-w-none text-secondary-700 [&>p]:mb-2 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:mb-3 [&>h2]:mb-3 [&>h3]:mb-3 [&>li]:mb-1 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500]"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(he.decode(product.short_description!.trim())),
            }}
          />
        </section>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={handleWishlist}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary-100/10 bg-secondary-100/10 text-primary-800 transition hover:border-gray-300 hover:bg-gray-50"
          aria-label="Add to wishlist"
        >
          <Heart size={18} />
        </button>

        <div className="border-t border-gray-200 pt-3">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-secondary-900 transition"
          >
            <MessageCircle className="text-accent-900" size={16} />
            Report incorrect or inappropriate product information.
          </button>
        </div>
      </div>
    </div>
  )
}
