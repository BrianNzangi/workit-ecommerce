import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from '@/lib/meta/meta';

export const metadata: Metadata = {
  title: `Blog | ${SITE_CONFIG.name}`,
  description: "Stay updated with the latest tech news, product reviews, and insights from Workit. Discover tips, trends, and innovations in electronics.",
  openGraph: {
    ...DEFAULT_OG,
    title: `Blog | ${SITE_CONFIG.name}`,
    description: "Stay updated with the latest tech news, product reviews, and insights from Workit. Discover tips, trends, and innovations in electronics.",
    url: `${SITE_CONFIG.url}/blog`,
  },
  twitter: DEFAULT_TWITTER,
};

export default function BlogPage() {
  return <BlogPageClient />;
}
