'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutGrid, Package, ChevronDown, MoveRight } from 'lucide-react';
import he from 'he';

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
                    // Only top-level for the main list
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
                <header className="mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold tracking-wider uppercase">
                        <LayoutGrid size={14} />
                        Directory
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Our Collections
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl font-medium">
                        Browse through our extensive catalog of products organized by categories to help you find exactly what you're looking for.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {categories.map((l1) => (
                        <div key={l1.id} className="group space-y-6">
                            <Link
                                href={`/collections/${l1.slug}`}
                                className="block space-y-4"
                            >
                                <div className="aspect-video bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-900/10 group-hover:-translate-y-1 relative overflow-hidden">
                                    {/* Subtle background pattern/blob */}
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="space-y-2 relative z-10">
                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary-900 transition-colors">
                                            {he.decode(l1.name)}
                                        </h2>
                                        <p className="text-sm font-bold text-gray-400">
                                            {l1.count} Products
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
                                            <MoveRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* L2 and L3 nested listing */}
                            {l1.children && l1.children.length > 0 && (
                                <div className="space-y-4 px-2">
                                    {l1.children.map((l2) => (
                                        <div key={l2.id} className="space-y-2">
                                            <Link
                                                href={`/collections/${l1.slug}/${l2.slug}`}
                                                className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-900 transition-colors"
                                            >
                                                <ChevronRight size={14} className="text-primary-400" />
                                                {he.decode(l2.name)}
                                                <span className="text-[10px] text-gray-300 font-medium italic">({l2.count})</span>
                                            </Link>

                                            {/* L3 items */}
                                            {l2.children && l2.children.length > 0 && (
                                                <div className="ml-6 grid grid-cols-1 gap-1">
                                                    {l2.children.map((l3) => (
                                                        <Link
                                                            key={l3.id}
                                                            href={`/collections/${l1.slug}/${l2.slug}/${l3.slug}`}
                                                            className="text-xs text-gray-500 hover:text-primary-700 transition-colors py-0.5 flex items-center gap-1.5"
                                                        >
                                                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                            {he.decode(l3.name)}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
