"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Tag } from "lucide-react"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductBenefits from "@/components/product/ProductBenefits"
import { getProductPriceDisplay, getProductPromotionBadge } from "@/lib/product-promotion"
import { useCartStore } from "@/store/cartStore"
import { Product } from "@/types/product"

interface ProductInfoProps {
  product: Product
  cartPrice: number
  cartOriginalPrice: number
}

export default function ProductInfo({
  product,
  cartPrice,
  cartOriginalPrice,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  const { addItem: addToCartStore } = useCartStore()
  const router = useRouter()

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

  const handleAddToCart = async () => {
    const canBuy = product.canBuy ?? true
    const variantId = product.variantId || product.variants?.[0]?.id

    if (!canBuy) {
      toast.error("This product is currently out of stock")
      return
    }

    if (!variantId || variantId === "undefined" || variantId === "null") {
      toast.error("Invalid product variant. Please refresh the page.")
      return
    }

    addToCartStore({
      id: String(product.id),
      variantId: String(variantId),
      name: product.name || "Product",
      image: product.image || product.images?.[0]?.url || "",
      price: cartPrice,
      quantity,
      activePromotion: product.activePromotion || null,
    })

    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleBuyNow = async () => {
    const canBuy = product.canBuy ?? true
    const variantId = product.variantId || product.variants?.[0]?.id

    if (!canBuy) {
      toast.error("This product is currently out of stock")
      return
    }

    addToCartStore({
      id: String(product.id),
      variantId: String(variantId),
      name: product.name || "Product",
      image: product.image || product.images?.[0]?.url || "",
      price: cartPrice,
      quantity,
      activePromotion: product.activePromotion || null,
    })

    router.push("/checkout")
  }

  const handleWishlist = () => {
    toast.success("Added to wishlist")
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

  const formatPrice = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0"
    return value.toLocaleString("en-KE")
  }

  return (
    <div className="sticky top-24 self-start flex w-full flex-col gap-4 md:w-1/4 lg:w-1/3">
      <div className="flex flex-col gap-5 rounded-lg bg-white px-2 py-2 shadow-md md:px-5 md:py-5">
        {promotionBadge && (
          <div className="flex">
            <span className="inline-flex rounded-sm bg-primary-100 px-2 py-2 text-xs font-bold leading-none text-primary-900">
              {promotionBadge}
            </span>
          </div>
        )}

        <h1 className="text-xl font-bold text-secondary-900 md:text-[1.75rem]">
          {product.name}
        </h1>

        <div className="-mt-2 text-sm font-semibold text-primary-900">
          Brand: {product.brand?.name || "N/A"}
        </div>

        <div className="text-3xl font-bold text-secondary-900 md:text-[2rem]">
          KSh.{formatPrice(effectiveDisplayPrice)}
          {effectiveRegularPrice && effectiveRegularPrice > effectiveDisplayPrice && (
            <span className="ml-3 text-lg font-normal text-primary-700 line-through">
              KSh.{formatPrice(effectiveRegularPrice)}
            </span>
          )}
        </div>

        {shouldShowSavingsLabel && (
          <div className="-mt-4 text-sm font-bold text-[#225b24]">
            {savingsLabel}
          </div>
        )}

        {couponCode && (
          <div className="-mt-2 max-w-fit">
            <div className="flex min-w-70 items-start gap-3 rounded-md border border-dashed border-red-300 bg-primary-100/10 px-4 py-3">
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
                  className="mt-1 text-sm font-medium text-primary-900 underline underline-offset-2 hover:text-[#225b24]"
                >
                  Copy code
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200"></div>

        {(() => {
          const isAvailable = product.canBuy ?? true
          const stockOnHandValue = product.stockOnHand ?? 0

          return (
            <div className="flex items-center justify-between gap-3">
              {isAvailable ? (
                <div className="text-lg font-bold text-[#225b24]">
                  {stockOnHandValue > 0 && `${stockOnHandValue} available`} In Stock
                </div>
              ) : (
                <div className="text-lg font-bold text-red-600">
                  Out of Stock
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    isAvailable
                      ? "border-gray-200 bg-white text-secondary-900 hover:border-gray-300 hover:bg-gray-50"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleWishlist}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-secondary-900 transition hover:border-gray-300 hover:bg-gray-50"
                  aria-label="Add to wishlist"
                >
                  <Heart size={18} />
                </button>
              </div>
            </div>
          )
        })()}

        {(() => {
          const isAvailable = product.canBuy ?? true

          return (
            <div className="flex items-stretch gap-3">
              <Select
                value={String(quantity)}
                onValueChange={(value) => setQuantity(Number(value))}
              >
                <SelectTrigger
                  className="h-auto min-h-12 w-23 rounded-none border-gray-200 bg-white px-3 py-3 font-medium text-secondary-900"
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
                className={`flex-1 px-6 py-3 font-medium transition ${
                  isAvailable
                    ? "bg-primary-900 text-white hover:bg-primary-800"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
                {isAvailable ? "Buy Now" : "Out of Stock"}
              </button>
            </div>
          )
        })()}

      </div>
      <div className="flex flex-col gap-5 rounded-lg bg-white px-2 py-2 shadow-md md:px-5 md:py-5">
        <ProductBenefits />
      </div>
    </div>
  )
}
