'use client';

import { Blog } from '@/types/blog';
import BlogCard from './BlogCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface FeaturedBlogsProps {
    blogs: Blog[];
}

export default function FeaturedBlogs({ blogs }: FeaturedBlogsProps) {
    if (blogs.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto py-4 px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 font-sans">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-sans text-xl font-semibold">Tech that helps the world</h2>
            </div>

            <div className="overflow-hidden py-4">
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
                        <SwiperSlide key={blog.id} className="w-auto! h-auto">
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
