'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import type { HomepageCollectionData } from '@/lib/homepage/homepage-data';

export default function ProductCarousel({ products }: { products: HomepageCollectionData['products'] }) {
    const [startIndex, setStartIndex] = useState(0);
    const visibleCount = 5;
    const maxStart = Math.max(0, products.length - visibleCount);

    if (products.length === 0) return null;

    const visibleProducts = products.slice(startIndex, startIndex + visibleCount);
    const hasPrev = startIndex > 0;
    const hasNext = startIndex < maxStart;

    return (
        <>
            {/* Mobile: horizontal snap scroll */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory">
                <div className="flex gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="snap-start shrink-0 w-[45%]">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop: paginated grid with arrows */}
            <div className="hidden md:block relative group/carousel">
                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>

                {hasPrev && (
                    <button
                        type="button"
                        onClick={() => setStartIndex(Math.max(0, startIndex - visibleCount))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors"
                        aria-label="Previous products"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {hasNext && (
                    <button
                        type="button"
                        onClick={() => setStartIndex(Math.min(maxStart, startIndex + visibleCount))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-primary-900 hover:border-primary-900 transition-colors"
                        aria-label="Next products"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </>
    );
}
