'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PackageCheck, Plus, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { getProductImageUrl } from '@/lib/image/image-utils';
import { getProductPriceDisplay, getProductPromotionBadge } from '@/lib/product/product-promotion';
import { useCartStore } from '@/store/cartStore';

export default function ColProductCard({
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
    activePromotion,
    variantId,
    canBuy,
}: Product) {
    const router = useRouter();
    const basePrice = price ?? 0;
    const { displayPrice, regularPrice, savingsLabel } = getProductPriceDisplay({
        price: basePrice,
        compareAtPrice,
        activePromotion,
    });
    const promotionBadge = getProductPromotionBadge({ activePromotion });
    const isVariantAvailable = canBuy ?? true;
    const finalVariantId = variantId || variants?.[0]?.id || id || '';

    const { quickAdd, increaseQuantity, decreaseQuantity, removeItem, items } = useCartStore();
    const cartItem = items.find(i => i.variantId === finalVariantId || i.id === finalVariantId || i.productId === id);
    const quantity = cartItem?.quantity || 0;

    const productHref = `/deal-details/${slug}`;
    const productImageSrc = getProductImageUrl(
        image ||
        images?.[0]?.url ||
        '',
        'card'
    );

    const prefetchProduct = () => {
        router.prefetch(productHref);
    };

    const imageUrl = image ||
        images?.[0]?.url ||
        '';

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!isVariantAvailable) {
            toast.error('This item is currently out of stock');
            return;
        }

        if (!finalVariantId) {
            console.error('Missing variant ID:', {
                productId: id,
                productName: name,
                providedVariantId: variantId,
                variants: variants,
                variantsLength: variants?.length
            });
            toast.error('Product configuration error. Please try refreshing the page or contact support.');
            return;
        }

        await quickAdd({
            id: id,
            variantId: finalVariantId,
            name: name || 'Product',
            image: imageUrl,
            price: basePrice,
            quantity: 1,
            activePromotion: activePromotion || null,
        });

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
                        <p className="text-sm font-semibold text-gray-900">
                            Added to cart!
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
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

    const handleIncreaseQuantity = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartItem) {
            await increaseQuantity(cartItem.id);
        }
    };

    const handleDecreaseQuantity = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartItem) {
            if (cartItem.quantity <= 1) {
                await removeItem(cartItem.id);
            } else {
                await decreaseQuantity(cartItem.id);
            }
        }
    };

    return (
        <Link
            href={productHref}
            className="group w-full h-full"
            onMouseEnter={prefetchProduct}
            onFocus={prefetchProduct}
            onTouchStart={prefetchProduct}
        >
            <div className="p-3 border-2 border-gray-200 bg-white h-full flex flex-col rounded-md">
                <div className="relative w-full aspect-square overflow-hidden rounded-md mb-3">
                    {image || images?.[0]?.url ? (
                        <Image
                            src={productImageSrc}
                            alt={name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                        </div>
                    )}

                    {savingsLabel && (
                        <span className="absolute bottom-2 left-2 z-10 inline-flex rounded-sm bg-accent-200 px-2 py-2 text-xs font-bold leading-none text-accent-900">
                            {savingsLabel}
                        </span>
                    )}

                    {isVariantAvailable && quantity === 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="absolute bottom-2 right-2 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-md shadow-md border border-gray-200 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-colors"
                            aria-label="Add to cart"
                        >
                            <Plus size={16} />
                        </button>
                    )}

                    {isVariantAvailable && quantity > 0 && (
                        <div className="absolute bottom-2 right-2 z-10 group/cart flex items-center bg-primary-900 text-white rounded-md shadow-md h-8 overflow-hidden">
                            <button
                                onClick={handleDecreaseQuantity}
                                className="w-0 group-hover/cart:w-8 h-full overflow-hidden flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-primary-800"
                                aria-label="Remove from cart"
                            >
                                <Trash2 size={14} />
                            </button>
                            <span className="min-w-8 px-1 h-full flex items-center justify-center text-sm font-bold select-none">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncreaseQuantity}
                                className="w-0 group-hover/cart:w-8 h-full overflow-hidden flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-primary-800"
                                aria-label="Increase quantity"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grow flex flex-col space-y-1 sm:space-y-1.5">
                    {promotionBadge && (
                        <div className="flex">
                            <span
                                className="inline-flex rounded-sm bg-primary-100 px-1 py-2 text-xs font-semibold leading-none text-primary-900"
                                aria-label={promotionBadge}
                            >
                                {promotionBadge}
                            </span>
                        </div>
                    )}

                    <h3 className="text-sm md:text-md font-medium text-secondary-800 wrap-break-word leading-snug">
                        {name || 'Product'}
                    </h3>

                    <div className="pt-0.5 flex flex-col gap-1">
                        <div>
                            <span className="text-lg md:text-xl font-bold text-secondary-900">
                                Kes {displayPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        {regularPrice && regularPrice > displayPrice && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm md:text-base line-through">
                                    Kes {regularPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        )}

                        {shippingMethod?.isExpress && (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-0.5 bg-white border border-dashed border-primary-900 text-[11px] font-semibold px-1.5 py-0.5 rounded-xs -skew-x-10">
                                    <span className="inline-flex items-center gap-0.5 skew-x-10">
                                        <span className="text-black font-bold uppercase">Workit</span>
                                        <span className="inline-flex items-center gap-0.5 uppercase text-primary-900">
                                            <PackageCheck size={11} className="fill-current" />
                                            Express
                                        </span>
                                    </span>
                                </span>
                                {condition === 'REFURBISHED' && (
                                    <span className="inline-flex items-center bg-secondary-900 text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase -skew-x-10">
                                        <span className="skew-x-10">
                                            Refurbished
                                        </span>
                                    </span>
                                )}
                            </div>
                        )}
                        {!shippingMethod?.isExpress && condition === 'REFURBISHED' && (
                            <div className="flex">
                                <span className="inline-flex items-center bg-secondary-900 text-[11px] font-bold px-1.5 py-0.5 rounded-xs text-white uppercase -skew-x-10">
                                    <span className="skew-x-10">
                                        Refurbished
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
