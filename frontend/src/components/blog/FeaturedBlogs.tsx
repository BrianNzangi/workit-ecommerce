import { Blog } from '@/types/blog';
import BlogCard from './BlogCard';
import SectionContainer from '@/components/layout/SectionContainer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedBlogsProps {
    blogs: Blog[];
}

export default function FeaturedBlogs({ blogs }: FeaturedBlogsProps) {
    if (blogs.length === 0) {
        return null;
    }

    return (
        <section className="py-6 md:py-8">
            <SectionContainer className="px-10 sm:px-12 lg:px-16 mb-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                        From Our Blog
                    </h2>
                    <Link
                        href="/blog"
                        className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:text-primary-800 transition-colors"
                    >
                        View All
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {blogs.map((blog) => (
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

                <div className="mt-6 text-center sm:hidden">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:text-primary-800 transition-colors"
                    >
                        View All Blog Posts
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </SectionContainer>
        </section>
    );
}
