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
            className="block group mx-auto w-[120px]"
        >
            <div className="flex flex-col items-center">
                <div className="relative z-10 space-y-2 w-full text-center">
                    <div className="relative w-[120px] h-[120px] bg-white border border-gray-100 rounded-lg overflow-hidden mx-auto">
                        {image ? (
                            <Image
                                src={getImageUrl(image)}
                                alt={name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center p-2">
                                <span className="text-gray-300 text-[10px] font-bold text-center uppercase tracking-tighter">
                                    {he.decode(name)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-primary-900 transition-colors line-clamp-2">
                            {he.decode(name)}
                        </h3>
                    </div>
                </div>
            </div>
        </Link>
    );
}
