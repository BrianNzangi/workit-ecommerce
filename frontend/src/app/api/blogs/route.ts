import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';
import { getImageUrl } from '@/lib/image-utils';
import { Blog } from '@/types/blog';

interface BackendBlog {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  asset?: {
    source?: string;
    preview?: string;
  } | null;
}

function mapBackendBlogToFrontend(blog: BackendBlog): Blog {
  const imagePath = blog.asset?.preview || blog.asset?.source || '/placeholder-blog.jpg';
  const date = blog.publishedAt || blog.createdAt || new Date().toISOString();
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    link: `/blog/${blog.slug}`,
    category: 'Workit Blog',
    categories: ['Workit Blog'],
    image: getImageUrl(imagePath),
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    date,
  };
}

export async function GET() {
  try {
    const response = await proxyFetch('/marketing/blog?limit=50&offset=0', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();
    const blogs = Array.isArray(data) ? data : (data.blogs || []);
    const transformed = blogs.map(mapBackendBlogToFrontend);
    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json([], { status: 200 });
  }
}
