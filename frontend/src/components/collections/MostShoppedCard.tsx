'use client';

import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import he from 'he';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';

interface MostShoppedCardProps {
    name: string;
    slug: string;
    image?: string;
}

export default function MostShoppedCard({ name, slug, image }: MostShoppedCardProps) {
    return (
        <Link
            href={`/collections/${slug}`}
            className="block group h-full"
        >
            <div className="h-full bg-white border border-gray-100 rounded-3xl p-4 md:p-6 flex flex-col justify-between transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-900/10 group-hover:-translate-y-1 relative overflow-hidden">
                {/* Subtle background pattern/blob */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 space-y-4">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                        {image ? (
                            <Image
                                src={getImageUrl(image)}
                                alt={name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <span className="text-gray-300 text-[10px] font-bold text-center uppercase tracking-tighter">
                                    {he.decode(name)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-primary-900 transition-colors line-clamp-2">
                            {he.decode(name)}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center justify-between relative z-10 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
                        <MoveRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
