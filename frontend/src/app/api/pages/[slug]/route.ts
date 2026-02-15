import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/site/settings`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: response.status });
    }

    const settings = await response.json();
    const settingKey = `page_${slug.replace(/-/g, '_')}`;
    const pageData = settings[settingKey];

    if (!pageData) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Handle both object-style and legacy string-style page data
    const title = typeof pageData === 'object' ? pageData.title : slug.replace(/-/g, ' ');
    const content = typeof pageData === 'object' ? pageData.content : pageData;
    const articles = typeof pageData === 'object' ? pageData.articles : null;

    return NextResponse.json({
      id: slug, // Using slug as ID since we don't have a numeric one in settings map
      title: title || slug.replace(/-/g, ' '),
      content: content,
      articles: articles,
      slug: slug,
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
