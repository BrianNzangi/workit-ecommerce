'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import he from 'he';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    children?: Category[];
}

interface SubCollectionListProps {
    parentSlug: string;
    children: Category[];
}

export default function SubCollectionList({ parentSlug, children }: SubCollectionListProps) {
    if (!children || children.length === 0) return null;

    return (
        <div className="space-y-4 px-2">
            {children.map((l2) => (
                <div key={l2.id} className="space-y-2">
                    <Link
                        href={`/collections/${parentSlug}/${l2.slug}`}
                        className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-900 transition-colors"
                    >
                        <ChevronRight size={14} className="text-primary-400" />
                        {he.decode(l2.name)}
                        <span className="text-[10px] text-gray-300 font-medium italic">({l2.count} Products)</span>
                    </Link>

                    {/* L3 items */}
                    {l2.children && l2.children.length > 0 && (
                        <div className="ml-6 grid grid-cols-1 gap-1">
                            {l2.children.map((l3) => (
                                <Link
                                    key={l3.id}
                                    href={`/collections/${parentSlug}/${l2.slug}/${l3.slug}`}
                                    className="text-xs text-gray-500 hover:text-primary-700 transition-colors py-0.5 flex items-center gap-1.5"
                                >
                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                    {he.decode(l3.name)}
                                    <span className="text-[9px] text-gray-300">({l3.count})</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
