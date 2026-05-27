import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCarousel from './ProductCarousel';
import HorizontalBanner from '../banners/HorizontalBanner';
import SectionContainer from '@/components/layout/SectionContainer';
import type { HomepageCollectionData } from '@/lib/homepage/homepage-data';
import type { StoreBanner } from '@/lib/banner/banner-target';

interface HomepageCollectionProps {
    collections: HomepageCollectionData[];
    middleBanner?: StoreBanner | null;
    bottomBanner?: StoreBanner | null;
}

export default function HomepageCollection({
    collections,
    middleBanner,
    bottomBanner,
}: HomepageCollectionProps) {
    if (collections.length === 0) return null;

    const firstGroup = collections.slice(0, 3);
    const secondGroup = collections.slice(3, 6);
    const remaining = collections.slice(6);

    const renderCollection = (collection: HomepageCollectionData) => (
        <section key={collection.id} aria-label={collection.title}>
            <SectionContainer className="px-10 sm:px-12 lg:px-16 mb-8 py-6">
                <div className="flex items-end justify-between mb-4">
                    <div className="space-y-0">
                        <h2 className="text-lg md:text-xl font-extrabold text-secondary-900">
                            {collection.title}
                        </h2>
                        {collection.subtitle && (
                            <p className="text-sm md:text-base text-gray-600">
                                {collection.subtitle}
                            </p>
                        )}
                    </div>
                    <Link
                        href={`/deal-details/${collection.slug}`}
                        className="inline-flex items-center gap-1 uppercase text-sm font-bold text-primary-900 hover:text-primary-800 transition-colors whitespace-nowrap"
                    >
                        <span>View All</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {collection.description && (
                    <p className="text-base text-gray-700 mb-6 -mt-4">
                        {collection.description}
                    </p>
                )}

                <ProductCarousel products={collection.products} />
            </SectionContainer>
        </section>
    );

    return (
        <div>
            {firstGroup.map(renderCollection)}
            {middleBanner && <HorizontalBanner banner={middleBanner} position="MIDDLE" />}
            {secondGroup.map(renderCollection)}
            {bottomBanner && <HorizontalBanner banner={bottomBanner} position="BOTTOM" />}
            {remaining.map(renderCollection)}
        </div>
    );
}
