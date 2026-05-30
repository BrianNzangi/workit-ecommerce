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
    const l2WithChildren = l2.filter(c => c.children && c.children.length > 0);

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-6 relative overflow-hidden">
            <Link href={`/shop/collections/${slug}`} className="block">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {he.decode(name)}
                        </h2>
                        <p className="text-sm font-semibold text-gray-400">{count} Products</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                        <MoveRight size={18} />
                    </div>
                </div>
            </Link>

            {hasChildren && (
                <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
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

                    {l2WithChildren.length > 0 && (
                        <div className="pl-1 space-y-0.5">
                            {l2WithChildren.slice(0, 3).map((l2Item) => {
                                const l3 = l2Item.children?.slice(0, 4) || [];
                                const l3Remaining = (l2Item.children?.length || 0) - 4;
                                return (
                                    <div key={l2Item.id} className="text-xs text-gray-400">
                                        <span className="font-medium text-gray-500">{he.decode(l2Item.name)}: </span>
                                        {l3.map((l3Item, i) => (
                                            <span key={l3Item.id}>
                                                {i > 0 && <span className="text-gray-300"> · </span>}
                                                <Link
                                                    href={`/shop/collections/${slug}/${l2Item.slug}/${l3Item.slug}`}
                                                    className="text-gray-400 hover:text-primary-700 transition-colors"
                                                >
                                                    {he.decode(l3Item.name)}
                                                </Link>
                                            </span>
                                        ))}
                                        {l3Remaining > 0 && (
                                            <span className="text-gray-300"> · +{l3Remaining} more</span>
                                        )}
                                    </div>
                                );
                            })}
                            {l2WithChildren.length > 3 && (
                                <Link
                                    href={`/shop/collections/${slug}`}
                                    className="text-xs text-primary-700 hover:text-primary-900 transition-colors font-medium"
                                >
                                    +{l2WithChildren.length - 3} more groups
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
