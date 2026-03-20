'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
  id: string | number;
  title: string;
  slug: string;
  link: string;
  category: string;
  image: string;
}

export default function BlogCard({ title, slug, category, image }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block w-70"
    >
      <div className="relative w-full aspect-video overflow-hidden rounded-xs">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
            priority={true} // optional: for faster loading of visible cards
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="pt-3 space-y-1 text-black">
        <span className="block text-xs font-semibold uppercase">{category}</span>
        <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
      </div>
    </Link>
  );
}
