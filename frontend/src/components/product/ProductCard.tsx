import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PackageCheck, ShoppingCart } from 'lucide-react'
import { Product } from '@/types/product'
import { getProductImageUrl } from '@/lib/image-utils'
import { useCartStore } from '@/store/cartStore'

export default function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  images,
  image,
  variants,
  shippingMethod,
  condition,
  variantId,
  canBuy,
}: Product) {
  // ✅ Use pre-normalized data for Single-Product Mode
  const displayPrice = price ?? 0;
  const displayRegular = compareAtPrice ?? null;
  const isVariantAvailable = canBuy ?? true;
  const finalVariantId = variantId || variants?.[0]?.id || '';

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 Product Card Debug:', {
      productId: id,
      name,
      providedVariantId: variantId,
      variantsArray: variants,
      variantsLength: variants?.length,
      firstVariantId: variants?.[0]?.id,
      finalVariantId: finalVariantId,
      canBuy: isVariantAvailable
    });
  }



  const discount =
    displayRegular && displayRegular > displayPrice
      ? Math.round(((displayRegular - displayPrice) / displayRegular) * 100)
      : null

  const { addItem, openCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // ✅ Block adding unavailable variants
    if (!isVariantAvailable) {
      toast.error('This item is currently out of stock');
      return;
    }

    // ✅ Block adding if no variant ID is available
    if (!finalVariantId) {
      console.error('❌ Missing variant ID:', {
        productId: id,
        productName: name,
        providedVariantId: variantId,
        variants: variants,
        variantsLength: variants?.length
      });
      toast.error('Product configuration error. Please try refreshing the page or contact support.');
      return;
    }

    // Get the first image URL
    const imageUrl = image ||
      images?.[0]?.url ||
      '';

    // Add item to cart
    addItem({
      id: id, // ✅ Already a string (UUID)
      variantId: finalVariantId, // ✅ Already a string (UUID)
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

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toast.success('Added to wishlist')
  }

  return (
    <Link href={`/deal-details/${slug}`} className="group w-full h-full block">
      <div className="p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col cursor-pointer rounded-lg">
        {/* Image Container - Fixed aspect ratio for consistency */}
        <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
          {image || images?.[0]?.url ? (
            <Image
              src={getProductImageUrl(
                image ||
                images?.[0]?.url ||
                '',
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
            disabled={!isVariantAvailable}
            className={`absolute bottom-2 left-2 z-10 p-2 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${isVariantAvailable
              ? 'bg-primary-900 text-white hover:bg-[#e04500] active:scale-95 cursor-pointer'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            aria-label={isVariantAvailable ? 'Add to cart' : 'Out of stock'}
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
