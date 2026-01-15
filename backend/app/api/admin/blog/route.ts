import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog - List all blog posts
export async function GET(request: NextRequest) {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                asset: true,
                categories: true,
            },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        );
    }
}

// POST /api/admin/blog - Create a new blog post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            content,
            excerpt,
            published,
            publishedAt,
            featuredImage,
            categories,
        } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        const existingBlog = await prisma.blog.findUnique({
            where: { slug },
        });

        if (existingBlog) {
            return NextResponse.json(
                { error: 'A blog post with this title already exists' },
                { status: 400 }
            );
        }

        // Handle featured image upload if provided
        let assetId = null;
        if (featuredImage) {
            // If featuredImage is a URL, create an asset record
            const asset = await prisma.asset.create({
                data: {
                    name: `blog-${slug}`,
                    type: 'IMAGE',
                    mimeType: 'image/jpeg',
                    fileSize: 0,
                    source: featuredImage,
                    preview: featuredImage,
                },
            });
            assetId = asset.id;
        }

        // Create blog post
        const blog = await prisma.blog.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                published: published || false,
                publishedAt: publishedAt ? new Date(publishedAt) : null,
                assetId,
            },
        });

        // Create categories if provided
        if (categories && Array.isArray(categories) && categories.length > 0) {
            await prisma.blogCategory.createMany({
                data: categories.map((name: string) => ({
                    blogId: blog.id,
                    name,
                })),
            });
        }

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        );
    }
}
