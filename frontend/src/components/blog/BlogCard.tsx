'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
  id: number;
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
      className="group block w-[280px] rounded-xs overflow-hidden"
    >
      <div className="relative w-full h-[240px]"> {/* Adjusted card height */}
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
            className="transition-transform group-hover:scale-105"
            priority={true} // optional: for faster loading of visible cards
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 w-full bg-white text-black p-4 flex flex-col gap-1"
          style={{ height: '90px' }} // fixed overlay height
        >
          <span className="text-xs font-semibold uppercase">{category}</span>
          <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
