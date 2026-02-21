'use client';

import { useEffect, useState } from 'react';
import { Blog } from '@/types/blog';
import BlogCard from './BlogCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function FeaturedBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data: Blog[]) => {
        const sorted = [...(Array.isArray(data) ? data : [])]
          .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

        const featured = sorted.filter((b) =>
          (b.categories || []).some((cat) =>
            cat.replace(/[\s-_]/g, '').toLowerCase().includes('featured')
          )
        );

        setBlogs((featured.length > 0 ? featured : sorted).slice(0, 15));
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const renderSkeleton = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="w-70 flex flex-col gap-2">
        <div className="w-full h-45 bg-gray-200 animate-pulse rounded-md" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2" />
      </div>
    ));

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-0 font-sans">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-sans text-xl font-semibold">Tech that helps the world</h2>
      </div>

      <div className="overflow-hidden py-4">
        {loading ? (
          <div className="flex gap-3">
            {renderSkeleton()}
          </div>
        ) : blogs.length > 0 ? (
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView="auto"
            spaceBetween={12}
            autoplay={
              blogs.length > 2
                ? {
                  delay: 2600,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  reverseDirection: false,
                }
                : false
            }
            speed={700}
            loop={blogs.length > 5}
            navigation={blogs.length > 5}
            allowTouchMove
            grabCursor
            className="featured-blogs-swiper"
          >
            {blogs.map((blog) => (
              <SwiperSlide key={blog.id} className="!w-auto h-auto">
                <BlogCard
                  id={blog.id}
                  title={blog.title}
                  slug={blog.slug}
                  link={blog.link}
                  category={blog.category}
                  image={blog.image}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="font-sans text-gray-500">No featured blogs found.</p>
        )}
      </div>

      <style jsx global>{`
        .featured-blogs-swiper .swiper-button-next,
        .featured-blogs-swiper .swiper-button-prev {
          color: #111827;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.45);
        }
        .featured-blogs-swiper .swiper-button-next:after,
        .featured-blogs-swiper .swiper-button-prev:after {
          font-size: 12px;
          font-weight: 700;
        }
        @media (max-width: 767px) {
          .featured-blogs-swiper .swiper-button-next,
          .featured-blogs-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
