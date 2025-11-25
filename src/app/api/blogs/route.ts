// src/app/api/blogs/route.ts
import { NextResponse } from 'next/server';
import { Blog } from '@/types/blog';

// Placeholder blog data until WordPress integration is set up
const PLACEHOLDER_BLOGS: Blog[] = [
  {
    id: 1,
    title: 'Top 10 Smartphones of 2024',
    slug: 'top-10-smartphones-2024',
    link: '/blog/top-10-smartphones-2024',
    category: 'Technology',
    categories: ['Technology', 'Smartphones'],
    image: '/placeholder-blog.jpg',
    content: '<p>Discover the best smartphones of 2024...</p>',
    date: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'How to Choose the Perfect Laptop',
    slug: 'how-to-choose-perfect-laptop',
    link: '/blog/how-to-choose-perfect-laptop',
    category: 'Guides',
    categories: ['Guides', 'Laptops'],
    image: '/placeholder-blog.jpg',
    content: '<p>A comprehensive guide to choosing your next laptop...</p>',
    date: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Smart Home Devices You Need',
    slug: 'smart-home-devices-you-need',
    link: '/blog/smart-home-devices-you-need',
    category: 'Smart Home',
    categories: ['Smart Home', 'Technology'],
    image: '/placeholder-blog.jpg',
    content: '<p>Transform your home with these smart devices...</p>',
    date: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // Return placeholder blogs
    // TODO: Replace with actual WordPress API integration when ready
    return NextResponse.json(PLACEHOLDER_BLOGS, { status: 200 });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}
