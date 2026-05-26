"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import he from "he";
import { ChevronRight, FileText } from "lucide-react";
import SectionContainer from "@/components/layout/SectionContainer";

interface Article {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
}

interface FAQCategory {
  category: string;
  articles: Article[];
}

const HelpFAQ = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/fetch-pages/help-center');
        if (!response.ok) throw new Error('Failed to fetch help center data');

        const data = await response.json();
        const articles: Article[] = data.articles || [];

        const groupedMap: Record<string, FAQCategory> = {};
        articles.forEach((article) => {
          if (!groupedMap[article.category]) {
            groupedMap[article.category] = { category: article.category, articles: [] };
          }
          groupedMap[article.category].articles.push(article);
        });

        const groups = Object.values(groupedMap);
        setCategories(groups);
        if (groups.length > 0) setSelectedCategory(groups[0].category);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const currentCategory = categories.find((c) => c.category === selectedCategory);

  if (loading) {
    return (
      <section className="py-16 bg-white font-sans">
        <SectionContainer className="px-8">
          <div className="flex gap-8">
            <div className="w-64 shrink-0 animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
            <div className="flex-1 animate-pulse space-y-4">
              <div className="h-8 bg-gray-100 rounded w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-50 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-white font-sans">
        <SectionContainer className="px-8 text-center text-gray-400 py-20">
          <p>No help articles found. Please check back later.</p>
        </SectionContainer>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white font-sans">
      <SectionContainer className="px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar: categories */}
          <aside className="lg:w-64 shrink-0">
            <nav className="lg:sticky lg:top-24 space-y-1">
              {categories.map((cat) => {
                const isActive = cat.category === selectedCategory;
                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary-900 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{cat.category}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cat.articles.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right main: article cards */}
          <div className="flex-1 min-w-0">
            {currentCategory && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentCategory.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCategory.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/help-center/${article.id}`}
                      className="group block p-5 rounded-xl border border-gray-200 bg-white hover:border-primary-900 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary-900 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary-900 transition-colors break-words">
                            {he.decode(article.title)}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Updated {new Date(article.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-900 mt-1 shrink-0 ml-auto transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};

export default HelpFAQ;
