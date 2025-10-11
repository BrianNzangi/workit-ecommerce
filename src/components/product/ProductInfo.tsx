"use client"

import { useState, useEffect } from "react"
import { Product, ProductVariation } from "@/types/product"
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
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variations?.[0] || null
  )

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const router = useRouter()

  // Helper to normalize Woo prices
  const getNumericPrice = (val?: string | number) =>
    val && !isNaN(Number(val)) ? Number(val) : undefined

  // Update product.selectedVariationId (so parent can use it too if needed)
  useEffect(() => {
    if (selectedVariation) {
      product.selectedVariationId = selectedVariation.id
      product.selectedVariationPrice =
        getNumericPrice(selectedVariation.sale_price) ??
        getNumericPrice(selectedVariation.price) ??
        0
      product.selectedVariationOriginalPrice =
        getNumericPrice(selectedVariation.regular_price) ??
        getNumericPrice(selectedVariation.price)
    }
  }, [selectedVariation, product])

  const handleAddToCart = () => {
    const mainImage =
      product.images?.[0]?.src || product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4='
    addItem({
      id: (selectedVariation?.id || product.id)?.toString(),
      name: product.name,
      price:
        getNumericPrice(selectedVariation?.sale_price) ??
        getNumericPrice(selectedVariation?.price) ??
        effectivePrice,
      image: mainImage,
      quantity,
    })
    openCart()
    toast.success("Added to cart")
  }

  const handleBuyNow = () => {
    const mainImage =
      product.images?.[0]?.src || product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4='
    addItem({
      id: (selectedVariation?.id || product.id)?.toString(),
      name: product.name,
      price:
        getNumericPrice(selectedVariation?.sale_price) ??
        getNumericPrice(selectedVariation?.price) ??
        effectivePrice,
      image: mainImage,
      quantity,
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

  // Active price logic
  const activePrice =
    getNumericPrice(selectedVariation?.sale_price) ??
    getNumericPrice(selectedVariation?.price) ??
    effectivePrice

  const activeOriginalPrice =
    getNumericPrice(selectedVariation?.regular_price) ??
    getNumericPrice(selectedVariation?.price) ??
    effectiveOriginalPrice

  return (
    <div className="w-full md:w-1/4 lg:w-1/3 sticky top-24 self-start">
      <div className="rounded-sm bg-white flex flex-col gap-4 mt-2">
        <h1 className="text-lg text-secondary-900 font-bold -mb-4">{product.name}</h1>
        <div className="text-sm text-primary-900">
          Brand: {product.brand || "N/A"}
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

       {/* Variations */}
       {product.variations?.length ? (
         <div>
           <h2 className="font-semibold mb-2">Variations</h2>
           <div className="flex flex-wrap gap-3">
             {product.variations.map((variation, idx) => {
               const isActive =
                 selectedVariation?.id === variation.id ||
                 (!selectedVariation && idx === 0)

               // Build attributes label
               const attributesLabel = variation.attributes
                 ?.map((attr) =>
                   `${attr.name.replace(/^attribute_pa_/, "")}: ${attr.option}`
                 )
                 .join(" • ")

               return (
                 <button
                   key={variation.id ?? idx}
                   onClick={() => setSelectedVariation(variation)}
                   className={`border px-4 py-2 text-sm text-left transition-colors
                     ${
                       isActive
                         ? "border-primary bg-primary-900/20 ring ring-primary-900 text-secondary-900"
                         : "border-gray-300 hover:border-primary-900 text-sm font-light"
                     }
                   `}
                 >
                   <div className="font-medium">
                     {attributesLabel || "Unnamed Variant"}
                   </div>
                 </button>
               )
             })}
           </div>
         </div>
       ) : null}

        {/* Stock + Qty */}
        <div className="text-green-600 text-lg font-bold">In Stock</div>
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
        <button
          className="bg-primary-900 text-white font-medium px-6 py-3 transition hover:bg-primary-800 w-full"
          onClick={handleBuyNow}
        >
          Buy Now
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="border border-secondary-900 text-secondary-900 font-medium px-6 py-2 hover:bg-secondary-100 transition flex-1"
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
