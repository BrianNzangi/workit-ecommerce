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
    <div className="group block w-full">
      <a
        href={href}
        className="block bg-gray-100 rounded-md overflow-hidden transition"
      >
        <div className="relative aspect-[4/2] w-full">
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
        </div>
      </a>

      {/* Text below image */}
      <div className="py-2 text-sm font-semibold text-gray-800 group-hover:text-primary transition text-start">
        {he.decode(title)}
      </div>
    </div>
  );
}
