'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/types/blog';
import BlogCard from '@/components/blog/BlogCard';

export default function BlogPageClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then((data: Blog[]) => {
        setBlogs(data);
      })
      .catch(err => console.error('Failed to fetch blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Function to render a horizontal banner
  const renderBanner = (index: number) => (
    <div key={`banner-${index}`} className="col-span-full my-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Stay Updated with Tech News</h3>
        <p className="text-lg">Discover the latest trends, reviews, and insights in electronics</p>
      </div>
    </div>
  );

  // Function to render blogs in grid with banners after every 2 rows
  const renderBlogsWithBanners = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-[240px] bg-gray-200 rounded-3xl mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (blogs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blog posts found.</p>
        </div>
      );
    }

    const elements: React.JSX.Element[] = [];
    const blogsPerRow = 3; // 3 columns on large screens
    const rowsPerBanner = 2; // Banner after every 2 rows
    const blogsPerBanner = blogsPerRow * rowsPerBanner; // 6 blogs per banner

    for (let i = 0; i < blogs.length; i += blogsPerBanner) {
      // Add blogs for this section (up to blogsPerBanner)
      const blogsInSection = blogs.slice(i, i + blogsPerBanner);

      // Add blogs in grid layout
      elements.push(
        <div key={`blogs-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogsInSection.map(blog => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              slug={blog.slug}
              link={blog.link}
              category={blog.category}
              image={blog.image}
            />
          ))}
        </div>
      );

      // Add banner after every blogsPerBanner blogs (except at the end)
      if (i + blogsPerBanner < blogs.length) {
        elements.push(renderBanner(i / blogsPerBanner + 1));
      }
    }

    return elements;
  };

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-6 font-[DM_SANS]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600 text-lg">
          Stay updated with the latest tech news, product reviews, and insights from Workit.
        </p>
      </div>

      {renderBlogsWithBanners()}
    </section>
  );
}
