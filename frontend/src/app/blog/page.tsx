import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: "Blog - Workit",
  description: "Stay updated with the latest tech news, product reviews, and insights from Workit. Discover tips, trends, and innovations in electronics.",
  openGraph: {
    title: "Blog - Workit",
    description: "Stay updated with the latest tech news, product reviews, and insights from Workit. Discover tips, trends, and innovations in electronics.",
    url: "https://www.workit.co.ke/blog",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Blog - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Workit",
    description: "Stay updated with the latest tech news, product reviews, and insights from Workit. Discover tips, trends, and innovations in electronics.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
