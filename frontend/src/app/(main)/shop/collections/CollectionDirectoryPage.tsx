'use client';

import { useMemo } from 'react';
import { useCollections } from '@/hooks/useCollections';
import SectionContainer from '@/components/layout/SectionContainer';
import DirectoryHero from '@/components/shop/collections/DirectoryHero';
import CollectionGroup from '@/components/shop/collections/CollectionGroup';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    parentId?: string | null;
    children?: Category[];
}

export default function CollectionDirectory() {
    const { data: rawData = [], isLoading: loading } = useCollections(true);

    const categories = useMemo(() => {
        const processCategories = (cats: any[]): Category[] =>
            cats.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                count: cat._count?.products || 0,
                parentId: cat.parentId,
                children: cat.children ? processCategories(cat.children) : [],
            }));

        return processCategories(rawData).filter(c => !c.parentId);
    }, [rawData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <SectionContainer className="px-10 sm:px-12 lg:px-16 py-16">
                    <div className="space-y-8">
                        <div className="h-12 w-64 bg-gray-100 animate-pulse rounded-lg" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-52 bg-gray-100 animate-pulse rounded-3xl" />
                            ))}
                        </div>
                    </div>
                </SectionContainer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SectionContainer className="px-10 sm:px-12 lg:px-16 py-16">
                <DirectoryHero />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((l1: Category) => (
                        <CollectionGroup key={l1.id} collection={l1} />
                    ))}
                </div>
            </SectionContainer>
        </div>
    );
}
