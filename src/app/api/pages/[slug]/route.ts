import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?slug=${slug}`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: response.status });
    }

    const pages = await response.json();

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = pages[0];
    return NextResponse.json({
      id: page.id,
      title: page.title.rendered,
      content: page.content.rendered,
      slug: page.slug,
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
