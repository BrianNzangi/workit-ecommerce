import { NextRequest, NextResponse } from 'next/server';

/**
 * Policy Pages Fetch Handler
 * 
 * Fetches policy data from the backend settings API.
 * This route is named 'fetch-pages' to avoid conflicts with the /api proxy in next.config.ts.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        // Fetch all settings from the backend
        const response = await fetch(`${backendUrl}/site/settings`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: response.status });
        }

        const settings = await response.json();

        // Map the incoming slug to the database setting key
        let dbKey = slug.replace(/-/g, '_');

        // Explicit mapping for renamed policies
        if (slug === 'returns-refunds-policy') dbKey = 'warranty_refunds';
        if (slug === 'advertising-policy') dbKey = 'returns_claims';
        if (slug === 'return-policy') dbKey = 'returns_claims'; // Keep for safety

        const settingKey = `page_${dbKey}`;
        const pageData = settings[settingKey];

        if (!pageData) {
            return NextResponse.json({
                error: `Page not found`,
                details: `Searched for key ${settingKey} using slug ${slug}`
            }, { status: 404 });
        }

        // Helper to capitalize first letters
        const toTitleCase = (str: string) =>
            str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Handle both object-style and legacy string-style page data
        const rawTitle = typeof pageData === 'object' ? pageData.title : slug;
        const title = toTitleCase(rawTitle || slug);
        const content = typeof pageData === 'object' ? pageData.content : pageData;
        const articles = typeof pageData === 'object' ? pageData.articles : null;

        return NextResponse.json({
            id: slug,
            title: title,
            content: content,
            articles: articles,
            slug: slug,
        });
    } catch (error) {
        console.error('Error in fetch-pages route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
