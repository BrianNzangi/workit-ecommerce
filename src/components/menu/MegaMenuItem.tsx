'use client';

import React from 'react';
import Image from 'next/image';
import he from 'he';

interface MegaMenuItemProps {
  title: string;
  image?: string;
  href: string;
}

export default function MegaMenuItem({ title, image, href }: MegaMenuItemProps) {
  return (
    <a
      href={href}
      className="group relative block aspect-[4/2] w-full bg-gray-100 rounded-md overflow-hidden transition"
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
          No image available
        </div>
      )}

      {/* Bottom-left overlay text */}
      <div className="absolute bottom-2 left-2 text-sm font-semibold text-white bg-black/70 px-2 py-1 rounded">
        {he.decode(title)}
      </div>
    </a>
  );
}
