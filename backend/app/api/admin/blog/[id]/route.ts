import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog/[id] - Get a single blog post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                asset: true,
                categories: true,
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/blog/[id] - Update a blog post
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;
        const {
            title,
            content,
            excerpt,
            published,
            publishedAt,
            featuredImage,
            categories,
        } = body;

        // Check if blog exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id },
            include: {
                asset: true,
            },
        });

        if (!existingBlog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Generate new slug if title changed
        let slug = existingBlog.slug;
        if (title && title !== existingBlog.title) {
            slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Check if new slug already exists
            const slugExists = await prisma.blog.findFirst({
                where: {
                    slug,
                    id: { not: id },
                },
            });

            if (slugExists) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Handle featured image
        let assetId = existingBlog.assetId;
        if (featuredImage && featuredImage !== existingBlog.asset?.source) {
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

        // Update blog post
        const blog = await prisma.blog.update({
            where: { id },
            data: {
                title: title || existingBlog.title,
                slug,
                content: content || existingBlog.content,
                excerpt: excerpt !== undefined ? excerpt : existingBlog.excerpt,
                published: published !== undefined ? published : existingBlog.published,
                publishedAt:
                    publishedAt !== undefined
                        ? publishedAt
                            ? new Date(publishedAt)
                            : null
                        : existingBlog.publishedAt,
                assetId,
            },
        });

        // Update categories if provided
        if (categories && Array.isArray(categories)) {
            // Delete existing categories
            await prisma.blogCategory.deleteMany({
                where: { blogId: id },
            });

            // Create new categories
            if (categories.length > 0) {
                await prisma.blogCategory.createMany({
                    data: categories.map((name: string) => ({
                        blogId: id,
                        name,
                    })),
                });
            }
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error updating blog post:', error);
        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/blog/[id] - Delete a blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Check if blog exists
        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Delete blog post (categories will be deleted via cascade)
        await prisma.blog.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        );
    }
}
