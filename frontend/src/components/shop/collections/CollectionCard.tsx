'use client';

import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import he from 'he';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    children?: Category[];
}

interface CollectionCardProps {
    name: string;
    slug: string;
    count: number;
    subCollections?: Category[];
}

export default function CollectionCard({ name, slug, count, subCollections }: CollectionCardProps) {
    const hasChildren = subCollections && subCollections.length > 0;
    const l2 = subCollections?.slice(0, 5) || [];
    const remaining = (subCollections?.length || 0) - 5;

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/10 hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Link href={`/shop/collections/${slug}`} className="block">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-900 transition-colors">
                            {he.decode(name)}
                        </h2>
                        <p className="text-sm font-semibold text-gray-400">{count} Products</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300 shrink-0">
                        <MoveRight size={18} />
                    </div>
                </div>
            </Link>

            {hasChildren && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {l2.map((child) => (
                        <Link
                            key={child.id}
                            href={`/shop/collections/${slug}/${child.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-900 rounded-full text-xs font-semibold transition-colors"
                        >
                            {he.decode(child.name)}
                            <span className="text-gray-400 font-medium">({child.count})</span>
                        </Link>
                    ))}
                    {remaining > 0 && (
                        <Link
                            href={`/shop/collections/${slug}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors"
                        >
                            +{remaining} more
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
