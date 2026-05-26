"use client";

import React, { useEffect, useState } from "react";
import he from "he";
import { ChevronDown } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface FAQCategory {
  category: string;
  faqs: { id: string; question: string; answer: string }[];
}

const HelpFAQ = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/fetch-pages/help-center');
        if (!response.ok) throw new Error('Failed to fetch help center data');

        const data = await response.json();
        const articles = data.articles || [];

        const groupedMap: Record<string, FAQCategory> = {};
        articles.forEach((article: Article) => {
          if (!groupedMap[article.category]) {
            groupedMap[article.category] = { category: article.category, faqs: [] };
          }
          groupedMap[article.category].faqs.push({
            id: article.id,
            question: article.title,
            answer: article.content
          });
        });

        setCategories(Object.values(groupedMap));
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white font-sans">
        <div className="container mx-auto px-8">
          <div className="animate-pulse space-y-12">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-8 bg-gray-100 rounded w-48 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-14 bg-gray-50 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white font-sans min-h-100">
      <div className="container mx-auto px-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{category.category}</h2>
              <div className="space-y-3">
                {category.faqs.map((faq) => {
                  const isOpen = expanded.has(faq.id);
                  return (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">{he.decode(faq.question)}</span>
                        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[2000px]" : "max-h-0"}`}>
                        <div
                          className="px-6 pb-4 text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: he.decode(faq.answer) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400">
            <p>No help articles found. Please check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HelpFAQ;
