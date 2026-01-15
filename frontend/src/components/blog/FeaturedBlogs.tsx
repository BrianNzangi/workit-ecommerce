'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/types/blog';
import BlogCard from './BlogCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

export default function FeaturedBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);
  const controls = useAnimation();

  const CARD_WIDTH = 300;
  const VISIBLE_CARDS = 5;

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then((data: Blog[]) => {
        console.log('Fetched blogs:', data);

        // Filter featured blogs using the categories array
        const featured = data
          .filter(b => {
            if (!b.categories || !b.categories.length) return false;
            return b.categories.some(cat =>
              cat.replace(/[\s-_]/g, '').toLowerCase().includes('featured')
            );
          })
          .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()); // newest first

        console.log('Featured blogs (newest first):', featured);
        setBlogs(featured);
      })
      .catch(err => console.error('Failed to fetch blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  const scroll = async (direction: 'left' | 'right') => {
    const maxIndex = Math.max(0, blogs.length - VISIBLE_CARDS);
    const newIndex =
      direction === 'left'
        ? Math.max(scrollIndex - 1, 0)
        : Math.min(scrollIndex + 1, maxIndex);

    setScrollIndex(newIndex);
    await controls.start({
      x: -newIndex * CARD_WIDTH,
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  };

  const renderSkeleton = () =>
    Array.from({ length: VISIBLE_CARDS }).map((_, i) => (
      <div key={i} className="min-w-[300px] flex flex-col gap-2">
        <div className="w-full h-[180px] bg-gray-200 animate-pulse rounded-md" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2" />
      </div>
    ));

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-0 font-[DM_Sans]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Tech that helps the world</h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={scrollIndex === 0}
            className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={scrollIndex >= blogs.length - VISIBLE_CARDS}
            className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden py-4">
        <motion.div animate={controls} className="flex gap-1" initial={{ x: 0 }}>
          {loading
            ? renderSkeleton()
            : blogs.length > 0
            ? blogs.map(blog => (
                <div key={blog.id} className="min-w-[300px]">
                  <BlogCard
                    id={blog.id}
                    title={blog.title}
                    slug={blog.slug}
                    link={blog.link}
                    category={blog.category}
                    image={blog.image}
                  />
                </div>
              ))
            : (
                <p className="text-gray-500">No featured blogs found.</p>
              )}
        </motion.div>
      </div>
    </section>
  );
}