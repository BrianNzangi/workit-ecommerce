'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import he from 'he';

interface PageData {
  id: number;
  title: string;
  content: string;
  slug: string;
}

interface PolicyPageProps {
  slug: string;
}

const policyPages = [
  { slug: 'warranty-refunds', title: 'Warranty & Refunds' },
  { slug: 'shipping-policy', title: 'Shipping Policy' },
  { slug: 'terms-of-service', title: 'Terms Of Service' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
];

export default function PolicyPage({ slug }: PolicyPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch page');
        }
        const data = await response.json();
        setPageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 font-['DM_Sans']">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="animate-pulse space-y-2">
              {policyPages.map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 font-['DM_Sans']">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {policyPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 max-w-4xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 font-['DM_Sans']">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {policyPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 max-w-4xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-600 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The requested page could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-['DM_Sans']">
      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-2 border border-gray-100 shadow-xs">
            {policyPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className={`block px-4 py-2 text-sm transition-colors ${
                  page.slug === slug
                    ? 'bg-[#1F2323]/90 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-1 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">{he.decode(pageData.title)}</h1>
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-li:leading-relaxed prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{ __html: he.decode(pageData.content) }}
          />
        </div>
      </div>
    </div>
  );
}
