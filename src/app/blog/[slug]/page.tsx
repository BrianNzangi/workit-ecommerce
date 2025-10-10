import type { Metadata } from 'next';
import BlogPostClient from '././BlogPostClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  // For now, return default metadata
  // In a real app, fetch the blog post and use its data
  return {
    title: "Blog Post - Workit",
    description: "Read the latest blog post on Workit.",
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
