"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import SectionContainer from "@/components/layout/SectionContainer"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import { Category } from "@/utils/breadcrumbs"
import he from "he"
import { sanitizeHtml } from "@/lib/utils/sanitize"
import ProductMediaColumn from "@/components/product/details/ProductMediaColumn"

import ProductInfoColumn from "@/components/product/details/ProductInfoColumn"

import ProductPurchaseColumn from "@/components/product/details/ProductPurchaseColumn"
import { Product } from "@/types/product"
import { trackMetaEvent } from "@/lib/meta/meta-browser"
import { trackView } from "@/lib/analytics/actions"
import { ProductReviews } from "@/components/product/details/ProductReviews"

export default function ProductPage({
  product,
  allCategories,
}: {
  product: Product
  allCategories: Category[]
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

  const breadcrumbPaths: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];
  if (product.categories && product.categories.length > 0 && flattenedCategories.length > 0) {
    const primaryCat =
      flattenedCategories.find((c) => String(c.id) === String(product.categories![0].id)) ||
      product.categories[0];
    const chain = buildChain(primaryCat, flattenedCategories);
    chain.forEach((c) => {
      breadcrumbPaths.push({ label: c.name, href: `/shop/collections/${c.slug}` });
    });
  }
  breadcrumbPaths.push({ label: product.name });

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
    void trackView(product.slug || product.id)
  }, [cartPrice, product.id, product.name, product.slug])

  return (
    <main className="bg-white font-sans">
      <SectionContainer className="py-6">
        <div className="hidden md:block">
          <Breadcrumbs paths={breadcrumbPaths} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(420px,1.3fr)_minmax(360px,1.1fr)_minmax(320px,0.8fr)] gap-4 md:gap-8">
          <ProductMediaColumn
            images={images}
            productName={product.name}
            selectedIdx={selectedIdx}
            onSelectImage={setSelectedIdx}
          />

          <ProductInfoColumn product={product} />

          <div className="xl:sticky xl:top-22 xl:self-start">
            <ProductPurchaseColumn
              product={product}
              cartPrice={cartPrice}
              cartOriginalPrice={cartOriginalPrice}
            />
          </div>
        </div>

        <section className="border-t border-b border-gray-200 py-4 mt-6 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-8">
            <div className="md:col-span-5">
              <h2 className="text-lg font-bold text-secondary-900 mb-4">More About This Item</h2>
              {product.description ? (
                <div
                  className="prose prose-sm max-w-none text-secondary-700 [&>p]:mb-3 [&>ul]:mb-5 [&>ol]:mb-5 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>li]:mb-1.5 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500]"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(he.decode(product.description.trim())),
                  }}
                />
              ) : (
                <p className="text-sm text-gray-500">No description provided.</p>
              )}
            </div>
            <div className="md:col-span-3 md:border-l md:border-gray-200 md:pl-8">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </section>
      </SectionContainer>
    </main>
  )
}
