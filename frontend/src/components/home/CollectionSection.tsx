'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCollectionBySlug } from '@/hooks/useCollectionBySlug';
import ProductCarousel from './ProductCarousel';
import ProductCardSkeleton from './ProductCardSkeleton';
import SectionContainer from '@/components/layout/SectionContainer';

interface CollectionSectionProps {
    slug: string;
    title: string;
    index: number;
}

export default function CollectionSection({ slug, title, index }: CollectionSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(index < 3);

    useEffect(() => {
        if (index < 3) return;

        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(el);
                }
            },
            { rootMargin: '800px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [index]);

    const { data: collection, isLoading, isError, refetch } = useCollectionBySlug(slug, inView);

    return (
        <section ref={ref} aria-label={title}>
            <SectionContainer className="px-6 sm:px-8 lg:px-16 py-4">
                <div className="flex items-end justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-black text-secondary-900">
                        {title}
                    </h2>
                    <Link
                        href={`/deal-details/${slug}`}
                        className="inline-flex items-center gap-1 uppercase text-sm font-bold text-primary-900 hover:text-primary-800 transition-colors whitespace-nowrap"
                    >
                        <span>View All</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="flex items-center gap-4 py-8">
                        <p className="text-sm text-gray-500">Failed to load products</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="text-sm font-medium text-primary-900 hover:text-primary-800 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {collection?.products && collection.products.length > 0 && (
                    <ProductCarousel products={collection.products} />
                )}
            </SectionContainer>
        </section>
    );
}
