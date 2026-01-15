"use client"

import { useState } from "react"
import { Product } from "@/types/product"
import toast from "react-hot-toast"
import { useCartStore } from "@/store/cartStore"
import { useRouter } from "next/navigation"
import { ShieldCheck, Undo2, Handshake, Minus, Plus as PlusIcon, ChevronRight } from "lucide-react"

interface ProductInfoProps {
  product: Product
  effectivePrice: number
  effectiveOriginalPrice: number
}

export default function ProductInfo({
  product,
  effectivePrice,
  effectiveOriginalPrice,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  const { addItem: addToCartStore } = useCartStore()
  const router = useRouter()

  // Helper to normalize Woo prices
  const getNumericPrice = (val?: string | number) =>
    val && !isNaN(Number(val)) ? Number(val) : undefined

  const handleAddToCart = async () => {
    // ✅ Single-Product Mode: Use the pre-normalized fields from the proxy API
    const canBuy = product.canBuy ?? true;
    const variantId = product.variantId || product.variants?.[0]?.id;

    if (!canBuy) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (!variantId || variantId === 'undefined' || variantId === 'null') {
      toast.error('Invalid product variant. Please refresh the page.');
      return;
    }

    addToCartStore({
      id: String(product.id),
      variantId: String(variantId),
      name: product.name || 'Product',
      image: product.image || product.images?.[0]?.url || '',
      price: effectivePrice,
      quantity: quantity,
    })

    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleBuyNow = async () => {
    const canBuy = product.canBuy ?? true;
    const variantId = product.variantId || product.variants?.[0]?.id;

    if (!canBuy) {
      toast.error('This product is currently out of stock');
      return;
    }

    addToCartStore({
      id: String(product.id),
      variantId: String(variantId),
      name: product.name || 'Product',
      image: product.image || product.images?.[0]?.url || '',
      price: effectivePrice,
      quantity: quantity,
    })

    router.push("/checkout")
  }

  const handleWishlist = () => {
    toast.success("Added to wishlist")
  }

  const formatPrice = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0"
    return value.toLocaleString("en-KE")
  }

  // Active price logic - already normalized
  const activePrice = effectivePrice
  const activeOriginalPrice = effectiveOriginalPrice

  return (
    <div className="w-full md:w-1/4 lg:w-1/3 sticky top-24 self-start">
      <div className="rounded-sm bg-white flex flex-col gap-4 mt-2">
        <h1 className="text-lg text-secondary-900 font-bold -mb-4">{product.name}</h1>
        <div className="text-sm text-primary-900">
          Brand: {product.brand?.name || "N/A"}
        </div>

        {/* Price */}
        <div className="text-2xl md:text-2xl lg:md:text-3xl font-bold text-primary">
          KSh.{formatPrice(activePrice)}
          <span className="text-gray-500 text-base font-normal ml-2">
            excl. VAT
          </span>
          {activeOriginalPrice > 0 && activeOriginalPrice !== activePrice && (
            <span className="text-gray-400 text-lg font-normal line-through ml-3">
              KSh.{formatPrice(activeOriginalPrice)}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200"></div>

        {/* Options / Variations - Hidden in Single-Product Mode */}
        {/* We automatically use the first variant (at index 0) */}

        {/* Stock Status */}
        {(() => {
          const isAvailable = product.canBuy ?? true;
          const stockOnHandValue = product.stockOnHand ?? 0;

          return (
            <>
              {isAvailable ? (
                <div className="text-green-600 text-lg font-bold">
                  In Stock {stockOnHandValue > 0 && `(${stockOnHandValue} available)`}
                </div>
              ) : (
                <div className="text-red-600 text-lg font-bold">
                  ❌ Out of Stock
                </div>
              )}
            </>
          )
        })()}

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-xs bg-gray-50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-200 border-r border-r-gray-200 rounded-l-sm"
            >
              <Minus />
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-14 text-center bg-white py-2 border-0 focus:ring-0 text-gray-900"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-200 border-l border-l-gray-200 rounded-r-sm"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Buttons */}
        {(() => {
          const isAvailable = product.canBuy ?? true;

          return (
            <>
              <button
                className={`font-medium px-6 py-3 transition w-full ${isAvailable
                  ? 'bg-primary-900 text-white hover:bg-primary-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
                {isAvailable ? 'Buy Now' : 'Out of Stock'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`font-medium px-6 py-2 transition flex-1 ${isAvailable
                    ? 'border border-secondary-900 text-secondary-900 hover:bg-secondary-100'
                    : 'border border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className="border border-secondary-900 text-secondary-900 font-medium px-6 py-2 hover:bg-secondary-100 transition flex-1"
                >
                  Wishlist
                </button>
              </div>
            </>
          )
        })()}

        {/* ✅ Benefits Section */}
        <div className="mt-6 space-y-4 text-left border-t border-gray-200 pt-4">
          {/* Security & Privacy */}
          <div className="flex items-start gap-3">
            <span className="text-green-600 bg-green-100 p-2 rounded-full">
              <ShieldCheck size={20} />
            </span>
            <div>
              <div className="flex items-center font-semibold text-sm">Security & Privacy {<ChevronRight size={16} />}</div>
              <div className="text-xs grid text-gray-900">
                <span>• 100% Secure payment</span>
                <span>• Secure privacy</span>
              </div>
            </div>
          </div>

          {/* Free Returns */}
          <div className="flex items-start gap-3">
            <span className="text-green-600 bg-green-100 p-2 rounded-full">
              <Undo2 size={20} />
            </span>
            <div>
              <div className="flex items-center font-semibold text-sm">FREE Returns {<ChevronRight size={16} />}</div>
              <div className="text-xs grid text-gray-900">
                <span>• 30-day Free Returns</span>
                <span>• Refund for lost/damaged items</span>
              </div>
            </div>
          </div>

          {/* Professional Service */}
          <div className="flex items-start gap-3">
            <span className="text-green-600 bg-green-100 p-2 rounded-full">
              <Handshake size={20} />
            </span>
            <div>
              <div className="flex items-center font-semibold text-sm">Professional Service {<ChevronRight size={16} />}</div>
              <div className="text-xs grid text-gray-900">
                <span>• 12-month warranty</span>
                <span>• Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
