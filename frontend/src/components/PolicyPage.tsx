'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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

const aboutPages = [
  { slug: 'about-workit', title: 'About Workit' },
  { slug: 'blog', title: 'Our Blog' },
  { slug: 'reviews', title: 'Customer Reviews' },
  { slug: 'careers', title: 'We Are Hiring!' },
];

const helpPages = [
  { slug: 'track-order', title: 'Track My Order' },
  { slug: 'help-center', title: 'Help Center' },
  { slug: 'returns-claims', title: 'Returns & Claims' },
  { slug: 'contact-us', title: 'Contact Us' },
  { slug: 'sell-on-workit', title: 'Sell on Workit' },
];

export default function PolicyPage({ slug }: PolicyPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsDropdownOpen, setTermsDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);

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
      <div style={{ backgroundColor: '#F8F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <div className="animate-pulse space-y-2">
                {policyPages.map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded-xs"></div>
                ))}
              </div>
            </div>
            <div className="flex-1 max-w-4xl bg-white p-6 rounded-xs shadow-xs">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded-xs w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-xs w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-xs w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#F8F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* TERMS Dropdown */}
                <div>
                  <button
                    onClick={() => setTermsDropdownOpen(!termsDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="font-semibold text-gray-900">TERMS</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${termsDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {termsDropdownOpen && (
                    <div className="border-b border-gray-100">
                      {policyPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setTermsDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* ABOUT Dropdown */}
                <div>
                  <button
                    onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="font-semibold text-gray-900">ABOUT</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {aboutDropdownOpen && (
                    <div className="border-b border-gray-100">
                      {aboutPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setAboutDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* HELP Dropdown */}
                <div>
                  <button
                    onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-900">HELP</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${helpDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {helpDropdownOpen && (
                    <div>
                      {helpPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setHelpDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-4xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div style={{ backgroundColor: '#F8F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
          <div className="flex gap-8">
            <div className="w-64 shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* TERMS Dropdown */}
                <div>
                  <button
                    onClick={() => setTermsDropdownOpen(!termsDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="font-semibold text-gray-900">TERMS</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${termsDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {termsDropdownOpen && (
                    <div className="border-b border-gray-100">
                      {policyPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setTermsDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* ABOUT Dropdown */}
                <div>
                  <button
                    onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                  >
                    <span className="font-semibold text-gray-900">ABOUT</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {aboutDropdownOpen && (
                    <div className="border-b border-gray-100">
                      {aboutPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setAboutDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* HELP Dropdown */}
                <div>
                  <button
                    onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-gray-900">HELP</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${helpDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {helpDropdownOpen && (
                    <div>
                      {helpPages.map((page) => (
                        <Link
                          key={page.slug}
                          href={`/${page.slug}`}
                          onClick={() => setHelpDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-4xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-600 mb-4">Page Not Found</h1>
                <p className="text-gray-600">The requested page could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8F9FC', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
        <div className="flex gap-8">
          <div className="w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xs shadow-xs overflow-hidden">
              {/* TERMS Dropdown */}
              <div>
                <button
                  onClick={() => setTermsDropdownOpen(!termsDropdownOpen)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323]/20 focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                >
                  <span className="font-semibold text-[#1F2323]">TERMS</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${termsDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {termsDropdownOpen && (
                  <div className="border-b border-gray-100">
                    {policyPages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/${page.slug}`}
                        onClick={() => setTermsDropdownOpen(false)}
                        className={`block px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${page.slug === slug
                          ? 'bg-[#1F2323]/90 text-white font-medium'
                          : 'text-gray-600'
                          }`}
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* ABOUT Dropdown */}
              <div>
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100"
                >
                  <span className="font-semibold text-gray-900">ABOUT</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {aboutDropdownOpen && (
                  <div className="border-b border-gray-100">
                    {aboutPages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/${page.slug}`}
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* HELP Dropdown */}
              <div>
                <button
                  onClick={() => setHelpDropdownOpen(!helpDropdownOpen)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1F2323] focus:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-900">HELP</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${helpDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {helpDropdownOpen && (
                  <div>
                    {helpPages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/${page.slug}`}
                        onClick={() => setHelpDropdownOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-4xl bg-white p-8 rounded-xs shadow-xs">
            <h1 className="text-3xl font-bold mb-6">{he.decode(pageData.title)}</h1>
            <div
              className="text-gray-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
              dangerouslySetInnerHTML={{ __html: he.decode(pageData.content) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
