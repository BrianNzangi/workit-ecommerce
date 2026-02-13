'use client';

import { useEffect, useState } from 'react';
import DirectoryHero from '@/components/collections/DirectoryHero';
import CollectionGroup from '@/components/collections/CollectionGroup';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    parentId?: string | null;
    children?: Category[];
}

export default function CollectionDirectory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/collections?includeChildren=true&take=1000');
                if (response.ok) {
                    const rawData = await response.json();

                    const processCategories = (cats: any[]): Category[] => {
                        return cats.map(cat => ({
                            id: cat.id,
                            name: cat.name,
                            slug: cat.slug,
                            count: cat._count?.products || 0,
                            parentId: cat.parentId,
                            children: cat.children ? processCategories(cat.children) : []
                        }));
                    };

                    const hierarchicalData = processCategories(rawData);
                    setCategories(hierarchicalData.filter(c => !c.parentId));
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1280px] mx-auto px-4 py-12 space-y-8">
                <div className="h-12 w-64 bg-gray-200 animate-pulse rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-[1280px] mx-auto px-4 py-16">
                <DirectoryHero />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {categories.map((l1: Category) => (
                        <CollectionGroup key={l1.id} collection={l1} />
                    ))}
                </div>
            </div>
        </div>
    );
}
