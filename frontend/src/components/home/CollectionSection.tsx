'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCarousel from './ProductCarousel';
import SectionContainer from '@/components/layout/SectionContainer';
import type { HomepageCollectionData } from '@/lib/homepage/homepage-data';

interface CollectionSectionProps {
    collection: HomepageCollectionData | null;
}

export default function CollectionSection({ collection }: CollectionSectionProps) {
    if (!collection || !collection.products || collection.products.length === 0) {
        return null;
    }

    const title = collection.title || collection.slug;

    return (
        <section aria-label={title}>
            <SectionContainer className="py-4">
                <div className="flex items-end justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-secondary-900">
                        {title}
                    </h2>
                    <Link
                        href={`/deal-details/${collection.slug}`}
                        className="inline-flex items-center gap-1 uppercase text-sm font-bold text-primary-900 hover:text-primary-800 transition-colors whitespace-nowrap"
                    >
                        <span>View All</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {collection.products && collection.products.length > 0 && (
                    <ProductCarousel products={collection.products} />
                )}
            </SectionContainer>
        </section>
    );
}
