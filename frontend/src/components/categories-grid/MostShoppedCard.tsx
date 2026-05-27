'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import he from 'he';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image/image-utils';

interface MostShoppedCardProps {
    name: string;
    slug: string;
    image?: string;
}

export default function MostShoppedCard({ name, slug, image }: MostShoppedCardProps) {
    const router = useRouter();
    const collectionHref = `/shop/collections/${slug}`;
    const imageUrl = getImageUrl(image);

    const prefetchCollection = () => {
        router.prefetch(collectionHref);
    };

    return (
        <Link
            href={collectionHref}
            className="block"
            onMouseEnter={prefetchCollection}
            onFocus={prefetchCollection}
            onTouchStart={prefetchCollection}
        >
            <div className="space-y-2">
                <div className="relative aspect-square bg-[#F5F5F5] rounded-md">
                    {image ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover rounded-md"
                            sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 13vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                            <span className="text-gray-300 text-[10px] font-bold text-center uppercase tracking-tighter leading-tight line-clamp-3">
                                {he.decode(name)}
                            </span>
                        </div>
                    )}
                </div>
                <h3 className="text-md font-medium text-gray-900 text-center line-clamp-1">
                    {he.decode(name)}
                </h3>
            </div>
        </Link>
    );
}
