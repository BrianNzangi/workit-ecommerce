"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import SectionContainer from "@/components/layout/SectionContainer"
import { Breadcrumb, Category } from "@/utils/breadcrumbs"
import he from "he"
import { sanitizeHtml } from "@/lib/utils/sanitize"
import ProductMediaColumn from "@/components/product/ProductMediaColumn"
import ProductInfoColumn from "@/components/product/ProductInfoColumn"
import ProductPurchaseColumn from "@/components/product/ProductPurchaseColumn"
import { Product } from "@/types/product"
import { trackMetaEvent } from "@/lib/meta/meta-browser"

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
        url: `/shop/collections/${c.slug}`,
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

  return (
    <main className="bg-white font-sans">
      <SectionContainer className="px-10 sm:px-12 lg:px-16 mb-8 py-6">
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

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(420px,1.3fr)_minmax(360px,1.1fr)_minmax(320px,0.8fr)] gap-8">
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

        {product.description && (
          <section className="mt-10 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-secondary-900 mb-4">More About This Item</h2>
            <div
              className="prose prose-sm max-w-none text-secondary-700 [&>p]:mb-3 [&>ul]:mb-5 [&>ol]:mb-5 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>li]:mb-1.5 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500]"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(he.decode(product.description!.trim())),
              }}
            />
          </section>
        )}
      </SectionContainer>
    </main>
  )
}
