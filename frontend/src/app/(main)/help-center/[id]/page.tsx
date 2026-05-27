"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import he from "he";
import { ArrowLeft, Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
}

const ArticlePage = () => {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch('/fetch-pages/help-center');
        if (!response.ok) throw new Error('Failed to fetch help center data');

        const data = await response.json();
        const articles: Article[] = data.articles || [];
        const found = articles.find((a) => a.id === params.id);

        if (found) {
          setArticle(found);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-8 py-16 animate-pulse max-w-3xl">
          <div className="h-4 bg-gray-100 rounded w-32 mb-8" />
          <div className="h-10 bg-gray-100 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-50 rounded w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-8 py-16 max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been removed.</p>
          <Link
            href="/help-center"
            className="inline-flex items-center gap-2 text-primary-900 font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Help Center
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-16 max-w-3xl">
        <Link
          href="/help-center"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <div className="mb-2">
          <span className="inline-block text-xs font-medium text-primary-900 bg-primary-50 px-3 py-1 rounded-full">
            {article.category}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">{he.decode(article.title)}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Clock className="h-4 w-4" />
          <span>Last updated {new Date(article.lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>

        <div
          className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-ol:text-gray-600 prose-li:leading-relaxed prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: he.decode(article.content) }}
        />
      </div>
    </main>
  );
};

export default ArticlePage;
