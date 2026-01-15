'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Blog } from '@/types/blog';

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then((blogs: Blog[]) => {
        const foundBlog = blogs.find(b => b.slug === slug);
        if (foundBlog) {
          setBlog(foundBlog);
        } else {
          setError('Blog post not found');
        }
      })
      .catch(err => {
        console.error('Failed to fetch blog:', err);
        setError('Failed to load blog post');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#E8EAED] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-xs w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-xs mb-8"></div>
            <div className="h-4 bg-gray-300 rounded-xs w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded-xs w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-[#E8EAED] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Blog post not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E8EAED] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-6 font-[DM_SANS]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Column */}
          <div className="flex-1">
            <article className="bg-white rounded-xs p-8 shadow-xs">
              <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xs">
                    {blog.category}
                  </span>
                  {blog.date && (
                    <time dateTime={blog.date}>
                      {new Date(blog.date).toLocaleDateString()}
                    </time>
                  )}
                </div>
              </header>

              {blog.image && (
                <div className="mb-8">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-xs"
                  />
                </div>
              )}

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content || '' }}
              />
            </article>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-80">
            <div className="sticky top-6 space-y-6">
              {/* Ad 1 */}
              <div className="rounded-xs">
                <div dangerouslySetInnerHTML={{
                  __html: 
                  `<!-- START ADVERTISER: Awin (USD) from awin.com -->
                  <a rel="sponsored" href="https://www.awin1.com/cread.php?s=1012722&v=4032&q=316348&r=2523901" target="_blank">
                      <img src="https://www.awin1.com/cshow.php?s=1012722&v=4032&q=316348&r=2523901" border="0">
                  </a>
                  <!-- END ADVERTISER: Awin (USD) from awin.com -->`
                }} />
              </div>

              {/* Ad 2 */}
              <div className="rounded-xs">
                <div dangerouslySetInnerHTML={{
                  __html: 
                  `<!-- START ADVERTISER: Awin (USD) from awin.com -->
                  <a rel="sponsored" href="https://www.awin1.com/cread.php?s=1012722&v=4032&q=316348&r=2523901" target="_blank">
                      <img src="https://www.awin1.com/cshow.php?s=1012722&v=4032&q=316348&r=2523901" border="0">
                  </a>
                  <!-- END ADVERTISER: Awin (USD) from awin.com -->`
                }} />
              </div>

              {/* Ad 3 */}
              <div className="rounded-xs">
                <div dangerouslySetInnerHTML={{
                  __html: 
                  `<!-- START ADVERTISER: Awin (USD) from awin.com -->
                  <a rel="sponsored" href="https://www.awin1.com/cread.php?s=538233&v=4032&q=261331&r=2523901" target="_blank">
                      <img src="https://www.awin1.com/cshow.php?s=538233&v=4032&q=261331&r=2523901" border="0">
                  </a>
                  <!-- END ADVERTISER: Awin (USD) from awin.com -->`
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
