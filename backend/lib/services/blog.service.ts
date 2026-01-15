import { PrismaClient, Blog, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateBlogInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string | null;
  assetId?: string | null;
  categories?: string[];
}

export interface UpdateBlogInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  assetId?: string | null;
  categories?: string[];
}

export interface BlogListOptions {
  take?: number;
  skip?: number;
  published?: boolean;
}

export class BlogService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate a URL-safe slug from a string
   */
  private generateSlug(text: string): string {
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // If slug is empty after sanitization, generate a random slug
    if (!slug || slug.length === 0) {
      return `blog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    return slug;
  }

  /**
   * Ensure slug is unique by appending a number if necessary
   */
  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blog.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new blog post
   */
  async createBlog(input: CreateBlogInput): Promise<Blog> {
    // Validate required fields
    if (!input.title || input.title.trim().length === 0) {
      throw validationError('Blog title is required', 'title');
    }

    if (!input.content || input.content.trim().length === 0) {
      throw validationError('Blog content is required', 'content');
    }

    // Verify asset exists if provided
    if (input.assetId) {
      const asset = await this.prisma.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw notFoundError('Asset not found');
      }
    }

    // Generate slug if not provided
    let slug = input.slug || this.generateSlug(input.title);

    // Ensure slug is URL-safe
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      slug = this.generateSlug(slug);
    }

    // Ensure slug is unique
    slug = await this.ensureUniqueSlug(slug);

    try {
      const blog = await this.prisma.blog.create({
        data: {
          title: input.title.trim(),
          slug,
          content: input.content.trim(),
          excerpt: input.excerpt?.trim() || null,
          assetId: input.assetId || null,
          published: false,
          publishedAt: null,
          categories: input.categories && input.categories.length > 0 ? {
            create: input.categories.map(name => ({
              name: name.trim(),
            })),
          } : undefined,
        },
        include: {
          categories: true,
          asset: true,
        },
      });

      return blog;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A blog post with this slug already exists', 'slug');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing blog post
   */
  async updateBlog(id: string, input: UpdateBlogInput): Promise<Blog> {
    // Check if blog exists
    const existingBlog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!existingBlog) {
      throw notFoundError('Blog post not found');
    }

    // Prepare update data
    const updateData: Prisma.BlogUpdateInput = {};

    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        throw validationError('Blog title cannot be empty', 'title');
      }
      updateData.title = input.title.trim();
    }

    if (input.slug !== undefined) {
      let slug = input.slug;
      // Ensure slug is URL-safe
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        slug = this.generateSlug(slug);
      }
      // Ensure slug is unique
      slug = await this.ensureUniqueSlug(slug, id);
      updateData.slug = slug;
    }

    if (input.content !== undefined) {
      if (!input.content || input.content.trim().length === 0) {
        throw validationError('Blog content cannot be empty', 'content');
      }
      updateData.content = input.content.trim();
    }

    if (input.excerpt !== undefined) {
      updateData.excerpt = input.excerpt?.trim() || null;
    }

    if (input.assetId !== undefined) {
      // Verify asset exists if provided
      if (input.assetId) {
        const asset = await this.prisma.asset.findUnique({
          where: { id: input.assetId },
        });

        if (!asset) {
          throw notFoundError('Asset not found');
        }
        updateData.asset = {
          connect: { id: input.assetId },
        };
      } else {
        updateData.asset = {
          disconnect: true,
        };
      }
    }

    // Handle categories update
    if (input.categories !== undefined) {
      // Delete existing categories and create new ones
      updateData.categories = {
        deleteMany: {},
        create: input.categories.map(name => ({
          name: name.trim(),
        })),
      };
    }

    try {
      const blog = await this.prisma.blog.update({
        where: { id },
        data: updateData,
        include: {
          categories: true,
          asset: true,
        },
      });

      return blog;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A blog post with this slug already exists', 'slug');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Blog post not found');
        }
      }
      throw error;
    }
  }

  /**
   * Publish a blog post (set published status and date)
   */
  async publishBlog(id: string): Promise<Blog> {
    // Check if blog exists
    const existingBlog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      throw notFoundError('Blog post not found');
    }

    try {
      const blog = await this.prisma.blog.update({
        where: { id },
        data: {
          published: true,
          publishedAt: new Date(),
        },
        include: {
          categories: true,
          asset: true,
        },
      });

      return blog;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Blog post not found');
        }
      }
      throw error;
    }
  }

  /**
   * Unpublish a blog post
   */
  async unpublishBlog(id: string): Promise<Blog> {
    // Check if blog exists
    const existingBlog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      throw notFoundError('Blog post not found');
    }

    try {
      const blog = await this.prisma.blog.update({
        where: { id },
        data: {
          published: false,
          publishedAt: null,
        },
        include: {
          categories: true,
          asset: true,
        },
      });

      return blog;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Blog post not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getBlog(id: string): Promise<Blog | null> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        categories: true,
        asset: true,
      },
    });

    return blog;
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        categories: true,
        asset: true,
      },
    });

    return blog;
  }

  /**
   * Get a list of blog posts with optional filtering
   */
  async getBlogs(options: BlogListOptions = {}): Promise<Blog[]> {
    const { take = 50, skip = 0, published } = options;

    const where: Prisma.BlogWhereInput = {};

    // Filter by published status if specified
    if (published !== undefined) {
      where.published = published;
    }

    const blogs = await this.prisma.blog.findMany({
      where,
      take,
      skip,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        categories: true,
        asset: true,
      },
    });

    return blogs;
  }
}
