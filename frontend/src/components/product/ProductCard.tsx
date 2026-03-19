import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { PackageCheck, ShoppingCart } from 'lucide-react'
import { Product } from '@/types/product'
import { getProductImageUrl, shouldBypassImageOptimization } from '@/lib/image-utils'
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
  const router = useRouter();
  // Use pre-normalized data for Single-Product Mode
  const displayPrice = price ?? 0;
  const displayRegular = compareAtPrice ?? null;
  const isVariantAvailable = canBuy ?? true;
  const finalVariantId = variantId || variants?.[0]?.id || id || '';

  const discount =
    displayRegular && displayRegular > displayPrice
      ? Math.round(((displayRegular - displayPrice) / displayRegular) * 100)
      : null

  const { addItem, openCart } = useCartStore();
  const productHref = `/deal-details/${slug}`;
  const productImageSrc = getProductImageUrl(
    image ||
    images?.[0]?.url ||
    '',
    'card'
  );
  const shouldBypassOptimization = shouldBypassImageOptimization(productImageSrc);

  const prefetchProduct = () => {
    router.prefetch(productHref);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Block adding unavailable variants
    if (!isVariantAvailable) {
      toast.error('This item is currently out of stock');
      return;
    }

    // Block adding if no variant ID is available
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
      id: id, // Already a string (UUID)
      variantId: finalVariantId, // Already a string (UUID)
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
          <div className="relative w-12 h-12 shrink-0 bg-gray-100 rounded-md overflow-hidden">
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
            <p className="font-sans text-sm font-semibold text-gray-900">
              Added to cart!
            </p>
            <p className="font-sans text-xs text-gray-600 line-clamp-2">
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
    <Link
      href={productHref}
      className="group w-full h-full block"
      onMouseEnter={prefetchProduct}
      onFocus={prefetchProduct}
      onTouchStart={prefetchProduct}
    >
      <div className="p-3 border border-gray-300 hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col cursor-pointer rounded-lg">
        {/* Image Container - Fixed aspect ratio for consistency */}
        <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
          {image || images?.[0]?.url ? (
            <Image
              src={productImageSrc}
              alt={name}
              fill
              className="object-contain scale-90 md:scale-80 lg:scale-80"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              unoptimized={shouldBypassOptimization}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Product Info - Reduced spacing on mobile */}
        <div className="grow flex flex-col space-y-1 sm:space-y-1.5">
          {/* Product Name */}
          <h3 className="font-sans text-sm md:text-base font-medium text-gray-800 wrap-break-word whitespace-normal leading-snug">
            {name || 'Product'}
          </h3>

          {/* Price Section */}
          <div className="pt-0.5 flex flex-col gap-1">
            <div>
              <span className="font-sans text-lg md:text-xl font-bold text-[#1F2323]">
                KES {displayPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
            {displayRegular && displayRegular > displayPrice && discount !== null && (
              <div className="flex items-center gap-2">
                <span className="font-sans text-gray-500 text-sm md:text-base line-through">
                  KES {displayRegular.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-green-700 text-sm md:text-base font-bold">
                  {discount}% OFF
                </span>
              </div>
            )}

            {/* Express Banner */}
            {shippingMethod?.isExpress && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-0.5 bg-white border border-dashed border-primary-900 font-sans text-[11px] font-semibold px-1.5 py-0.5 rounded-xs"
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
                    className="inline-flex items-center bg-secondary-900 font-sans text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase"
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
                  className="inline-flex items-center bg-secondary-900 font-sans text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase"
                  style={{ transform: 'skewX(-10deg)' }}
                >
                  <span style={{ transform: 'skewX(10deg)' }}>
                    Refurbished
                  </span>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isVariantAvailable}
            className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm md:text-lg font-bold transition-all duration-200 ${isVariantAvailable
              ? 'bg-primary-900 text-white hover:bg-[#e04500] active:scale-[0.99] cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            aria-label={isVariantAvailable ? 'Add to cart' : 'Out of stock'}
          >
            <span>{isVariantAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

