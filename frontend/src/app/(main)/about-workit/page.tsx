import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import SectionContainer from '@/components/layout/SectionContainer';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { SITE_CONFIG } from '@/lib/meta/meta';

export const metadata: Metadata = {
  title: "About Workit - Trusted Electronics Store",
  description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
  openGraph: {
    title: "About Workit - Trusted Electronics Store",
    description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
    url: "https://www.workit.co.ke/about-workit",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "About Workit - Trusted Electronics Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Workit - Trusted Electronics Store",
    description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
  },
};

const toTitleCase = (str: string) =>
  str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

async function getPageData(slug: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${backendUrl}/site/settings`, { cache: 'no-store' });

  if (!response.ok) return null;

  const settings = await response.json();
  const settingKey = `page_about_workit`;
  const pageData = settings[settingKey];

  if (!pageData) return null;

  const rawTitle = typeof pageData === 'object' ? pageData.title : slug;
  const title = toTitleCase(rawTitle || slug);
  const content = typeof pageData === 'object' ? pageData.content : pageData;

  return { id: slug, title, content, slug };
}

export default async function AboutWorkitPage() {
  const pageData = await getPageData('about-workit');

  return (
    <main className="bg-white min-h-screen">
      <SectionContainer className="mb-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-900 transition inline-flex items-center gap-1.5">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-secondary-900 font-medium">About Workit</span>
        </nav>

        {/* Content */}
        <div>
          {pageData ? (
            <>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary-900 mb-4 border-l-4 border-primary-900 pl-4">
                {pageData.title}
              </h1>
              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-700 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-secondary-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-secondary-900 [&>p]:leading-relaxed [&>p]:mb-5 [&>ul]:mb-6 [&>ol]:mb-6 [&>li]:mb-2 [&_a]:text-primary-900 [&_a]:underline [&_a:hover]:text-[#e04500] [&_img]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(pageData.content) }}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
              <p className="text-gray-500 mb-6">The page you&apos;re looking for could not be loaded.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-800 transition"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </SectionContainer>
    </main>
  );
}
