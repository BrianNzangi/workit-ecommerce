"use client";

import React, { useEffect, useState } from "react";
import he from "he";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface FAQCategory {
  category: string;
  faqs: { question: string; answer: string }[];
}

const HelpFAQ = () => {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/fetch-pages/help-center');
        if (!response.ok) throw new Error('Failed to fetch help center data');

        const data = await response.json();
        const articles = data.articles || [];

        // Group articles by category
        const groupedMap: Record<string, FAQCategory> = {};
        articles.forEach((article: Article) => {
          if (!groupedMap[article.category]) {
            groupedMap[article.category] = { category: article.category, faqs: [] };
          }
          groupedMap[article.category].faqs.push({
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

  if (loading) {
    return (
      <section className="pt-20 pb-8 bg-accent-800 font-sans">
        <div className="container mx-auto px-8">
          <div className="animate-pulse space-y-12">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(j => (
                    <div key={j} className="h-32 bg-white border border-secondary-300 rounded-xs"></div>
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
    <section className="pt-20 pb-8 bg-accent-800 font-sans min-h-100">
      <div className="container mx-auto px-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.faqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-secondary-300 rounded-xs p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-2 wrap-break-word">{he.decode(faq.question)}</h3>
                    <div
                      className="text-secondary-700 text-md prose prose-sm max-w-none wrap-break-word overflow-wrap-anywhere"
                      dangerouslySetInnerHTML={{ __html: he.decode(faq.answer) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-500">
            <p>No help articles found. Please check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HelpFAQ;
