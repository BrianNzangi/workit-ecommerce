import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

import { SITE_CONFIG } from '@/lib/meta';
import { proxyFetch } from '@/lib/proxy-utils';
import { getImageUrl } from '@/lib/image-utils';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await proxyFetch(`/marketing/blog/${slug}`, {
      cache: 'force-cache',
    });

    if (!response.ok) return { title: 'Blog Post Not Found' };

    const post = await response.json();
    const title = `${post.title} | ${SITE_CONFIG.name}`;
    const description = post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '');
    const imageUrl = post.featuredImage || SITE_CONFIG.logo;
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.url}${getImageUrl(imageUrl)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_CONFIG.url}/blog/${slug}`,
        type: 'article',
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteImageUrl],
      },
    };
  } catch (error) {
    return { title: `Blog | ${SITE_CONFIG.name}` };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
