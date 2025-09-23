'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import he from 'he';
import axios from 'axios';
import { TOP_CATEGORIES } from '@/data/TopCategoryData';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: { src: string } | null;
  children?: Category[];
}

export default function TopCategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        const allCategories: Category[] = res.data;

        // Collect all L2s
        const l2Categories: Category[] = [];
        allCategories.forEach((cat) => {
          if (cat.children && cat.children.length > 0) {
            l2Categories.push(...cat.children.filter((child: Category) => child.image));
          }
        });

        // Filter only top categories by ID
        const filtered = TOP_CATEGORIES.map((top) =>
          l2Categories.find((cat) => cat.id === top.id)
        ).filter(Boolean) as Category[];

        setCategories(filtered);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderSkeleton = () => (
    <div className="group animate-pulse">
      <div className="w-full aspect-[4/3] sm:aspect-[3/2] bg-gray-200 rounded-lg mb-2 sm:mb-3" />
      <div className="space-y-1 sm:space-y-2">
        <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 sm:h-4 w-1/2 bg-gray-200 rounded sm:hidden" />
      </div>
    </div>
  );

  const renderCategory = (cat: Category) => (
    <div key={cat.id} className="group">
      <a
        href={`/collections/${cat.slug}`}
        className="block"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded sm:rounded-sm bg-gray-100 mb-2 sm:mb-3">
          {cat.image ? (
            <Image
              src={cat.image.src}
              alt={cat.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs sm:text-sm font-medium">No Image</span>
            </div>
          )}
          
          {/* Category badge for mobile */}
          <div className="absolute bottom-2 left-2 sm:hidden">
            <span className="bg-white bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium text-gray-800 shadow-sm">
              {he.decode(cat.name)}
            </span>
          </div>
        </div>

        {/* Category Name - Hidden on mobile, shown on larger screens */}
        <div className="hidden sm:block">
          <h3 className="font-[DM_Sans] text-sm md:text-base lg:text-md font-semibold text-gray-800 line-clamp-2 leading-tight">
            {he.decode(cat.name)}
          </h3>
        </div>
      </a>
    </div>
  );

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-2 sm:mb-4">
          <h2 className="font-[DM_Sans] text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900">
            Most Shopped
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-4">
          {loading
            ? Array.from({ length: 12 }, (_, i) => (
                <div key={i}>
                  {renderSkeleton()}
                </div>
              ))
            : categories.map(renderCategory) 
          }
        </div>
      </div>
    </section>
  );
}
