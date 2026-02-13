'use client';

import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import he from 'he';

interface CollectionCardProps {
    name: string;
    slug: string;
    count: number;
}

export default function CollectionCard({ name, slug, count }: CollectionCardProps) {
    return (
        <Link
            href={`/collections/${slug}`}
            className="block group"
        >
            <div className="aspect-video bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-900/10 group-hover:-translate-y-1 relative overflow-hidden">
                {/* Subtle background pattern/blob */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary-900 transition-colors">
                        {he.decode(name)}
                    </h2>
                    <p className="text-sm font-bold text-gray-400">
                        {count} Products
                    </p>
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
                        <MoveRight size={20} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
