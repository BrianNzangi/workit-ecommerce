import type { Metadata } from 'next';
import BlogPostClient from '././BlogPostClient';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  // For now, return default metadata
  // In a real app, fetch the blog post and use its data
  return {
    title: "Blog Post - Workit",
    description: "Read the latest blog post on Workit.",
  };
}

export default function BlogPostPage({ params }: PageProps) {
  return <BlogPostClient slug={params.slug} />;
}
