'use client';

import { useMemo } from 'react';
import { useBlogs } from '@/hooks/useBlogs';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/utils/sanitize';

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const { data: blogs = [], isLoading: loading, error: fetchError } = useBlogs();

  const blog = useMemo(() => blogs.find(b => b.slug === slug) || null, [blogs, slug]);
  const error = useMemo(() => {
    if (fetchError) return 'Failed to load blog post';
    if (!loading && !blog) return 'Blog post not found';
    return null;
  }, [fetchError, loading, blog]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
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
      <div className="bg-white min-h-screen">
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
    <div className="bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-6 font-sans">
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
                  <div className="relative aspect-video w-full overflow-hidden rounded-xs">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content || '') }}
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
