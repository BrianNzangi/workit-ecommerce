'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types/store';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/store/products/${slug}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error?.message || 'Failed to fetch product');
                }

                setProduct(data.data);
                // Set default variant
                if (data.data.variants.length > 0) {
                    setSelectedVariant(data.data.variants[0]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    const handleAddToCart = () => {
        // TODO: Implement add to cart functionality
        console.log('Add to cart:', {
            product: product?.id,
            variant: selectedVariant?.id,
            quantity,
        });
    };

    const getImageUrl = (url: string) => {
        if (!url) return '/placeholder-product.png';
        if (url.startsWith('http')) return url;
        return `/uploads/${url}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const currentPrice = selectedVariant?.price || product.price;
    const inStock = (selectedVariant?.stockOnHand || product.stockQuantity) > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
                        </li>
                        {product.collections.length > 0 && (
                            <>
                                <li className="text-gray-400">/</li>
                                <li>
                                    <a
                                        href={`/collection/${product.collections[0].slug}`}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        {product.collections[0].name}
                                    </a>
                                </li>
                            </>
                        )}
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-900 font-medium">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                            {product.images.length > 0 ? (
                                <Image
                                    src={getImageUrl(product.images[selectedImage]?.url)}
                                    alt={product.images[selectedImage]?.altText || product.name}
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <span className="text-gray-400">No image available</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-purple-600 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Image
                                            src={getImageUrl(image.url)}
                                            alt={image.altText}
                                            width={150}
                                            height={150}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Brand */}
                        {product.brand && (
                            <div className="flex items-center space-x-2">
                                {product.brand.logoUrl && (
                                    <Image
                                        src={getImageUrl(product.brand.logoUrl)}
                                        alt={product.brand.name}
                                        width={32}
                                        height={32}
                                        className="h-8 w-auto"
                                    />
                                )}
                                <a
                                    href={`/brand/${product.brand.slug}`}
                                    className="text-sm text-gray-600 hover:text-purple-600"
                                >
                                    {product.brand.name}
                                </a>
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                        {/* Price */}
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-bold text-gray-900">
                                KES {currentPrice.toLocaleString()}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                                <span className="text-xl text-gray-500 line-through">
                                    KES {product.compareAtPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div>
                            {inStock ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    In Stock ({selectedVariant?.stockOnHand || product.stockQuantity} available)
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                        )}

                        {/* Variants */}
                        {product.variants.length > 1 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-900">
                                    Select {product.variants[0]?.option || 'Option'}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            disabled={!variant.enabled || variant.stockOnHand === 0}
                                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedVariant?.id === variant.id
                                                ? 'border-purple-600 bg-purple-50 text-purple-900'
                                                : variant.enabled && variant.stockOnHand > 0
                                                    ? 'border-gray-200 hover:border-gray-300 text-gray-900'
                                                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {variant.optionValue || variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900">Quantity</label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedVariant?.stockOnHand || product.stockQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min((selectedVariant?.stockOnHand || product.stockQuantity), quantity + 1))}
                                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${inStock
                                ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>

                        {/* Product Details */}
                        <div className="border-t pt-6 space-y-3">
                            <h3 className="font-semibold text-gray-900">Product Details</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">SKU:</dt>
                                    <dd className="text-gray-900 font-medium">{selectedVariant?.sku || product.sku}</dd>
                                </div>
                                {product.collections.length > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Category:</dt>
                                        <dd className="text-gray-900 font-medium">
                                            {product.collections.map(c => c.name).join(', ')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
