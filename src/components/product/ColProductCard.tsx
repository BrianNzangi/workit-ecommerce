import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PackageCheck, ShoppingCart } from 'lucide-react'
import { Product } from '@/types/product'
import { getProductImageUrl } from '@/lib/image-utils'
import { useCartStore } from '@/store/cartStore'

export default function ColProductCard({
  id,
  name,
  slug,
  type,
  price,
  regular_price,
  images,
  image,
  variations,
  variants,
  shippingMethod,
  condition,
}: Product) {
  let displayPrice = Number(price) || 0
  let displayRegular: number | null = regular_price
    ? Number(regular_price)
    : null

  // ✅ Handle variable products
  if (type === 'variable' && variations?.length) {
    const prices = variations.map((v) =>
      v.sale_price ? Number(v.sale_price) : Number(v.price) || 0
    )
    const regulars = variations.map((v) => Number(v.regular_price) || 0)

    const minPrice = Math.min(...prices.filter(Boolean))
    const maxPrice = Math.max(...prices.filter(Boolean))

    displayPrice = minPrice
    displayRegular =
      Math.max(...regulars) > minPrice ? Math.max(...regulars) : null

    // If multiple variation prices, show range
    if (minPrice !== maxPrice) {
      name = `${name} (KES ${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)})`
    }
  }

  const discount =
    displayRegular && displayRegular > displayPrice
      ? Math.round(((displayRegular - displayPrice) / displayRegular) * 100)
      : null

  // Get the first variant ID for Vendure
  const variantId = variants?.[0]?.id || variations?.[0]?.id || id

  const { addItem, openCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Get the first image URL
    const imageUrl = image ||
      images?.[0]?.url ||
      images?.[0]?.src ||
      variations?.[0]?.image?.src ||
      '';

    // Add item to cart
    addItem({
      id: String(variantId), // Convert to string for cart store
      name: name || 'Product',
      image: imageUrl,
      price: displayPrice,
      quantity: 1,
    });

    // Open cart slide
    openCart();

    // Show success toast with product image
    toast.success(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {imageUrl ? (
              <img
                src={getProductImageUrl(imageUrl, 'card')}
                alt={name || 'Product'}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[DM_Sans] text-sm font-semibold text-gray-900">
              Added to cart!
            </p>
            <p className="font-[DM_Sans] text-xs text-gray-600 line-clamp-2">
              {name}
            </p>
          </div>
        </div>
      ),
      {
        duration: 2000,
      }
    );
  };

  return (
    <Link href={`/deal-details/${slug}`} className="group w-full h-full block">
      <div className="p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col cursor-pointer rounded-lg">
        {/* Image Container - Fixed aspect ratio for consistency */}
        <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
          {image || images?.[0]?.url || images?.[0]?.src || variations?.[0]?.image?.src ? (
            <Image
              src={getProductImageUrl(
                image ||
                images?.[0]?.url ||
                images?.[0]?.src ||
                variations?.[0]?.image?.src,
                'card'
              )}
              alt={name}
              fill
              className="object-contain scale-75"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}

          {/* Quick Add Button - Bottom Left */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 left-2 z-10 bg-primary-900 text-white p-2 rounded-full transition-all duration-200 hover:bg-[#e04500] active:scale-95 shadow-md flex items-center justify-center"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>


        </div>

        {/* Product Info - Reduced spacing on mobile */}
        <div className="flex-grow flex flex-col space-y-1.5 sm:space-y-2">
          {/* Product Name */}
          <h3 className="font-['DM_Sans'] text-sm font-medium text-gray-800 line-clamp-2 break-words leading-tight">
            {name || 'Product'}
          </h3>

          {/* Variation Preview */}
          {type === 'variable' && variations?.length && (
            <div className="text-xs text-gray-600 line-clamp-1">
              {variations[0].attributes
                ?.slice(0, 2) // Limit to 2 attributes
                .map((attr) => `${attr.name}: ${attr.option}`)
                .join(' • ')}
            </div>
          )}

          {/* Price Section */}
          <div className="mt-auto pt-1 flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-['DM_Sans'] text-base font-bold text-[#1F2323]">
                KES {displayPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              {displayRegular && displayRegular > 0 && (
                <>
                  <span className="font-['DM_Sans'] text-gray-500 text-xs line-through">
                    KES {displayRegular.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-green-700 text-xs font-bold">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Express Banner */}
            {shippingMethod?.isExpress && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-0.5 bg-white border border-dashed border-primary-900 font-['DM_Sans'] text-[11px] font-semibold px-1.5 py-0.5 rounded-xs"
                  style={{ transform: 'skewX(-10deg)' }}
                >
                  <span style={{ transform: 'skewX(10deg)' }} className="inline-flex items-center gap-0.5">
                    <span className="text-black font-bold uppercase">Workit</span>
                    <span className="inline-flex items-center gap-0.5 uppercase text-primary-900">
                      <PackageCheck size={11} className="fill-current" />
                      Express
                    </span>
                  </span>
                </span>
                {condition === 'REFURBISHED' && (
                  <span
                    className="inline-flex items-center bg-secondary-900 font-['DM_Sans'] text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase"
                    style={{ transform: 'skewX(-10deg)' }}
                  >
                    <span style={{ transform: 'skewX(10deg)' }}>
                      Refurbished
                    </span>
                  </span>
                )}
              </div>
            )}
            {/* Show refurbished badge even without express shipping */}
            {!shippingMethod?.isExpress && condition === 'REFURBISHED' && (
              <div className="flex">
                <span
                  className="inline-flex items-center bg-secondary-900 font-['DM_Sans'] text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase"
                  style={{ transform: 'skewX(-10deg)' }}
                >
                  <span style={{ transform: 'skewX(10deg)' }}>
                    Refurbished
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
