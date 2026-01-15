import { PrismaClient, Banner, BannerPosition, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateBannerInput {
  title: string;
  slug?: string;
  position: BannerPosition;
  enabled?: boolean;
  sortOrder?: number;
  desktopImageId?: string | null;
  mobileImageId?: string | null;
  collectionId?: string | null;
}

export interface UpdateBannerInput {
  title?: string;
  slug?: string;
  position?: BannerPosition;
  enabled?: boolean;
  sortOrder?: number;
  desktopImageId?: string | null;
  mobileImageId?: string | null;
  collectionId?: string | null;
}

export interface BannerListOptions {
  take?: number;
  skip?: number;
  position?: BannerPosition;
  enabled?: boolean;
}

export class BannerService {
  constructor(private prisma: PrismaClient) { }

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
      return `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
      const existing = await this.prisma.banner.findUnique({
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
   * Create a new banner
   */
  async createBanner(input: CreateBannerInput): Promise<Banner> {
    // Validate required fields
    if (!input.title || input.title.trim().length === 0) {
      throw validationError('Banner title is required', 'title');
    }

    if (!input.position) {
      throw validationError('Banner position is required', 'position');
    }

    // Verify assets exist if provided
    if (input.desktopImageId) {
      const asset = await this.prisma.asset.findUnique({
        where: { id: input.desktopImageId },
      });

      if (!asset) {
        throw notFoundError('Desktop image asset not found');
      }
    }

    if (input.mobileImageId) {
      const asset = await this.prisma.asset.findUnique({
        where: { id: input.mobileImageId },
      });

      if (!asset) {
        throw notFoundError('Mobile image asset not found');
      }
    }

    // Verify collection exists if provided
    if (input.collectionId) {
      const collection = await this.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw notFoundError('Collection not found');
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
      const banner = await this.prisma.banner.create({
        data: {
          title: input.title.trim(),
          slug,
          position: input.position,
          enabled: input.enabled ?? true,
          sortOrder: input.sortOrder ?? 0,
          desktopImageId: input.desktopImageId || null,
          mobileImageId: input.mobileImageId || null,
          collectionId: input.collectionId || null,
        },
        include: {
          desktopImage: true,
          mobileImage: true,
          collection: true,
        },
      });

      return banner;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A banner with this slug already exists', 'slug');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing banner
   */
  async updateBanner(id: string, input: UpdateBannerInput): Promise<Banner> {
    // Check if banner exists
    const existingBanner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      throw notFoundError('Banner not found');
    }

    // Prepare update data
    const updateData: Prisma.BannerUpdateInput = {};

    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        throw validationError('Banner title cannot be empty', 'title');
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

    if (input.position !== undefined) {
      updateData.position = input.position;
    }

    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }

    if (input.sortOrder !== undefined) {
      updateData.sortOrder = input.sortOrder;
    }

    if (input.desktopImageId !== undefined) {
      // Verify asset exists if provided
      if (input.desktopImageId) {
        const asset = await this.prisma.asset.findUnique({
          where: { id: input.desktopImageId },
        });

        if (!asset) {
          throw notFoundError('Desktop image asset not found');
        }
        updateData.desktopImage = {
          connect: { id: input.desktopImageId },
        };
      } else {
        updateData.desktopImage = {
          disconnect: true,
        };
      }
    }

    if (input.mobileImageId !== undefined) {
      // Verify asset exists if provided
      if (input.mobileImageId) {
        const asset = await this.prisma.asset.findUnique({
          where: { id: input.mobileImageId },
        });

        if (!asset) {
          throw notFoundError('Mobile image asset not found');
        }
        updateData.mobileImage = {
          connect: { id: input.mobileImageId },
        };
      } else {
        updateData.mobileImage = {
          disconnect: true,
        };
      }
    }

    if (input.collectionId !== undefined) {
      // Verify collection exists if provided
      if (input.collectionId) {
        const collection = await this.prisma.collection.findUnique({
          where: { id: input.collectionId },
        });

        if (!collection) {
          throw notFoundError('Collection not found');
        }
        updateData.collection = {
          connect: { id: input.collectionId },
        };
      } else {
        updateData.collection = {
          disconnect: true,
        };
      }
    }
    try {
      const banner = await this.prisma.banner.update({
        where: { id },
        data: updateData,
        include: {
          desktopImage: true,
          mobileImage: true,
          collection: true,
        },
      });

      return banner;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A banner with this slug already exists', 'slug');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Banner not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single banner by ID
   */
  async getBanner(id: string): Promise<Banner | null> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: {
        desktopImage: true,
        mobileImage: true,
        collection: true,
      },
    });

    return banner;
  }

  /**
   * Get a single banner by slug
   */
  async getBannerBySlug(slug: string): Promise<Banner | null> {
    const banner = await this.prisma.banner.findUnique({
      where: { slug },
      include: {
        desktopImage: true,
        mobileImage: true,
        collection: true,
      },
    });

    return banner;
  }

  /**
   * Get a list of banners with optional filtering
   */
  async getBanners(options: BannerListOptions = {}): Promise<Banner[]> {
    const { take = 50, skip = 0, position, enabled } = options;

    const where: Prisma.BannerWhereInput = {};

    // Filter by position if specified
    if (position !== undefined) {
      where.position = position;
    }

    // Filter by enabled status if specified
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const banners = await this.prisma.banner.findMany({
      where,
      take,
      skip,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        desktopImage: true,
        mobileImage: true,
        collection: true,
      },
    });

    return banners;
  }
}
