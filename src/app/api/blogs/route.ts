// src/app/api/blogs/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { Blog } from '@/types/blog';

const WORDPRESS_API =
  process.env.WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';

export async function GET() {
  try {
    // Fetch latest 10 posts with necessary fields
    const res = await axios.get(
      `${WORDPRESS_API}/posts?_fields=id,title,slug,link,featured_media,categories,date,content&per_page=10&_embed`
    );
    const posts = res.data;

    if (!Array.isArray(posts)) return NextResponse.json([], { status: 200 });

    // Fetch featured images and category names
    const blogs: Blog[] = await Promise.all(
      posts.map(async (p: any) => {
        // Get featured image
        const image = p._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                      (p.featured_media
                        ? await axios.get(`${WORDPRESS_API}/media/${p.featured_media}`)
                            .then(r => r.data.source_url)
                            .catch(() => '/placeholder.png')
                        : '/placeholder.png');

        // Get category names
        const categories: string[] = p.categories?.length
          ? await Promise.all(
              p.categories.map((catId: number) =>
                axios.get(`${WORDPRESS_API}/categories/${catId}`)
                  .then(r => r.data.name)
                  .catch(() => 'Uncategorized')
              )
            )
          : ['Uncategorized'];

        return {
          id: p.id,
          title: p.title.rendered || 'Untitled',
          slug: p.slug || '',
          link: p.link || '',
          category: categories[0],   // main category (first)
          categories,                // all categories
          image,
          content: p.content?.rendered || '',
          date: p.date,              // ISO string for sorting
        };
      })
    );

    // Optional: sort by date descending
    blogs.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

    return NextResponse.json(blogs, { status: 200 });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
