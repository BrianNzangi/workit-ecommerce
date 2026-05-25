import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MostShoppedCard from '../collections/MostShoppedCard';
import SectionContainer from '../layout/SectionContainer';
import type { MostShoppedCollection } from '@/lib/homepage/homepage-data';

interface MostShoppedProps {
    collections: MostShoppedCollection[];
}

export default function MostShopped({ collections }: MostShoppedProps) {
    if (collections.length === 0) return null;

    return (
        <section aria-label="Most shopped collections" className="py-2 sm:py-4 lg:py-4">
            <SectionContainer className="px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                        Most Shopped
                    </h2>
                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:text-primary-800 transition-colors whitespace-nowrap"
                    >
                        <span>View All</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="flex md:grid md:grid-cols-8 gap-2 lg:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide">
                    {collections.map((collection) => (
                        <div key={collection.id} className="w-1/2 md:w-auto shrink-0">
                            <MostShoppedCard
                                name={collection.name}
                                slug={collection.slug}
                                image={collection.image}
                            />
                        </div>
                    ))}
                </div>
            </SectionContainer>
        </section>
    );
}
