import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'

export default function ProductCard({
  name,
  slug,
  type,
  price,
  regular_price,
  images,
  image,
  variations,
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

  return (
    <Link href={`/collection/${slug}`} className="group w-full h-full block">
      <div className="p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col cursor-pointer">
        {/* Image Container - Fixed aspect ratio for consistency */}
        <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
          {image || images?.[0]?.src || variations?.[0]?.image?.src ? (
            <Image
              src={
                image ||
                images?.[0]?.src ||
                variations?.[0]?.image?.src ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4='
              }
              alt={name}
              fill
              className="object-contain scale-75"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-0.5 left-0.5">
              <span
                className="inline-block bg-primary-900 font-['DM_Sans'] text-white text-xs font-semibold px-2 py-1.5 rounded-xs"
                aria-label={`Save ${discount} percent`}
              >
                {discount}% OFF
              </span>
            </div>
          )}
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

          {/* Price Section - Positioned at bottom with reduced top margin */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-['DM_Sans'] text-base font-bold text-[#1F2323]">
                KES {displayPrice.toFixed(0)}
              </span>
              {displayRegular && displayRegular > 0 && (
                <span className="font-['DM_Sans'] text-gray-500 text-xs line-through">
                  KES {displayRegular.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
