"use client"

import { useState } from "react"
import { ShoppingCart, Tag, ChevronRight, Handshake, ShieldCheck, Undo2 } from "lucide-react"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductBenefits from "@/components/product/ProductBenefits"
import { getProductPriceDisplay, getProductPromotionBadge } from "@/lib/product/product-promotion"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "@/types/product"

interface ProductPurchaseColumnProps {
  product: Product
  cartPrice: number
  cartOriginalPrice: number
}

export default function ProductPurchaseColumn({
  product,
  cartPrice,
  cartOriginalPrice,
}: ProductPurchaseColumnProps) {
  const [quantity, setQuantity] = useState(1)

  const { addItem: addToCartStore } = useCartStore()

  const { displayPrice, regularPrice, savingsLabel } = getProductPriceDisplay({
    price: cartPrice,
    compareAtPrice: cartOriginalPrice,
    activePromotion: product.activePromotion,
  })
  const promotionBadge = getProductPromotionBadge(product)
  const hasCampaignPromotion = Boolean(product.activePromotion)
  const effectiveDisplayPrice = hasCampaignPromotion ? Number(cartPrice || 0) : displayPrice
  const effectiveRegularPrice = hasCampaignPromotion ? null : regularPrice
  const shouldShowSavingsLabel = !product.activePromotion && Boolean(savingsLabel && regularPrice && regularPrice > displayPrice)
  const couponCode = product.activePromotion?.couponCode?.trim() || ""
  const couponMessage = (() => {
    const promotion = product.activePromotion
    if (!promotion || !couponCode) return ""

    if (promotion.badgeText?.trim()) {
      return promotion.badgeText.trim()
    }

    if (promotion.discountType === "FIXED_AMOUNT" && typeof promotion.savingsAmount === "number" && promotion.savingsAmount > 0) {
      return `KES ${promotion.savingsAmount.toLocaleString("en-KE")} off use ${couponCode}`
    }

    if (promotion.discountType === "PERCENTAGE" && typeof promotion.savingsPercent === "number" && promotion.savingsPercent > 0) {
      return `${promotion.savingsPercent}% off use ${couponCode}`
    }

    return `Save with code ${couponCode}`
  })()

  const isAvailable = product.canBuy ?? true
  const stockOnHand = product.stockOnHand ?? 0
  const isLowStock = isAvailable && stockOnHand > 0 && stockOnHand < 5

  const formatPrice = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0"
    return value.toLocaleString("en-KE")
  }

  const handleAddToCart = async () => {
    const canBuy = product.canBuy ?? true

    if (!canBuy) {
      toast.error("This product is currently out of stock")
      return
    }

    addToCartStore({
      id: String(product.id),
      name: product.name || "Product",
      image: product.image || product.images?.[0]?.url || "",
      price: cartPrice,
      quantity,
      activePromotion: product.activePromotion || null,
    })

    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleCopyCode = async () => {
    if (!couponCode) return

    try {
      await navigator.clipboard.writeText(couponCode)
      toast.success(`${couponCode} copied`)
    } catch {
      toast.error("Could not copy code")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 border-l border-gray-200 pl-0 md:pl-6">
        <div className="border-b border-gray-200 pb-8">
          {promotionBadge && (
            <div className="mb-4 flex">
                <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-bold leading-none text-primary-900">
                  {promotionBadge}
                </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="text-3xl font-bold text-secondary-900 md:text-[2rem]">
              KSh.{formatPrice(effectiveDisplayPrice)}
            </div>
            {effectiveRegularPrice && effectiveRegularPrice > effectiveDisplayPrice && (
              <div className="flex items-center gap-3">
                <span className="text-lg font-normal text-primary-700 line-through">
                  KSh.{formatPrice(effectiveRegularPrice)}
                </span>
                {shouldShowSavingsLabel && (
                  <span className="inline-flex items-center rounded-full bg-accent-200 px-2.5 py-0.5 text-sm font-bold text-accent-900">
                    {savingsLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            {isAvailable ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isLowStock ? "bg-accent-500" : "bg-accent-600"}`} />
                <span className={`text-base font-semibold ${isLowStock ? "text-accent-600" : "text-accent-700"}`}>
                  {isLowStock ? "Low Stock" : "In Stock"}
                  {stockOnHand > 5 && ` (${stockOnHand} available)`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-base font-semibold text-red-600">Out of Stock</span>
              </div>
            )}
          </div>

          {couponCode && (
            <div className="mt-4">
              <div                 className="flex min-w-70 items-start gap-3 rounded-md border border-dashed border-primary-300 bg-primary-100/10 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-primary-900">
                  <Tag size={17} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-primary-900">
                    {couponMessage}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="mt-1 text-sm font-medium text-primary-900 underline underline-offset-2 hover:text-accent-900"
                  >
                    Copy code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop: separator + quantity + add-to-cart */}
          <div className="hidden md:block mt-4 border-b border-gray-200" />
          <div className="hidden md:flex mt-4 items-stretch gap-3">
            <Select
              value={String(quantity)}
              onValueChange={(value) => setQuantity(Number(value))}
            >
              <SelectTrigger
                className="w-18 rounded-md border-gray-500 bg-white px-3 py-6 font-medium text-secondary-900"
                aria-label="Select quantity"
              >
                <SelectValue placeholder="Qty" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, index) => {
                  const value = String(index + 1)
                  return (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <button
              className={`flex flex-1 h-12 items-center justify-center gap-2 px-6 font-medium rounded-md transition ${
                isAvailable
                  ? "bg-primary-900 text-white hover:bg-primary-800"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              <ShoppingCart size={20} />
              {isAvailable ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

        </div>

        <div>
          <ProductBenefits />
        </div>
      </div>

      {/* Mobile fixed bottom bar: quantity + add-to-cart */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg">
        <div className="flex items-stretch gap-3">
          <Select
            value={String(quantity)}
            onValueChange={(value) => setQuantity(Number(value))}
          >
            <SelectTrigger
              className="w-18 rounded-md border-gray-500 bg-white px-3 py-6 font-medium text-secondary-900"
              aria-label="Select quantity"
            >
              <SelectValue placeholder="Qty" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, index) => {
                const value = String(index + 1)
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <button
            className={`flex flex-1 h-12 items-center justify-center gap-2 px-6 font-medium rounded-md transition ${
              isAvailable
                ? "bg-primary-900 text-white hover:bg-primary-800"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
            onClick={handleAddToCart}
            disabled={!isAvailable}
          >
            <ShoppingCart size={20} />
            {isAvailable ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </>
  )
}
