import { z } from "zod";

// --- Banner Schemas ---
export const bannerSchema = z.object({
    name: z.string().min(1, "Banner name is required"),
    position: z.string().min(1, "Position is required"),
    enabled: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
    linkUrl: z.string().url("Invalid URL").nullable().optional(),
    desktopImageId: z.string().uuid().nullable().optional(),
    mobileImageId: z.string().uuid().nullable().optional(),
    collectionId: z.string().uuid().nullable().optional(),
});

export const updateBannerSchema = bannerSchema.partial();

// --- Blog Schemas ---
export const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().default(false),
    assetId: z.string().uuid().nullable().optional(),
});

export const updateBlogPostSchema = blogPostSchema.partial();

// --- Campaign Schemas ---
export const campaignSchema = z.object({
    name: z.string().min(1, "Campaign name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/),
    type: z.enum(["PROMOTION", "DISCOUNT", "NEWSLETTER"]),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
    metadata: z.record(z.any()).optional(),
});

export const updateCampaignSchema = campaignSchema.partial();
